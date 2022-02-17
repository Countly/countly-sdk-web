var Countly = require("../../lib/countly");


/**
 * clears local storage and resets Countly
 */
function haltAndClearStorage() {
    console.log("======================]]]]",Countly.device_id);
   if (Countly.i !== undefined) {
       Countly.halt();
       console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[",Countly.device_id);
   }
   cy.fixture('variables').then((ob) => {
       cy.wait(ob.sWait).then(()=>{
           cy.clearLocalStorage();
       })
   });
}
module.exports = {
    haltAndClearStorage
}