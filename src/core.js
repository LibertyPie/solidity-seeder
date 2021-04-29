#!/usr/bin/env node 

/**
 * LibertyPie (https://libertypie.com)
 * @author LibertyPie <hello@libertypie.com>
 * @license MIT
 */

const Utils = require("./classes/Utils");
const seed = require("./seed");

 
module.exports = class Core extends Utils {

    //run seeder
    static seeder_run({network,silentMode}) {
        silentMode = silentMode || false
        return seed({network,silentMode})
    } //end run seeder
    
}