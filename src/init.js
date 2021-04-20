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
require('dotenv').config({path: path.resolve("../dev.env") })
 
async function run() {
    
    try{

        let appRootDir = process.env.APP_ROOT_DIR || AppRoot.path;

        //lets check if seed directory exists 
        let seedsDir = `${appRootDir}/seeds`

        if(!(await Utils.exists(seedsDir))){
        // await fsp.mkdir(seedsDir,{ recursive: true })
            await fsp.mkdir(`${seedsDir}/files`,{ recursive: true })
            await fsp.mkdir(`${seedsDir}/processors`,{ recursive: true })
        }

        //lets get the registry file 
        let registryFile = `${seedsDir}/registry.js`

        console.log(registryFile)

        let registryData = {}
        
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
            contractName = await  inquirer.prompt({type: 'input', name: 'Contract Name', message: Utils.successMsg("Target contract name: ") })
        } //end if 

        if(contractMethod.length == 0){
            contractMethod = await  inquirer.prompt({type: 'input', name: 'Contract Method', message: Utils.successMsg("Target contract's method or function: ") })
        }

        //lets check if the contract exists 
        //lets check if the contract abi exists 

        let contractAbiFile = `${appRootDir}/build/contracts/${contractName}.json`

        if(!(await Utils.exists(contractAbiFile))){
            Utils.errorMsg(`Contract Abi file was not found at ${contractAbiFile}, make sure you run migration first`)
            return false;
        }

        contractAbiInfo = require(contractAbiFile); 

        let seedFileName = `${contractName}_${contractMethod}`.trim().toLowerCase();

        let seedFilePath = `${seedsDir}/files/${seedFileName}.js`;

        if((await Utils.exists(seedFilePath))){
            Utils.errorMsg(`Seed File already exists at ${seedFilePath}, delete it first`)
            return false;
        }

        Utils.successMsg(`Creating seed file at: ${seedFilePath}`)
            
    } catch (e) {
        Utils.errorMsg(e)
        console.log(e.stack)
    } 

}

run();