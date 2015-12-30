var request = require('request');
module.exports = function (api, args) {
  return {
    api: api,
    triggerString: "define ",
    listen: function(message) {

      var errorSend = function() {
        api.sendMessage("Unable to define " + word, message.threadID);
      }

      if (message.body.indexOf(this.triggerString) > -1){


        var word = message.body.substring(message.body.indexOf(this.triggerString) 
          + this.triggerString.length);

        var qry = word.split(" ");
        var all = qry[qry.length - 1] === "--all";
        var limit = 1;

        if (all) {
          qry.pop();
          word = qry.join(" ");
        }


        request.get(
          { 
            url: 'http://api.wordnik.com:80/v4/word.json/' + word + '/definitions?limit=200&api_key=' + args.WORDNIK_API_KEY
          }, function(err, complete, body){
            // TODO: Clean this module up. 
            // Handle parts of speech.
            if (!err) {

              var error = false;

              var answer = "";

              body = JSON.parse(body);

              if (all) {
                limit = body.length;
              }

              for (var i = 0; i < limit; i++){

                if (body.length < 1) {
                  error = true;
                  errorSend();
                  break;

                }

                if (!body[i] || !body[i].text) {
                  error = true;
                  errorSend();
                  break;
                }

                answer += (i + 1) + ".\n";

                answer += "Definition: " + body[i].text + '\n';
              }

              if (!error) {
                api.sendMessage(answer, message.threadID);
              } else {
                errorSend();
              }

            } else {
              errorSend();
            }

            
          });

      }
    }
  }
}