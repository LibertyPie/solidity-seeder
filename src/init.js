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
 const appRoot = require("app-root-path")
 var inquirer = require('inquirer');
const fsp = require("fs").promises
require('dotenv').config()
 
async function run() {
    
    let appRootDir = process.env.APP_ROOT_DIR || require("app-root-path").path;

    console.log(appRootDir)

    //lets check if seed directory exists 
    let seedsDir = `${appRootDir}/seeds`

    if(!(await Utils.exists(seedsDir))){
       // await fsp.mkdir(seedsDir,{ recursive: true })
        await fsp.mkdir(`${seedsDir}/files`,{ recursive: true })
        await fsp.mkdir(`${seedsDir}/processors`,{ recursive: true })
    }


}

run();