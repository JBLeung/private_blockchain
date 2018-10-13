import express from 'express'
import bodyParser from 'body-parser'
import {Block, Blockchain} from './simpleChain'

const router = express()

const initGet = (blockchain) => {
  // health check
  router.get('/', (req, res) => res.send('Working'))

  // get block by block height
  router.get('/block/:blockHeight', async (req, res, next) => {
    try {
      const {blockHeight} = req.params
      const block = await blockchain.getBlock(blockHeight)
      if (block) {
        res.send(block)
      } else {
        throw new Error(`Block not exist, blockHeight:${blockHeight}`)
      }
    } catch (err) {
      if (err) {
        console.log('Error: /block/:blockHeight', err)
        next(err.message)
      }
    }
  })
}

const initPost = (blockchain) => {
  // create block
  router.post('/block', async (req, res, next) => {
    try {
      const {body} = req.body
      if (body) {
        const {value} = await blockchain.addBlock(new Block(body))
        res.status(200)
        res.send(JSON.parse(value))
      } else {
        res.status(400)
        throw new Error('Missing require body')
      }
    } catch (err) {
      if (err) {
        next(err.message)
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

