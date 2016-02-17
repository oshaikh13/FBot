var xkcd = require("xkcd-imgs");
var request = require("request");
var fs = require("fs");

module.exports = function (api, args) {
  return {
    api: api,
    triggerString: "xkcd",
    listen: function(message) {
      if (message.body.indexOf(this.triggerString) > -1){
        xkcd.img(function(err, res){

          if (!err) {
            var stream = request(res.url).pipe(fs.createWriteStream(__dirname + '/random.png'));
            stream.on('finish', function(){
              var msg = {
                body: res.title,
                attachment: fs.createReadStream(__dirname +'/random.png')
              }
              api.sendMessage(msg, message.threadID);
            })
          }

        })
      }
    }
  }
}