
// require('dotenv').config({path: '../.env'});;

var login = require("facebook-chat-api");


login({email: process.env.FB_EMAIL, password: process.env.FB_PASSWORD}, function callback (err, api) {
    if(err) return console.error(err);

    var loader = require("../botModules/loader/loader.js")(api);
    // Must be manually loaded!

    loader.init(
      [
        {name: 'quizzer', args: {admins: ["omar"]}}, 
        {name: 'define', args: {WORDNIK_API_KEY: process.env.WORDNIK_API_KEY}},
        {name: 'yomomma'},
        {name: 'speak'},
        {name: 'troller', args: {admins: ["omar"]}}
      ]
    );
 
    api.listen(function callback(err, message) {

      loader.newMessage(err, message);

    });

});

