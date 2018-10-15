# Simple private blockchain


## Getting Started

for development start by:
1. `npm install`
2. `npm run dev`

for build:
1. `npm install`
2. `npm run build`


### Prerequisites

run `npm install`

### Installing

for development start by:
1. `npm install`
2. `npm run dev`

for build:
1. `npm install`
2. `npm run build`


## Running the tests

The default port is 8000.
After you start, there are 3 api endpoint created.

1. GET health check `localhost:8000`
2. GET get block by block height `localhost:8000/block/:blockheight`
3. POST create block `localhost:8000/block`
    ```
    curl -X POST \
      http://localhost:8000/block \
      -H 'Content-Type: application/json' \
      -H 'cache-control: no-cache' \
      -d '{
    	"body": "dummy body"
    }'
    ```  

### Break down into end to end tests
N/A

### And coding style tests
Used ES6.
Please see detail in .eslintrc

## Deployment
`npm run dev`

## Built With

* [crypto-js](https://github.com/brix/crypto-js) - Block content hashing
* [Express](https://github.com/expressjs/express) - API library
* [LevelDB](https://github.com/google/leveldb) - Used store blockchain data
* [Lodash](https://github.com/lodash/lodash) - Utilities library for js easier by taking the hassle out of working with arrays, numbers, objects, strings, etc


## Contributing
N/A

## Versioning
N/A

## Authors
Jeff

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc
