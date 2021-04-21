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
require('dotenv').config({path: path.resolve("../dev.env") })
 
async function run() {
    
    try{

        let appRootDir = process.env.APP_ROOT_DIR || AppRoot.path;

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

        console.log(registryFile)

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

        let cliArgs = parser.parse_args()

        let contractName = (cliArgs["contract"] || "").trim();
        let contractMethod = (cliArgs["method"] || "").trim();

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

        //lets check if the contract exists 
        //lets check if the contract abi exists 

        let contractAbiFile = `${appRootDir}/build/contracts/${contractName}.json`

        if(!(await Utils.exists(contractAbiFile))){
            Utils.errorMsg(`Contract Abi file was not found at ${contractAbiFile}, make sure you run migration first`)
            return false;
        }

        contractAbiInfo = require(contractAbiFile); 

        let seedFileName = snakeCase(`${contractName}_${contractMethod}`);

        console.log(seedFileName)

        let seedFilePath = `${seedFilesDir}/${seedFileName}.js`;

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