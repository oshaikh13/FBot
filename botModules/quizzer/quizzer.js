var fs = require('fs');
var levenshtein = require('damerau-levenshtein');
var rp = require('request-promise');

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
  quizzer.length = quizzer.data.questions.length;
  quizzer.rules = quizzer.data.rules || {factor: .7, caseMatters: false};

  quizzer.data.questions = shuffle(quizzer.data.questions);

  var correct = function(resp, correct) {


    resp = resp.trim();
    correct = correct.trim();
    
    if (!quizzer.rules.caseMatters){
      resp = resp.toLowerCase();
      correct = correct.toLowerCase();
    }

    console.log(resp + " WHAT HE SAID");
    console.log(correct + " CORRECT");

    var stats = levenshtein(resp, correct);

    console.log(stats);
    console.log(stats.similarity >= quizzer.rules.factor);

    return stats.similarity >= quizzer.rules.factor; // 20% of the letters can be 'wrong'
  }


  quizzer.ask = function() {
    return quizzer.data.questions[this.current].question;
  }

  quizzer.check = function(answer) {
    console.log('EXEC CHECK')
    if (!answer) return false;
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

    if (this.current > quizzer.length) {
      this.complete = true;
      return "All done!";
    } else {
      return this.ask();
    }

  }

  quizzer.prompt = function() {
    return quizzer.data.description;
  }

  return quizzer;
};

module.exports = function(api, args) {
  return {  
    api: api,
    currentQuiz: undefined,
    triggerString: "quizzer",
    listen: function(message){

      var isAdmin = function(name) {
        var isAdminBool = false;
        args.admins.forEach(function(admin){
          if (name.toLowerCase().indexOf(admin.toLowerCase()) > -1) {
            isAdminBool = true;
          }
        });

        return isAdminBool;
      }

      var printScore = function(pointsObj){
        var msg = "Scores: \n"
        for (var key in pointsObj) {
          msg += key + ": " + pointsObj[key] + " \n";
        }

        api.sendMessage(msg, message.threadID);
      }

      var that = this;
      var qry = message.body.substring(message.body.indexOf(that.triggerString) 
        + that.triggerString.length + 1);

      // THIS IS A FLAG
      // Look at the return statement. Termination after this is run.
      if (qry === '--all') {
        fs.readdir(__dirname + '/resources/quizzes/', function (err, files) {
          if (!err) {  
            var response = "Possible Quizzes: \n"; 
            for (var i = 0; i < files.length; i++) {
              response += (files[i].substring(0, files[i].indexOf(".json")) + "\n");
            }
            api.sendMessage(response, message.threadID);
          } else {
            console.log(err);
          }
        });


        return;
      }


      if (qry === "--pass" && isAdmin(message.senderName) && that.currentQuiz) {
        response = that.currentQuiz.next();
        api.sendMessage("Admin Pass! Moving on. " + response, message.threadID);
        return;
      }

      if (qry === "--repeat" && that.currentQuiz) {
        api.sendMessage("Repeat. " + that.currentQuiz.ask(), message.threadID);
        return;
      }

      if (qry === "--score" && that.currentQuiz) {
        printScore(that.currentQuiz.points);
        // api.sendMessage(msg, message.threadID);
        return;
      }


      if (qry === '--terminate') {
        that.currentQuiz = null;
        api.sendMessage("Quiz Terminated. Pick another :)", message.threadID);

        return;
      }
      // End of flags.

      if (message.body.indexOf(that.triggerString) > -1 && !that.currentQuiz) {
        

        that.currentQuiz = Quiz(qry);



        if (!that.currentQuiz) {

          var response = "Quiz not found! Write 'quizzer --all' to see all quizzes \n";
          api.sendMessage(response, message.threadID);

        } else { 
          api.sendMessage("Starting a quiz! Your answer should look something like this."
            + " The answer is whatever.", message.threadID, function(){
              api.sendMessage(that.currentQuiz.prompt(), message.threadID, function(){
                api.sendMessage(that.currentQuiz.ask(), message.threadID);
              });
            });
        }
      }

      var answerFormat = isAnswer(message.body);
      if (that.currentQuiz) {

        var answers;
        if (answerFormat) {
          answers = getPossibleAnswers(message.body);
        } else {
          answers = [message.body];
        }

        var response = that.currentQuiz.checkAnswers(answers);

        if (response == "All done!") {
          printScore(that.currentQuiz.points);
          api.sendMessage(response + " Start another quiz.", message.threadID);
          that.currentQuiz = undefined;

        } else if (response) {

          if (that.currentQuiz.points[message.senderName]) {
            that.currentQuiz.points[message.senderName]++;
          } else {
            that.currentQuiz.points[message.senderName] = 1;
          }

          api.sendMessage(answers[0] + " is correct, " + message.senderName 
            + "! Moving on. " + response, message.threadID);
        } else {
          if (answerFormat) {
            api.sendMessage(answers[0] + " is wrong.. Try again, " 
              + message.senderName + ". " , message.threadID);
          }
        }

      }

    }
  }
}

