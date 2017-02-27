var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 8000);

app.get('/', function (req, res) {
  res.send("I'm awake, dammit.");
});

// Enable this on dev. 
// Start nodemon server from simplebot folder to find env.
require('dotenv').config({path: '../.env'});

var login = require("facebook-chat-api");

login({
        email: process.env.FB_EMAIL, 
        password: process.env.FB_PASSWORD,
        forceLogin: true
      }, 
  function callback (err, api) {
    if (err) return console.error(err);

    var loader = require("../botModules/loader/loader.js")(api);
    // Must be manually loaded!

    loader.init(
      [
        {name: 'quizzer', args: {admins: ["omar"]}}, 
        {name: 'define', args: {WORDNIK_API_KEY: process.env.WORDNIK_API_KEY}},
        {name: 'yomomma'},
        {name: 'speak'},
        {name: 'troller', args: {admins: ["omar"]}},
        {name: 'translate'},
        {name: 'cleverbot'},
        {name: 'chem'},
        {name: 'xkcd'}
      ]
    );
 
    io.on("connection", function(newSocket) {

      loader.addModule({name: 'terminal', args: {socket: newSocket, admins: ["omar"]}});

      newSocket.on('completed', function(data){

        function ab2str(buf) {
          return String.fromCharCode.apply(null, new Uint16Array(buf));
        }
    
        api.sendMessage(ab2str(data.result), data.id);
      });

    });

    api.listen(function callback(err, message) {
      
      loader.newMessage(err, message);

    });

});

