#!/usr/bin/env node 

/**
 * LibertyPie (https://libertypie.com)
 * @author LibertyPie <hello@libertypie.com>
 * @license MIT
 */

 const { ArgumentParser } = require('argparse');
 const { version } = require('../package.json');
const seed = require("../src/seed")
 
run = async () => {


    const parser = new ArgumentParser({
      description: 'Seed migration'
    });
     

   parser.add_argument('-v', '--version', { action: 'version', version });
   //parser.add_argument('-c', '--contract', { default: 'all', help: 'the contract to seed, default is all' });
   parser.add_argument('-n', '--network', { default: 'development', help: 'the network in truffle-config to use, default is development' });
   
   parser.add_argument('-e', '--env', { help: 'The development evnviroment, its either truffle or hardhat' });


   let args= parser.parse_args()

   let devEnv = args["env"];

   if(!['truffle','hardhat'].includes(devEnv)){
    Utils.errorMsg(`Unknown development environment, supported are truffle & hardhat`)
    return false;
    }

   let network = args["network"];

   let silentMode = false;
   
   seed({devEnv, network, silentMode})
}

run();