import {Block, Blockchain} from './simpleChain'

const start = async () => {
  const blockchain = new Blockchain()

  const theLoop = (i) => {
    setTimeout(() => {
      const blockTest = new Block(`Test Block - ${i + 1}`)
      blockchain.addBlock(blockTest).then((result) => {
        console.log(result)
        i += 1
        if (i < 10) theLoop(i)
      })
    }, 10000)
  }
  theLoop(0)
}

start()
