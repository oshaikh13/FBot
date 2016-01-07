var request = require('request');
var chemUtils = require('./chemUtils.js')
module.exports = function (api, args) {
  return {
    api: api,
    triggerString: "chem ",
    listen: function(message) {
      var balancer = function(qry) {
          var word = qry.join(" ").trim();
          var coeff = chemUtils.balance(word);
          var msg = "";

          if (coeff && coeff.forEach) { 
            coeff.forEach(function(num, i){
              msg += (i + 1) + ". Coeff is " + num + "\n";
            });
          } else {
            msg = "Something's wrong with the equation"
          }
          return msg;
      }

      if (message.body.toLowerCase().indexOf(this.triggerString) > -1){


        var word = message.body.substring(message.body.indexOf(this.triggerString) 
          + this.triggerString.length).trim();

        var qry = word.split(" ");
        var all = qry[qry.length - 1] === "--balance";
        var limit = 1;

        if (all) {
          qry.pop();


          api.sendMessage(balancer(qry), message.threadID);
        } else {

          api.sendMessage(balancer(qry), message.threadID);

        }

      }
    }
  }
}