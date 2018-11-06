import split from 'lodash/split'
import isNumber from 'lodash/isNumber'
import LevelDBManager from './levelDB'

const message3rdKey = 'starRegistry'
const messageSeparator = ':'

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
    if(this.story.length > 250) return false

    const hexStory = new Buffer(this.story).toString('hex')
    if(hexStory.length > 500) return false

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
  saveMessage(address, message){
    this.levelDB.addLevelDBData(address, JSON.stringify(message)).then(()=>{
      this.levelDB.getLevelDBData(address).then(mm=>{
        console.log(`check:001 mm` , mm)
      })
    })
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
}

module.exports = {
  NotrayaMessageManager, Star
}
