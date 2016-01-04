

//  _____                      _                      _        _   __  __           _       _      
// | ____|_  ___ __   ___ _ __(_)_ __ ___   ___ _ __ | |_ __ _| | |  \/  | ___   __| |_   _| | ___ 
// |  _| \ \/ / '_ \ / _ \ '__| | '_ ` _ \ / _ \ '_ \| __/ _` | | | |\/| |/ _ \ / _` | | | | |/ _ \
// | |___ >  <| |_) |  __/ |  | | | | | | |  __/ | | | || (_| | | | |  | | (_) | (_| | |_| | |  __/
// |_____/_/\_\ .__/ \___|_|  |_|_| |_| |_|\___|_| |_|\__\__,_|_| |_|  |_|\___/ \__,_|\__,_|_|\___|
//            |_|                                                                                  
    

var request = require('request');

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