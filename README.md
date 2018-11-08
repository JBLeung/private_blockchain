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
After you start, there are 3 general api endpoint created.

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
### Notrary Server
Also, there are 5 api endpoint created for notrary service.
1. POST requestValidation `localhost:8000/requestValidation`
    ```
    curl -X POST \
      http://localhost:8000/requestValidation \
      -H 'Content-Type: application/json' \
      -H 'Postman-Token: 824a87ae-5cad-497d-a5ff-1ae15ebace9c' \
      -H 'cache-control: no-cache' \
      -d '{
    	"address": "<address>"
    }'
    ``` 
2. POST message-signature/validate `localhost:8000/message-signature/validate`
    ```
    curl -X POST \
      http://localhost:8000/message-signature/validate \
      -H 'Content-Type: application/json' \
      -H 'Postman-Token: e4d6ce3c-a8d9-455d-bc34-124b0849a8f1' \
      -H 'cache-control: no-cache' \
      -d '{
    	"address": "<address>",
    	"signature": "<signature>"
    }'
    ```
3. POST create Star `localhost:8000/block`
    ```
    curl -X POST \
      http://localhost:8000/block \
      -H 'Content-Type: application/json' \
      -H 'Postman-Token: 7fbe7b4b-9d03-41e5-a3a2-87f7bbbe95a6' \
      -H 'cache-control: no-cache' \
      -d '{
      "address": "<address>",
      "star": {
        "dec": "-26° 29'\'' 24.9",
        "ra": "16h 29m 1.0s",
        "story": "Found star using https://www.google.com/sky/"
      }
    }'
    ```
4. GET get Star by address `localhost:8000/stars/address:[ADDRESS]`
    ```
    curl -X GET \
      http://localhost:8000/stars/address:<address> \
      -H 'Postman-Token: e62c102e-f609-435d-ab0e-6697e0f974a4' \
      -H 'cache-control: no-cache'
    ```
5. GET get Star by block hash `localhost:8000/stars/hash:[hash]`
    ```
    curl -X GET \
      http://localhost:8000/stars/hash:<hash> \
      -H 'Postman-Token: e62c102e-f609-435d-ab0e-6697e0f974a4' \
      -H 'cache-control: no-cache'
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
* [Bitcoinjs-Message](https://github.com/bitcoinjs/bitcoinjs-message) - Sign/Verify Bitcoin message


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
