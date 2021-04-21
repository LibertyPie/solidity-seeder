# Truffle Seeder
Easily seed initial data to smart contracts using this npm package

## Installation

### via npm

```sh
npm i --save @libertypie/truffle-seeder
```

### via yarn

```sh
yarn add  @libertypie/truffle-seeder
```

Edit your package.json file and add the command to scripts section

```json 
  "scripts": {
    "seeder-init": "node_modules/truffle-seeder/src/init.js",
    "seeder-seed": "node_modules/truffle-seeder/src/seed.js",
  }
```

## Usage

#### Create new seed file 
```sh
yarn seeder-init --contract HelloContract --method SetHelloMethod
```

the --contract  is the contract you or targeting (eg. HelloContract)
and --method is the te method of function in the targeted contract 

after the seed files has been created, check the seeds folder in your project root and edit the file in the files sub folder

below is a sample of how a seed file looks like 

```js
module.exports = {
    contract: 'HelloContract',
    method:   'SetHelloMethod',
    data: [
        /* 
         * to seed args multiple times, add extra arrays
         ['arg1','arg2',...'argn'],
         ['arg1', 'arg2'...'argn']
        */
    ]
}
```
You add the args using an array inside the data array  as shown 

#### Seed File Options

##### contract:
The name of the contract you are targeting, it should exist in truffle build folder

##### method: 
The method or function in the targetted contract where the data will be fed to 

##### processor: 
The processor is the function responsible for processing the data and calling the method/function from the contract
The default processor is located at [src/processors/StandardSeedProcessor.js](src/processors/StandardSeedProcessor.js)

below is a seed file with a custom processor

```js 
module.exports = {
    contract: 'HelloContract',
    method:   'SetHelloMethod',
    processor: customDataProcessor,
    data: [
        /* 
         * to seed args multiple times, add extra arrays
         ['arg1','arg2',...'argn'],
         ['arg1', 'arg2'...'argn']
        */
    ]
}

// customDataProcessor
customDataProcessor = async ({
    contractName,
    contractInstance, 
    contractMethod, 
    argsArray,
    networkId,
    web3,
    web3Account
}) => {
  //process and insert data here 
}
```

#### Seeding the data 
 To seed the data to the contract's method, you will run the command below

 ```sh 
  yarn seeder-seed 
 ```

 ## About
 The npm package is developed maintained by the team at [LibertyPie Project] (https://libertypie.com)

 ## Contribution
 To contribute, kindly fork the project, at project root create a dev.env file, insert APP_ROOT_DIR pointint to your truffle project where testing will be done,
 example: 

 ```txt
  APP_ROOT_DIR=/path/to/truffle/solidity/project
 ```