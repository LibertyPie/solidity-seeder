const ethers = require("ethers");
//var slugify = require('slugify');
const Utils = require("../classes/Utils");
const Status = require("../classes/Status");

module.exports = async ({
    contractName,
    contractInstance, 
    contractMethod, 
    argsArray,
    networkId,
    web3,
    web3Account
}) => {

    let resultsArray = [];
    
    for(let index in argsArray) {

        let _argArray = argsArray[index];

        try {

            Utils.infoMsg(`Retrieving gas for contract method ${contractMethod}`)

            let gas = await Utils.getGasEstimate(contractInstance, contractMethod, _argArray, web3Account);

            Utils.successMsg(`${contractMethod} Gas Fee: ${gas} wei`)

            let result = await contractInstance.methods[contractMethod](..._argArray).send({from: web3Account, gas});

            Utils.successMsg(`Standard Seed Tx Success: ${result.transactionHash}`)

            resultsArray[index] = {contractMethod, data: _argArray, txInfo: result};
            
        } catch (e) {
            console.log(`standardSeedProcessor Error ${e.message}`,e)
            return Status.errorPromise(`standardSeedProcessor Error: ${e.message}`)
        }
    } //end loop

    return Status.successPromise("", resultsArray)
}

