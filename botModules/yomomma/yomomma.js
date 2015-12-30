var request = require('request');
module.exports = function (api, args) {
  return {
    api: api,
    triggerString: "yomomma",
    listen: function(message) {
      if (message.body.indexOf(this.triggerString) > -1){
        console.log('triggered');
        request.get('http://api.yomomma.info/', function(req, all, body){
          body = JSON.parse(body);
          api.sendMessage(body.joke, message.threadID);
        });
      }
    }
  }
}