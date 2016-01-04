var request = require('request');


module.exports = function (api, args) {
  return {
    api: api,
    triggerString: "troller ",
    enabled: true,
    listen: function(message) {
      
      var isAdmin = function(name) {
        var isAdminBool = false;
        args.admins.forEach(function(admin){
          if (name.toLowerCase().indexOf(admin.toLowerCase()) > -1) {
            isAdminBool = true;
          }
        });

        return isAdminBool;
      }

      if (message.body.indexOf(this.triggerString) > -1 && isAdmin(message.senderName)){
        var flag = message.body.substring(message.body.indexOf(this.triggerString) 
          + this.triggerString.length);

        if (flag === "--disable") {
          this.enabled = false;
          api.sendMessage("Troller disabled", message.threadID);
        }

        if (flag === "--enable") {
          this.enabled = true;
          api.sendMessage("Troller enabled", message.threadID);
        }

        return;
        // Flag has instant return
      }

      if (this.enabled) {

        if (message.body.toLowerCase().indexOf("musab") > -1) {
          var factor = Math.random();
          var musabCase = factor < .1;
          if (true){
            api.sendMessage("Speaking of Musab, I think he's an idiot.", message.threadID);
          } else {
            api.sendMessage("MOOOOOSAB", message.threadID);
          }         
        } 

        if (message.body.toLowerCase().indexOf("history") > -1) {
          api.sendMessage("LOL TC AP history", message.threadID);
        } 

        if (message.body.toLowerCase().indexOf("leonard") > -1 || 
            message.body.toLowerCase().indexOf("abdallah") > -1) {
          api.sendMessage("You mean the snake...", message.threadID);
        } 

        if (message.body.toLowerCase().indexOf("jawad") > -1) {
          api.sendMessage("Jawad hearthstoner af...", message.threadID);
        }

        if (message.body.toLowerCase().indexOf("nofel") > -1) {
          api.sendMessage("All hail the nofy bear, the nofy pear, the nofy hair, the nofy insurance care",
           message.threadID);
        }

        if (message.senderName.toLowerCase().indexOf("yaser") > -1) {
          var factor = Math.random();
          console.log(factor);
          if (factor <= .20) {
            if (factor < .10) {
              api.sendMessage("Silence. Yaser has spoken. ", message.threadID);
            } else {
              api.sendMessage("Silence. Meth lord has spoken. ", message.threadID);
            }
          }
        }

        if (message.body.toLowerCase().indexOf("rafay") > -1) {
          api.sendMessage("you mean the assasin??", message.threadID);
        }

        if (message.body.toLowerCase().indexOf("fuzail") > -1) {
          api.sendMessage("^^fucking nerd", message.threadID);
        }

        if (message.body.toLowerCase().indexOf("omar") > -1) {
          api.sendMessage("u talkin bout my dad m8", message.threadID);
        }

        if (message.body.toLowerCase().indexOf("sultan") > -1) {
          api.sendMessage("arsenal sux m8", message.threadID);
        }

        if (message.body.toLowerCase().indexOf(process.env.BOT_NAME) > -1) {
          api.sendMessage("im here bae", message.threadID);
        }
      }


    }
  }
}