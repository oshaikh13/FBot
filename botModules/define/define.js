var request = require('request');
module.exports = function (api, args) {
  console.log(args);
  return {
    api: api,
    triggerString: "define ",
    listen: function(message) {
      if (message.body.indexOf(this.triggerString) > -1){
        var word = message.body.substring(message.body.indexOf(this.triggerString) 
          + this.triggerString.length);

        request.get(
          { 
            url: 'http://api.wordnik.com:80/v4/word.json/' + word + '/definitions?limit=200&api_key=' + args.WORDNIK_API_KEY
          }, function(err, complete, body){
            var answer = "";
            body = JSON.parse(body);
            for (var i = 0; i < body.length; i++){
              answer += (i + 1) + ".\n";
              answer += "Definition: " + body[i].text + '\n';
            }

            api.sendMessage(answer, message.threadID);
            
          });

      }
    }
  }
}