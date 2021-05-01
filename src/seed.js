#!/usr/bin/env node 

/**
 * LibertyPie (https://libertypie.com)
 * @author LibertyPie <hello@libertypie.com>
 * @license MIT
 */
 
const process = require("process");
const web3 = require("web3")
const Web3 = require("web3")
const path = require("path");
var   Web3Net = require('web3-net');
const Utils = require("./classes/Utils");
const AppRoot = require("app-root-path")
const fps = require("fs/promises")
require('dotenv').config({path: path.resolve(path.dirname(__dirname),"dev.env") })


module.exports = async ({
    devEnv,
    network,
    silentMode
}) => {

    let appRootDir = process.env.APP_ROOT_DIR || AppRoot.path;

    let devConfigFile = "";
    let devEnvConfig = ""; 


    let seedsDir = appRootDir+"/seeds";

    const seederRegistry = require(seedsDir+"/registry");

    //const truffleConfig = require(appRootDir+"/truffle-config");

    if(!['truffle','hardhat'].includes(devEnv)){
        Utils.errorMsg(`Unknown development environment, supported are truffle & hardhat`)
        return false;
    }

    devEnvConfigFile = (devEnv == 'truffle') ? 'truffle-config.js' : 'hardhat.config.js';

    devConfigFile = appRootDir+"/"+devEnvConfigFile

    if(!(await Utils.exists(devConfigFile))){
        Utils.errorMsg(`Config file ${devConfigFile} was not found`)
        return false;
    }

    devEnvConfig =  Utils.fetchAndParseJson(devConfigFile);

    console.log(devEnvConfig)

    silentModeFlag = (silentMode) ? 1 : 0;

    process.env['SILENT_MODE'] = silentModeFlag;


    //lets get the network profile 
    let networks = truffleConfig.networks || {}

    if(!(network in networks)){
        Utils.errorMsg(`Network '${network}' was not found in truffle-config`)
        return false;
    }

    let networkInfo = networks[network];

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
    let networkId = networkInfo.network_id || ""
    
    if(networkId.length == 0 || networkId == "*"){
        networkId = await web3Net.getId();
    }
    

    //console.log("networkId ==>> ", networkId)

    Utils.successMsg(`Detected Network Name: ${network} Id: ${networkId}`)
    //let _seeder = new Seeder();

    //lets get the registry
    //let seedRegistryArray = _seeder.getRegistry();

    let web3Account = web3.currentProvider.addresses[0];

    for(let seedFileName of seederRegistry){
        
        seedFileName = (seedFileName || "").trim();

        if(seedFileName.length == 0){
            console.log(registryItem)
            Utils.errorMsg(`Registry seed file missing`);
            return false;
        }

        let seedFile = `${seedsDir}/files/networks/${network}/${seedFileName}.js`;

        if(!(await Utils.exists(seedFile))){
            seedFile = `${seedsDir}/files/${seedFileName}.js`;
        }

        Utils.infoMsg(`Loading Seed File: ${seedFile}`)

        //lets get the file 
        let seedInfo = require(seedFile)
        
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

        //let deployedBytecode = contractInfo.deployedBytecode;

        //console.log("deployedBytecode ===>>> ", deployedBytecode)

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
            web3Account,
            contractInfo
        });

        if(seedResult.isError()){
            Utils.errorMsg(seedResult.message)
           console.log(seedResult)
        } 


        Utils.successMsg(seedResult.msg)

        Utils.infoMsg(JSON.stringify(seedResult))

    } //end for 

    process.exit()
}
