import express from 'express'
import bodyParser from 'body-parser'
import bitcoinMessage from 'bitcoinjs-message'
import {Block, Blockchain} from './simpleChain'
import {NotrayaMessageManager, Star} from './notraryService'
import toNumber from "lodash/toNumber"
import round from "lodash/round"

const router = express()
const notrayaMessageManager = new NotrayaMessageManager()
const DEFAULT_VALIDATION_WINDOW = 5 * 60

const errorHandling = (res, err, statusCode, {key, code, message}) => {
  if (err) {
    console.log(`Error: ${key} - ${message}`, err)
    res.status(statusCode).send({ message, code })
  }
}

const initGet = (blockchain) => {
  // health check
  router.get('/', (req, res) => res.send('Working'))

  // get block by block height
  router.get('/block/:blockHeight', async (req, res) => {
    try {
      const {blockHeight} = req.params
      const block = await blockchain.getBlock(blockHeight)
      if (block) {
        res.send(block)
      } else {
        const error = new Error(`Block not exist, blockHeight:${blockHeight}`)
        error.code = 'BLOCK_NOT_EXIST'
        throw error
      }
    } catch (err) {
      if (err) {
        const {message, code} = err
        errorHandling(res, err, 400, {key: '/block/:blockHeight', message, code})
      }
    }
  })

  // /stars/address:[ADDRESS]
  router.get('/stars/address::address', async (req, res) => {
    try {
      const {address} = req.params
      blockchain.searchBlock({address}).then(result=>{
        res.send(result)
      })
    } catch (err) {
      if (err) {
        const {message, code} = err
        errorHandling(res, err, 400, {key: '/stars/address::address', message, code})
      }
    }
  })
  // /stars/hash:[HASH]
  router.get('/stars/hash::hash', async (req, res) => {
    try {
      const {hash} = req.params
      blockchain.searchBlock({hash}).then(result=>{
        res.send(result)
      })
    } catch (err) {
      if (err) {
        const {message, code} = err
        errorHandling(res, err, 400, {key: '/stars/hash::hash', message, code})
      }
    }
  })
}

const initPost = (blockchain) => {
  // create block
  router.post('/block', async (req, res) => {
    try {
        const {address, star} = req.body
        // handle star
        if(!address){
          const error = new Error("Missing require address")
          error.code = "MISSING_REQUIRE_FIELD"
          throw error
        }
        if(!star){
          const error = new Error("Missing require star")
          error.code = "MISSING_REQUIRE_FIELD"
          throw error
        }


        const  {ra:rightAscension, dec:declination, mag:magnitude, con:constellation, story} = star
        const starObject = new Star({rightAscension, declination, magnitude, constellation, story}).getStartObject()
        if(!starObject){
          const error = new Error("cannot create star")
          error.code = "FAIL_CREATE_STAR"
          throw error
        }

        const {value} = await blockchain.addBlock(new Block({
          address, star: starObject
        }))
        res.status(200)
        res.send(JSON.parse(value))
    } catch (err) {
      if (err) {
        const {message, code} = err
        errorHandling(res, err, 400, {key: '/block/:blockHeight', message, code})
      }
    }
  })

  // requestValidation
  router.post('/requestValidation', async (req, res) => {
    try {
      const {address} = req.body
      if (address) {
        const validationWindow = DEFAULT_VALIDATION_WINDOW
        const requestTimeStamp = new Date().getTime()
        const result = {
          address,
          requestTimeStamp,
          message: `${address}:${requestTimeStamp}:starRegistry`,
          validationWindow,
        }
        notrayaMessageManager.saveMessage(address, result)
        res.status(200)
        res.send(result)
      } else {
        const error = new Error('Missing require address')
        error.code = 'MISSING_REQUIRE_FIELD'
        throw error
      }
    } catch (err) {
      if (err) {
        const {message, code} = err
        errorHandling(res, err, 400, {key: '/requestValidation', message, code})
      }
    }
  })


  // /message-signature/validate
  router.post('/message-signature/validate', async (req, res) => {
    try {
      const {address, signature} = req.body
      if(!address){
        const error = new Error('Missing require address')
        error.code = 'MISSING_REQUIRE_FIELD'
        throw error
      }
      if(!signature){
        const error = new Error('Missing require signature')
        error.code = 'MISSING_REQUIRE_FIELD'
        throw error
      }

      notrayaMessageManager.getMessage(address).then(message=>{
        try{
          const validationWindow = (new Date().getTime() - toNumber(message.requestTimeStamp))/1000

          if(DEFAULT_VALIDATION_WINDOW >= validationWindow){
            const verifyResult = bitcoinMessage.verify(JSON.stringify(message), address, signature)
            const status = message
            message.messageSignature = verifyResult ? "valid" : "invalid"
            message.validationWindow = round(validationWindow)
            const result = {
              registerStar: true,
              status
            }
            res.status(200)
            res.send(result)
          }else{
            const error = new Error("Validation window expired")
            error.code = 'EXPIRED'
            throw error
          }
        }catch(err){
          const {message, code} = err
          errorHandling(res, err, 400, {key: '/message-signature/validate', message, code})
        }
      })

    } catch (err) {
      if (err) {
        const {message, code} = err
        errorHandling(res, err, 400, {key: '/message-signature/validate', message, code})
      }
    }
  })
}

const init = (port) => {
  // middleware
  router.use(bodyParser.json())

  const blockchain = new Blockchain()
  initGet(blockchain)
  initPost(blockchain)

  router.listen(port, () => console.log(`Example router listening on port ${port}!`))
}

module.exports = {
  init,
}
