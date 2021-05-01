#!/usr/bin/env node 

/**
 * LibertyPie (https://libertypie.com)
 * @author LibertyPie <hello@libertypie.com>
 * @license MIT
 */
 
 const ethers = require("ethers");
 const process = require("process");
 const Web3 = require("web3")
 const slugify = require("slugify");
 const { ArgumentParser } = require('argparse');
 const { version } = require('../package.json');
 const path = require("path");
 const Utils = require("./classes/Utils");
 const AppRoot = require("app-root-path")
 var inquirer = require('inquirer');
const fsp = require("fs").promises
const snakeCase = require("snake-case").snakeCase;
require('dotenv').config({path: path.resolve(path.dirname(__dirname),"dev.env") })
 
async function run() {
    
    try{

        let appRootDir = process.env.APP_ROOT_DIR || AppRoot.path;

        let devEnvConfigName = "";
        let devConfigFile = "";
        let devEnvConfig = ""; 


        //lets check if seed directory exists 
        let seedsDir = `${appRootDir}/seeds`

        if(!(await Utils.exists(seedsDir))){
             await fsp.mkdir(seedsDir,{ recursive: true })
        }

        let seedFilesDir = `${seedsDir}/files`;

        if(!(await Utils.exists(seedFilesDir))){ await fsp.mkdir(seedFilesDir,{ recursive: true }) }
        
        let seedProcessorsDir = `${seedsDir}/processors`;

        if(!(await Utils.exists(seedProcessorsDir))){ await fsp.mkdir(seedProcessorsDir,{ recursive: true }) }
        

        //lets get the registry file 
        let registryFile = `${seedsDir}/registry.json`

        //console.log(registryFile)

        let registryData = []
        
        if((await Utils.exists(registryFile))){
            registryData = require(registryFile);
        }

        const parser = new ArgumentParser({
            description: 'Seed migration'
        });
        
        parser.add_argument('-v', '--version', { action: 'version', version });
        parser.add_argument('-c', '--contract', {  help: 'the contract name' });
        parser.add_argument('-m', '--method', {  help: 'the contract method which we are seeding to'});
        parser.add_argument('-n', '--network', {  help: 'the network name to target, leave empty for all network ids'});
        parser.add_argument('-e', '--env', {  help: 'Your development environment (truffle, hardhat), default is truffle'});

        let cliArgs = parser.parse_args()

        let contractName = (cliArgs["contract"] || "").trim();
        let contractMethod = (cliArgs["method"] || "").trim();
        let networkName = (cliArgs["network"] || "").trim();
        let devEnv = (cliArgs["env"] || "").trim();

        //if dev environment was not provided
        if(devEnv.length == 0){
            
            let devEnvConfigData = await  inquirer.prompt({
                type: 'list',
                choices: [ "truffle", "hardhat" ],
                name: 'Development Environment', 
                message: Utils.successMsg("Development Environment: ") 
            })

            devEnv = (devEnvConfigData["Development Environment"] || "").trim();
        } ///end if 

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

      
        devEnvConfig =  require(devConfigFile);

        //if the contract name is empty, lets request it
        if(contractName.length == 0){
            let contractNameData = await  inquirer.prompt({type: 'input', name: 'Contract Name', message: Utils.successMsg("Target contract name: ") })

            contractName = (contractNameData["Contract Name"] || "").trim();

            if(contractName.length == 0){
                Utils.errorMsg(`Target contract name is required`)
                return false;
            }
        } //end if 


        if(contractMethod.length == 0){
            let contractMethodParam = await  inquirer.prompt({type: 'input', name: 'Contract Method', message: Utils.successMsg("Target contract's method or function: ") })

            contractMethod = (contractMethodParam["Contract Method"] || "").trim()

            if(contractMethod.length == 0){
                Utils.errorMsg(`Contract method is required`)
            }
        }

        if(networkName.length == 0){
            
            //lets get the networks from config file
            let configNetworks = Object.keys(devEnvConfig.networks  || {})

            /*if(configNetworks.length == 0){
                Utils.errorMsg(`No networks found in ${devConfigFile}, atleast add one to continue`)
                return false;
            }*/

            configNetworks.unshift("All Networks")
  
            let networkNameParam = await  inquirer.prompt({
                type: 'list',
                choices: configNetworks,
                name: 'Network Name', 
                message: Utils.successMsg("Target Network Name,  (leave empty for all networks): ") 
            })

            networkName = (networkNameParam["Network Name"] || "").trim()

            networkName = networkName.replace(" ","_").toLowerCase()

            if(networkName == "all_networks") networkName = "";
        }

        if(networkName.trim().length > 0){

            //lets get the network profile 
            let networks = devEnvConfig.networks || {}

            if(!(networkName in networks)){
                Utils.errorMsg(`Network '${networkName}' was not found in truffle-config, aborting`)
                return false;
            }
        }

        //lets check if the contract exists 
        //lets check if the contract abi exists 

        let contractAbiFile; 

        if(devEnv == 'truffle') {
            contractAbiFile = `${appRootDir}/build/contracts/${contractName}.json`
        } else {
            let abiSubDir = (networkName.length == 0) ? "hardhat" : networkName;
            contractAbiFile =  `${appRootDir}/deployments/${abiSubDir}/${contractName}.json`
        }

        if(!(await Utils.exists(contractAbiFile))){
            Utils.errorMsg(`Contract Abi file was not found at ${contractAbiFile}, make sure you compile the contract first`)
            return false;
        }

        contractAbiInfo = require(contractAbiFile); 

        let seedFileName = snakeCase(`${contractName}_${contractMethod}`);


        let seedFilePath = `${seedFilesDir}/${seedFileName}.js`;

        //lets check i network id isnt null, lets check or create dir
        if(networkName.length > 0){

            let seedFilePathWithNetName = `${seedFilesDir}/networks/${networkName}/`;

            if(!(await Utils.exists(seedFilePathWithNetName))){
                await fsp.mkdir(seedFilePathWithNetName,{recursive: true})
            }

            seedFilePath = `${seedFilePathWithNetName}/${seedFileName}.js`;
        }


        if((await Utils.exists(seedFilePath))){
            Utils.errorMsg(`Seed File already exists at ${seedFilePath}, delete it first`)
            return false;
        }

        //lets add the seed file to the registry
        if(!registryData.includes(seedFileName)){
            registryData.push(seedFileName)
            Utils.successMsg(`Adding seedFile ${seedFileName} to registry: ${registryFile}`)
            await fsp.writeFile(registryFile,JSON.stringify(registryData));
        }


        Utils.successMsg(`Creating seed file at: ${seedFilePath}`)

        let seedFileTemplate = getSeedFileTemplate(contractName,contractMethod,seedFileName);

        await fsp.writeFile(seedFilePath,seedFileTemplate);
        
        Utils.successMsg(`Seed file created successfully, kindly open the file and edit it at: ${seedFilePath}`)

    } catch (e) {
        Utils.errorMsg(e)
        console.log(e.stack)
    } 

}

function getSeedFileTemplate(contractName,contractMethod,seedFileName){
return `
/**
 * LibertyPie (https://libertypie.com)
 * @author LibertyPie <hello@libertypie.com>
 * ${seedFileName}.js
 */
module.exports = {
    contract: '${contractName}',
    method:   '${contractMethod}',
    data: [
        /* 
         * to seed args multiple times, add extra arrays
         ['arg1','arg2',...'argn'],
         ['arg1', 'arg2'...'argn']
        */
    ]
}`.trim();

}

run();