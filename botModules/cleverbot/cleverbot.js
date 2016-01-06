var request = require('request');

var Cleverbot = require('cleverbot-node');

function millisToMinutes(millis) {
  var minutes = Math.floor(millis / 60000);
  return minutes;
}

module.exports = function (api, args) {

  return {
    api: api,
    triggerString: "cleverbot ",
    prepared: false,
    startedOn: Date.now(),
    CBot: undefined,
    listen: function(message) {
      var that = this;
      var respond = function(){
        that.CBot.write(command, function(response){
          api.sendMessage(response.message, message.threadID);
        });
      }

      if (message.body.indexOf(that.triggerString) > -1){
        var command = message.body.substring(message.body.indexOf(that.triggerString) 
          + that.triggerString.length);

        console.log(command);

        var mins = millisToMinutes(Date.now() - that.startedOn);
        console.log(mins)
        if (!that.prepared || mins > 120) {  

          console.log('INIT BOT')

          that.CBot = new Cleverbot(); 
  
          Cleverbot.prepare(function(){
            respond();
          });

          that.prepared = true;
          startedOn = Date.now();

        } else {
          console.log('Time until cookie refresh: ' + mins);
          respond();
        }

      }
    }
  }
}