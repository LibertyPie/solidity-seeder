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