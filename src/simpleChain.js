/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  ========================================================= */


import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import forEach from 'lodash/forEach'
import SHA256 from 'crypto-js/sha256'
import LevelDBManager from './levelDB'


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  =============================================== */

class Block {
  constructor(data) {
    this.hash = ''
    this.height = 0
    this.body = data
    this.time = 0
    this.previousBlockHash = ''
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================ */

class Blockchain {
  constructor() {
    this.levelDB = new LevelDBManager('./chaindata')
    this.validateChain().then(() => {
      this.getChain().then((chain) => {
        if (isEmpty(chain)) this.addBlock(new Block('First block in the chain - Genesis block')).then()
      })
    })
  }

  async getChain() {
    return this.levelDB.getChain()
  }

  // Add new block
  async addBlock(newBlock) {
    const chain = await this.getChain()
    const currnetChainHeight = chain.length
    // Block height
    newBlock.height = currnetChainHeight

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0, -3)
    // previous block hash
    if (currnetChainHeight > 0) {
      const lastBlock = JSON.parse(get(chain[currnetChainHeight - 1], 'value', false))
      newBlock.previousBlockHash = lastBlock ? get(lastBlock, 'hash', '') : ''
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
    // Adding block object to chain

    return this.levelDB.addLevelDBData(newBlock.height, JSON.stringify(newBlock))
  }

  // Get block height
  async getBlockHeight() {
    const chain = await this.getChain()
    return chain.length - 1
  }
  // get block
  async getBlock(key) {
    // return object as a single string
    const blockString = await this.levelDB.getLevelDBData(key)
    return JSON.parse(blockString)
  }

  // validate block
  async validateBlock(key) {
    // get block object
    const block = await this.getBlock(key)
    // get block hash
    const blockHash = block.hash
    // remove block hash to test block integrity
    block.hash = ''
    // generate block hash
    const validBlockHash = SHA256(JSON.stringify(block)).toString()
    // Compare
    if (blockHash === validBlockHash) {
      return true
    }
    console.log(`Block #${key} invalid hash:\n${blockHash}<>${validBlockHash}`)
    return false
  }
  // Validate blockchain
  async validateChain() {
    const errorLog = []
    const chain = await this.getChain()
    const chainHeight = chain.length
    const validatePromises = []
    for (let i = 0; i < chainHeight; i += 1) {
      // validate block
      validatePromises.push(this.validateBlock(i))
    }

    Promise.all(validatePromises).then((results) => {
      forEach(results, (result, i) => {
        if (!result)errorLog.push(i)
        // compare blocks hash link
        const block = JSON.parse(get(chain[i], 'value', false))
        if (block) {
          const blockHash = get(block, 'hash')
          if (i < chainHeight - 1) {
            const previousBlock = JSON.parse(get(chain[i + 1], 'value', false))
            const previousBlockHash = get(previousBlock, 'previousBlockHash')
            if (blockHash !== previousBlockHash) {
              errorLog.push(i)
            }
          }
        } else {
          errorLog.push(i)
        }
      })

      if (errorLog.length > 0) {
        console.log(`Block errors = ${errorLog.length}`)
        console.log(`Blocks: ${errorLog}`)
      } else {
        console.log('No errors detected')
      }
    }).catch((err) => {
      console.log('validateChain:', err)
    })
  }
}

module.exports = {
  Block, Blockchain,
}
