var request = require('request');

module.exports = function (api, args) {
  var Cleverbot = require('cleverbot-node');
  var CBot = new Cleverbot;

  return {
    api: api,
    triggerString: "cleverbot ",
    listen: function(message) {

      if (message.body.indexOf(this.triggerString) > -1){
        var command = message.body.substring(message.body.indexOf(this.triggerString) 
          + this.triggerString.length);

        console.log(command);

        Cleverbot.prepare(function(){
          CBot.write(command, function(response){
            api.sendMessage(response.message, message.threadID);
          });
        });

      }
    }
  }
}