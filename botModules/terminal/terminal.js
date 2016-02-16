
module.exports = function (api, args) {

  var socket = args.socket;

  args.socket.on('completed', function(data){
    console.log(data);
    api.sendMessage(data.result, data.id);
  })

  return {
    api: api,
    triggerString: "terminal",
    enabled: false, 
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

      if (isAdmin(message.senderName)) {

        if (this.enabled) {
          socket.emit('command', {command: message.body, id: message.threadID});
        }

        if (message.body.indexOf(this.triggerString) > -1){
          this.enabled = !this.enabled;
          api.sendMessage("terminal status: " + this.enabled, message.threadID);
        }
      }

    }
  }
}