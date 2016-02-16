var xkcd = require("xkcd-imgs");
var request = require("request");

module.exports = function (api, args) {
  return {
    api: api,
    triggerString: "xkcd",
    listen: function(message) {
      if (message.body.indexOf(this.triggerString) > -1){
        xkcd.img(function(err, res){
          if (!err) {
            var msg = {
              attachment: request(res.url).pipe(fs.createWriteStream('random.png'))
            }
            api.sendMessage(msg, message.threadID);
          }
        })
      }
    }
  }
}