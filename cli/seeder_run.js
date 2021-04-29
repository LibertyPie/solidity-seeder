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

   let args= parser.parse_args()

   //let contract = args["contract"];
   

   //if(contract == null || contract.toString().trim().length == 0 || contract.toLowerCase() == "all"){
    //   contract = "";
   //}

   let network = args["network"];

   let silentMode = false;
   
   seed({network, silentMode})
}

run();