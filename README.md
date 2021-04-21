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

