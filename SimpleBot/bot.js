require('dotenv').config({path: '../.env'});;
var login = require("facebook-chat-api");

// Must be manually loaded!

// Create simple echo bot 
login({email: process.env.FB_EMAIL, password: process.env.FB_PASSWORD}, function callback (err, api) {
    if(err) return console.error(err);

    var loader = require("../botModules/loader/loader.js")(api);
    loader.init(['quiz']);
 
    api.listen(function callback(err, message) {

      loader.newMessage(err, message);

      // Just trolls. Make a troll module
      if (message.body.toLowerCase().indexOf("musab") > -1) {
        api.sendMessage("Speaking of Musab, I think he's an idiot.", message.threadID);
      } else if (message.body.toLowerCase().indexOf("history") > -1) {
        api.sendMessage("LOL TC AP history", message.threadID);
      } else if (message.body.toLowerCase().indexOf("leonard") > -1 || 
          message.body.toLowerCase().indexOf("abdallah") > -1) {
        api.sendMessage("You mean the snake...", message.threadID);
      } else if (message.body.toLowerCase().indexOf("jawad") > -1) {
        api.sendMessage("Jawad hearthstoner af...", message.threadID);
      }


    });

});

