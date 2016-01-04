// Satsify heroku port binding.
var express = require('express');
var app = express();

app.listen(process.env.PORT || 8000);

// Allow pinging to wake the server.
app.get('/', function (req, res) {
  res.send("I'm awake, dammit.");
});

// Enable this on dev. 
// Start nodemon server from simplebot folder to find env.
// require('dotenv').config({path: '../.env'});

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

