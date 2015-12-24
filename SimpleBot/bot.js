require('dotenv').config({path: '../.env'});;
var Quiz = require('../botModules/quiz/quiz.js')
var login = require("facebook-chat-api");

var isAnswer = function(answer) {
  return answer.toLowerCase().indexOf("answer is") > -1;
}

var getPossibleAnswers = function(answer) {
  answer = answer.toLowerCase();
  answer = answer.substring(answer.indexOf(" is ") + " is ".length);

  var possible = [];

  possible.push(answer);
  return possible;
}

// Create simple echo bot 
login({email: process.env.FB_EMAIL, password: process.env.FB_PASSWORD}, function callback (err, api) {
    if(err) return console.error(err);

    var rooms = {};
 
    api.listen(function callback(err, message) {


      // TODO: EACH MODULE SHOULD CONTAIN THIS CODE.
      // THIS IS IN THE WRONG PLACE!!!!!!!!!!!!!!

      if (!rooms[message.threadID]) {
        console.log("CREATING ROOM");
        rooms[message.threadID] = {};
      }

      if (message.body.indexOf("startQuiz") > -1) {


        if (!rooms[message.threadID].quizzer) {
          rooms[message.threadID].quizzer = Quiz(message.body.substring(message.body.indexOf("startQuiz") + "startQuiz".length + 1));
          api.sendMessage("Starting a quiz! Your answer should look something like this."
            + " The answer is whatever.", message.threadID, function(){
              api.sendMessage(rooms[message.threadID].quizzer.prompt(), message.threadID, function(){
                api.sendMessage(rooms[message.threadID].quizzer.ask(), message.threadID);
              });
            });


        }
      }


      if (isAnswer(message.body) && rooms[message.threadID] && rooms[message.threadID].quizzer) {
        var answers = getPossibleAnswers(message.body);
        var response = rooms[message.threadID].quizzer.checkAnswers(answers);
        if (response) {
          api.sendMessage(answers[0] + " is correct, " + message.senderName + "! Moving on. " + response, message.threadID);
        } else {
          api.sendMessage(answers[0] + " is wrong.. Try again, " + message.senderName + ". " , message.threadID);
        }

      }



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

