/*
* LibertyPie Project (https://libertypie.com)
* @author https://github.com/libertypie (hello@libertypie.com)
* @license SPDX-License-Identifier: MIT
*/

const colors = require("colors");
const fs = require("fs")


module.exports = class Utils {

    /**
     * fromDaysToMilli
     */
    static fromDaysToMilli(noOfDays) {
        return (60 * 60 * 24 * noOfDays * 1000);
    }

    /**
     * fromMinutesToMilli
     */
     static fromMinutesToMilli(noOfMinutes){
        return (60  * noOfMinutes * 1000);
     }

    /**
     * fromHoursToMilli
     */
     static fromHoursToMilli(noOfHours){
        return (60  * 60 * noOfHours * 1000);
     }


      static successMsg(msg){
         console.log(`-> %c${colors.bold.green(msg)}`,"font-size: x-large")
      }

      static infoMsg(msg){
         console.log(`-> %c${colors.bold.blue(msg)}`,"font-size: x-large")
      }


      static errorMsg(msg){
         console.log(`-> %c${colors.bold.red(msg)}`,"font-size: x-large")
      }

      /**
       * exists
       * @param {*} file 
       * @returns 
       */
      static exists = (file) => {
         return new Promise((resolve) => {
             fs.access(file, fs.constants.F_OK, (err) => {
                 err ? resolve(false) : resolve(true)
             });
         })
     }


     static toSnakeCase(_text){

         _text = _text.trim()
         _text = _text.charAt(0).toUpperCase() + _text.slice(1);

         var result = _text.trim()
                        .replace( /([A-Z])/g, " $1" );
                        
         return result.split(' ').join('_').toLowerCase();
     }
}