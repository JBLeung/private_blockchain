import express from 'express'
import bodyParser from 'body-parser'
import bitcoinMessage from 'bitcoinjs-message'
import {Block, Blockchain} from './simpleChain'
import {NotrayaMessageManager} from './notraryService'
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
}

const initPost = (blockchain) => {
  // create block
  router.post('/block', async (req, res) => {
    try {
      const {body} = req.body
      if (body) {
        const {value} = await blockchain.addBlock(new Block(body))
        res.status(200)
        res.send(JSON.parse(value))
      } else {
        const error = new Error('Missing require body')
        error.code = 'EMPTY_BODY'
        throw error
      }
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
