var request = require('request');
var fs = require('fs');
var tracker = 0;

module.exports = function (api, args) {
  return {
    api: api,
    triggerString: "speak ",
    listen: function(message) {
      if (message.body.indexOf(this.triggerString) > -1){
        var word = message.body.substring(message.body.indexOf(this.triggerString) 
          + this.triggerString.length);
        var url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(word) + "&tl=en&client=tw-ob";

        api.sendMessage(url, message.threadID);
      }
    }
  }
}