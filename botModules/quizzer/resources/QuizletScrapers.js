

// Ion Quizlet Scraper (Copy this bit into chrome)

var x = $('.word');
var ion = x.next();
var myJSON = []
for (var i = 0; i < x.length; i++){
  myJSON.push({question: x[i].textContent.trim(), answer: ion[i].textContent.trim()})
}

JSON.stringify(myJSON);

// APUSH quizlet scraper 
// 

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

(() => {
  const terms = document.getElementsByClassName('SetPage-term');

  var json = {
    questions: []
  }

  Array.from(terms).forEach((term) => {
    const word = term.querySelector('.qWord').textContent.replace(/[\n\r]+/g, '/');
    const def = term.querySelector('.qDef').textContent.replace(/[\n\r]+/g, '/').replaceAll('*', '\n');

    json.questions.push({answer: word, question: def});
  });

  console.log(JSON.stringify(json, null, 2));

})();

