import split from 'lodash/split'
import isNumber from 'lodash/isNumber'
import LevelDBManager from './levelDB'
import round from 'lodash/round'
import bitcoinMessage from 'bitcoinjs-message'
import toNumber from 'lodash/toNumber'
import get from 'lodash/get'
import forEach from 'lodash/forEach'
import isArray from 'lodash/isArray'

const message3rdKey = 'starRegistry'
const messageSeparator = ':'
const DEFAULT_VALIDATION_WINDOW = 5 * 60

class Star{
  constructor(data){
    const {rightAscension, declination, magnitude, constellation, story} = data
    this.rightAscension = rightAscension
    this.declination = declination
    this.magnitude = magnitude
    this.constellation = constellation
    this.story = story
  }

  getStartObject(){
    if(!this.rightAscension || !this.declination || !this.story) return false
    if(this.story.length > 500) return false

    const hexStory = new Buffer(this.story).toString('hex')

    return{
      ra: this.rightAscension,
      dec: this.declination,
      mag: this.magnitude,
      con: this.constellation,
      story: hexStory
    }
  }

}

class NotrayaMessageManager {
  constructor(){
    this.levelDB = new LevelDBManager('./notrayaMessage')
  }
  validMessage(messageString){
    const content = split(messageString, messageSeparator)
    if(content.length != 3) return false
    if(!isNumber(content[1])) return false
    if(content[2] !== message3rdKey) return false
    return true
  }
  decodeMessageString(messageString){
    if(this.validMessage(messageString)){
      const content = split(messageString, messageSeparator)
      return {
        address: content[0],
        timeStamp: content[1]
      }
    }
    return {}
  }
  saveMessage(address, message) {
    this.levelDB.addLevelDBData(address, JSON.stringify(message)).then()
  }
  getMessage(address){
    return new Promise((resolve, reject)=>{
      this.levelDB.getLevelDBData(address).then(message=>{
        try{
          resolve(JSON.parse(message))
        }catch(err){
          reject(err)
        }
      })
    })
  }
  getMessageValidation(messageObject, address, signature){
    const validationWindow = this.getValidationWindow(messageObject.requestTimeStamp)

    if(validationWindow > 0){
      const verifyResult = bitcoinMessage.verify(get(messageObject,'message',''), address, signature)
      messageObject.messageSignature = verifyResult ? "valid" : "invalid"
      messageObject.validationWindow = round(validationWindow)
      return messageObject
    }
    return false
  }
  getValidatedKey(address){
    return `validated-${address}`
  }
  saveValidatedAddress(address, requestTimeStamp){
    this.levelDB.addLevelDBData(this.getValidatedKey(address), JSON.stringify({requestTimeStamp})).then()
  }
  checkAddressIsValidated(address){
    return new Promise((resolve, reject)=>{
      const validatedDataKey = this.getValidatedKey(address)
      this.levelDB.getLevelDBData(validatedDataKey).then(validatedAddressObject=>{
        if(validatedAddressObject){
          try{
            const {requestTimeStamp} = JSON.parse(validatedAddressObject)
            const isValidated = this.getValidationWindow(requestTimeStamp) > 0
            this.levelDB.deleteData(validatedDataKey).then()
            resolve(isValidated)
          }catch(err){
            reject(err)
          }
        }else{
          resolve(false)
        }
      }).catch(err=>{
        resolve(false)
      })
    })
  }
  getValidationWindow(requestTimeStamp){
    const validationWindow = DEFAULT_VALIDATION_WINDOW - (new Date().getTime() - toNumber(requestTimeStamp))/1000
    if(validationWindow > 0) return validationWindow
    return false
  }
  getDefaultValidationWindow(){
    return DEFAULT_VALIDATION_WINDOW
  }
  formatStarObject(objects){
    if(!isArray(objects)) objects = [objects]
    forEach(objects, object=>{
      const hexStory = get(object, 'body.star.story')
      if(hexStory) object.body.star.story = new Buffer.from(hexStory, 'hex').toString()
    })
  }
}

module.exports = {
  NotrayaMessageManager, Star
}
