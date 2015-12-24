module.exports = function (name) {
  // body...
  var quizzer = {};
  quizzer.data = require("./resources/quizzes/" + name + '.json');
  quizzer.complete = false;
  quizzer.current = 0;
  quizzer.points = {};

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

  return quizzer;
}