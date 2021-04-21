#!/usr/bin/env node 

/**
 * LibertyPie (https://libertypie.com)
 * @author LibertyPie <hello@libertypie.com>
 * @license MIT
 */
 
const ethers = require("ethers");
const process = require("process");
const colors = require("colors");
const web3 = require("web3")
const Web3 = require("web3")
const { ArgumentParser } = require('argparse');
const { version } = require('../package.json');
const path = require("path");
var   Web3Net = require('web3-net');
const Utils = require("./classes/Utils");
const AppRoot = require("app-root-path")
require('dotenv').config({path: path.resolve("../dev.env") })


run = async () => {

    let appRootDir = process.env.APP_ROOT_DIR || AppRoot.path;

    const seederRegistry = require(appRootDir+"/seed/registry");

    const truffleConfig = require(appRootDir+"/truffle-config");


    const parser = new ArgumentParser({
      description: 'Seed migration'
    });
     
    parser.add_argument('-v', '--version', { action: 'version', version });
    parser.add_argument('-c', '--contract', { default: 'all', help: 'the contract to seed, default is all' });
    parser.add_argument('-n', '--network', { default: 'development', help: 'the network in truffle-config to use, default is development' });

    let args= parser.parse_args()

    let contract = args["contract"];
    

    if(contract == null || contract.toString().trim().length == 0 || contract.toLowerCase() == "all"){
        contract = "";
    }

    let netName = args["network"];
    
    //lets get the network profile 
    let networks = truffleConfig.networks || {}

    if(!(netName in networks)){
        Utils.errorMsg(`Network '${netName}' was not found in truffle-config`)
        return false;
    }

    let networkInfo = networks[netName];

    let provider;

    if('provider' in networkInfo){
        provider = networkInfo.provider();
    } else {

       let protocol = (networkInfo.port == 443) ? "https" : "http";
       provider = `${protocol}://${networkInfo.host}:${networkInfo.port}`;
    }


    //return false;

    let web3 = new Web3(provider);
    let web3Net = new Web3Net(provider);

    //lets get network id
    let networkId = await web3Net.getId();

    //let _seeder = new Seeder();

    //lets get the registry
    //let seedRegistryArray = _seeder.getRegistry();

    let web3Account = web3.currentProvider.addresses[0];

    for(let seedFileName of seederRegistry){
        
        let seedFile = (seedFileName || "").trim();

        if(seedFile.length == 0){
            console.log(registryItem)
            Utils.errorMsg(`Registry seed file missing`);
            return false;
        }

        //lets get the file 
        let seedInfo = require(`${appRootDir}/seeds/files/${seedFile}`)

       //lets get 
       let contractName = seedInfo.contract || "";
       let contractMethod = seedInfo.method || "";
       let seedProcessor = seedInfo.processor || "standardSeedProcessor";
       let seedDataArray = seedInfo.data || []
       

        if(seedProcessor == "standardSeedProcessor"){

            if(contractName.length == 0){ throw new Error(`Unknown seed contract ${contractName}`) }

            if(contractMethod.length == 0){ throw new Error(`Unknown seed method ${contractMethod}`) } 

            seedProcessor = require("./processors/StandardSeedProcessor");
        }

        let contractInfoFile = `${appRootDir}/build/contracts/${contractName}.json`;

        if(!(await Utils.exists(contractInfoFile))){
            Utils.errorMsg(`Contract Info & Abi file was not found at ${contractInfoFile}, make sure you run migration first`)
            return false;
        }
        
        let contractInfo = require(contractInfoFile);

        let contractAbi = contractInfo.abi;

        let cNetworks = contractInfo.networks || {};

        let cNetworkInfo = cNetworks[networkId.toString()] || {}

        if(Object.keys(cNetworkInfo).length == 0){
            Utils.errorMsg(`It seems the contract '${contractName}' has not been deployed, kindly deploy contract before seeding the data`)
            return false;
        }

        let contractAddress = cNetworkInfo.address;

        Utils.infoMsg(`Seeding data to contract ${contractName} at ${contractAddress}`)

        //lets load the contract in web3js
        let contractInstance = new web3.eth.Contract(contractAbi,contractAddress);

        //console.log(contractObj)
        //contractObj,contractMethod, seedDataArray

        //lets methodName
        let seedResult = await seedProcessor({
            contractName,
            contractInstance, 
            contractMethod,
            argsArray: seedDataArray,
            networkId,
            web3,
            web3Account
        });

        if(seedResult.isError()){
            Utils.errorMsg(seedResult.message)
           console.log(seedResult)
        } 


        Utils.successMsg(seedResult.msg)
        console.log(JSON.stringify(seedResult))
    } //end for 

    process.exit()
}


run();