#!/usr/bin/env node 

/**
 * LibertyPie (https://libertypie.com)
 * @author LibertyPie <hello@libertypie.com>
 * @license MIT
 */

const Utils = require("./classes/Utils");
const seed = require("./seed");

 
module.exports = class Core extends Utils {

    static seed_run({
        network,
        contract,
        silent
    }) {
        return seed({network,contract,silent})
    }

    
}