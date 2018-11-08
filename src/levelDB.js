const level = require('level')

class levelDB {
  constructor(dir) {
    this.db = level(dir)
  }

  // Add data to levelDB with key/value pair
  addLevelDBData(key, value) {
    return new Promise((resolve, reject) => {
      this.db.put(key, value, (err) => {
        if (err) {
          console.log(`Key ${key} submission failed`, err)
          return reject(err)
        }
        return resolve({key, value})
      })
    })
  }

  // Get data from levelDB with key
  getLevelDBData(key) {
    return new Promise((resolve, reject) => {
      this.db.get(key, (err, value) => {
        if (err) return reject(err)
        return resolve(value)
      })
    })
  }

  // Add data to levelDB with value
  addDataToLevelDB(value) {
    let i = 0
    this.db.createReadStream().on('data', (data) => {
      i++
    }).on('error', err => console.log('Unable to read data stream!', err)).on('close', () => {
      console.log(`Block #${i}`)
      this.addLevelDBData(i, value)
    })
  }

  // get all data in the chain
  getChain() {
    const chain = []
    return new Promise((resolve, reject) => {
      this.db.createReadStream()
        .on('data', (data) => {
          chain.push(data)
        })
        .on('error', (err) => {
          reject(err)
        })
        .on('close', () => {
          resolve(chain)
        })
    }).then()
  }

  // remove data by key
  deleteData(key){
    return new Promise((resolve, reject)=>{
      this.db.del(key, err=>{
        if(err){
          reject(err)
        }else{
          resolve(true)
        }
      })
    })
  }
}

export default levelDB
