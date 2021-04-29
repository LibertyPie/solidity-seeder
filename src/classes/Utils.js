/*
* LibertyPie Project (https://libertypie.com)
* @author https://github.com/libertypie (hello@libertypie.com)
* @license SPDX-License-Identifier: MIT
*/

const colors = require("colors");
const fs = require("fs")
const process = require("process")

module.exports = class Utils {

   static isSilentMode = () => {
      return (process.env["SILENT_MODE"] == 1)
   }
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
         if(!this.isSilentMode()){
            console.log(`-> %c${colors.bold.green(msg)}`,"font-size: x-large")
         }
      }

      static infoMsg(msg){
         if(!this.isSilentMode()){
            console.log(`-> %c${colors.bold.blue(msg)}`,"font-size: x-large")
         }
      }


      static errorMsg(msg){
         if(!this.isSilentMode()){ 
            console.log(`-> %c${colors.bold.red(msg)}`,"font-size: x-large")
         }
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

}