var request = require('request');

module.exports = function (api, args) {
  return {
    api: api,
    triggerString: "translate ",
    listen: function(message) {
      var errorSend = function(word) {
        api.sendMessage('Unable to translate ' + word, message.threadID);

      }
      if (message.body.indexOf(this.triggerString) > -1){
        var word = message.body.substring(message.body.indexOf(this.triggerString) 
          + this.triggerString.length);

        var sourceOrig = word.split(" ");

        if (sourceOrig.length < 3) {
          api.sendMessage("Illegal arguments provided.", message.threadID);
          return;
        }

        var dest = sourceOrig.pop();
        var source = sourceOrig.pop();

        var qry = sourceOrig.join(" ");

        var url = 'http://api.mymemory.translated.net/get?q=' + encodeURIComponent(qry) + '&langpair=' + source + '|' + dest + '';
        
        request.get(url, function(err, all, body){

          if (!err) {
            try {
              body = JSON.parse(body);
            } catch (e) {
              errorSend(qry);
              return;
            } 

            if (!body.responseData || !body.responseData.translatedText) {
              errorSend(qry);
              return;
            }
            
            api.sendMessage('Translated ' + qry + ': ' + body.responseData.translatedText, message.threadID);
          }
        });

      }
    }
  }
}