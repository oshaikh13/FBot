var fs = require('fs');

fs.readFile('Period8.txt', 'utf8', function(err, data) {

  var JSONBody = {
    "title": "People/Events in Period 8",
    "description": "Name who or what this event or person is.",
    "questions": []
  }


  var currentQuestion = null;
  var currentAnswer = null;

  data.split('\n').forEach(function(elem, idx) {
    // console.log(elem, idx);
    if (idx % 3 === 0) {
      currentAnswer = elem;

    } else if (idx % 3 === 1) {
      currentQuestion = elem;

    } else JSONBody.questions.push({question: currentQuestion, answer: currentAnswer});
  });

  console.log(JSON.stringify(JSONBody, null , 2));

});