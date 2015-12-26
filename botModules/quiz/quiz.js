var fs = require('fs');

var shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

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


var Quiz = function (name) {
  // body...
  var quizzer = {};

  try {
    quizzer.data = require("./resources/quizzes/" + name + '.json');
  } catch (e) {
    return null;
  }

  quizzer.complete = false;
  quizzer.current = 0;
  quizzer.points = {};

  quizzer.data.questions = shuffle(quizzer.data.questions);

  var correct = function(resp, correct) {
    console.log(resp.toLowerCase().trim() + " WHAT HE SAID");
    console.log(correct.toLowerCase().trim() + " CORRECT")
    console.log(resp.toLowerCase().trim() === correct.toLowerCase().trim() + " RESULT");
    return resp.toLowerCase().trim() == correct.toLowerCase().trim();
  }


  quizzer.ask = function() {
    return quizzer.data.questions[this.current].question;
  }

  quizzer.check = function(answer) {
    console.log('EXEC CHECK')
    if (correct(answer, quizzer.data.questions[this.current].answer)) {
      console.log('CORRECT RESPONSE GIVEN');
      return this.next();
    } else {
      return false;
    }
  }

  quizzer.checkAnswers = function(answers){
    var check = false;
    answers.forEach(function(item){

      if (!check) {
        check = this.check(item);
        console.log(item + " ITEM");
      }

    }.bind(this));

    return check;
  }

  quizzer.next = function() {
    this.current++;

    if (this.current > quizzer.data.questions[this.current].quizLength) {
      this.complete = true;
      return "All done!";
    } else {
      return this.ask();
    }

  }

  quizzer.prompt = function() {
    return quizzer.data.description;
  }

  quizzer.listen = function() {

  }

  return quizzer;
}

module.exports = function(api) {
  return {  
    api: api,
    currentQuiz: undefined,
    triggerString: "startQuiz",
    listen: function(message){
      var that = this;
      if (message.body.indexOf("startQuiz") > -1 && !that.currentQuiz) {
        
        that.currentQuiz = Quiz(message.body.substring(message.body.indexOf(that.triggerString) 
          + that.triggerString.length + 1));

        if (!that.currentQuiz) {

          var response = "Quiz not found! Possible Quizzes: \n";

          // TODO: Cache, and set as cronjob.
          fs.readdir('./resources/quizzes', function (err, files) {
            for (var i = 0; i < files.length; i++) {
              response += (files[i].substring(0, files[i].indexOf(".json")) + "\n");
            }
            api.sendMessage(response, message.threadID);
          });



        } else { 
          api.sendMessage("Starting a quiz! Your answer should look something like this."
            + " The answer is whatever.", message.threadID, function(){
              api.sendMessage(that.currentQuiz.prompt(), message.threadID, function(){
                api.sendMessage(that.currentQuiz.ask(), message.threadID);
              });
            });
        }
      }


      if (isAnswer(message.body) && that.currentQuiz) {
        var answers = getPossibleAnswers(message.body);
        var response = that.currentQuiz.checkAnswers(answers);
        if (response == "All done!") {
          api.sendMessage(response + " Start another quiz.", message.threadID);
          that.currentQuiz = undefined;

        } else if (response) {
          api.sendMessage(answers[0] + " is correct, " + message.senderName 
            + "! Moving on. " + response, message.threadID);
        } else {
          api.sendMessage(answers[0] + " is wrong.. Try again, " 
            + message.senderName + ". " , message.threadID);
        }

      }

    }
  }
}

