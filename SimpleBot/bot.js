require('dotenv').config({path: '../.env'});;
var login = require("facebook-chat-api");

// Must be manually loaded!

login({email: process.env.FB_EMAIL, password: process.env.FB_PASSWORD}, function callback (err, api) {
    if(err) return console.error(err);

    var loader = require("../botModules/loader/loader.js")(api);
    loader.init(
      [
        {name: 'quizzer', args: {}}, 
        {name: 'define', args: {WORDNIK_API_KEY: process.env.WORDNIK_API_KEY}},
        {name: 'yomomma'}
      ]
    );
 
    api.listen(function callback(err, message) {

      loader.newMessage(err, message);

      // Just trolls. Make a troll module
      if (message.body.toLowerCase().indexOf("musab") > -1) {
        api.sendMessage("Speaking of Musab, I think he's an idiot.", message.threadID);
      } 

      if (message.body.toLowerCase().indexOf("history") > -1) {
        api.sendMessage("LOL TC AP history", message.threadID);
      } 

      if (message.body.toLowerCase().indexOf("leonard") > -1 || 
          message.body.toLowerCase().indexOf("abdallah") > -1) {
        api.sendMessage("You mean the snake...", message.threadID);
      } 

      if (message.body.toLowerCase().indexOf("jawad") > -1) {
        api.sendMessage("Jawad hearthstoner af...", message.threadID);
      }

      if (message.body.toLowerCase().indexOf("nofel") > -1) {
        api.sendMessage("All hail the nofy bear, the nofy pear, the nofy hair, the nofy insurance care",
         message.threadID);
      }

      if (message.senderName.toLowerCase().indexOf("yaser") > -1) {
        var factor = Math.random();
        console.log(factor);
        if (factor <= .20) {
          api.sendMessage("Silence. Yaser has spoken. ", message.threadID);
        }
      }

      if (message.body.toLowerCase().indexOf("rafay") > -1) {
        api.sendMessage("you mean the assasin??", message.threadID);
      }

    });

});

