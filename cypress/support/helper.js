var Countly = require("../../lib/countly");


/**
 * resets Countly
 */
function haltAndClearStorage() {
   if (Countly.i !== undefined) {
       Countly.halt();
   }
   cy.fixture('variables').then((ob) => {
       cy.wait(ob.sWait).then(()=>{
        //    cy.clearLocalStorage();
       })
   });
}
module.exports = {
    haltAndClearStorage
}