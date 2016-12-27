const requireUncached = require('require-uncached');

module.exports = function (api) {

  return {

    rooms: {},
    moduleList: undefined,
    api: api,

    init: function (moduleArrayList) {
      this.moduleList = moduleArrayList;
    },

    loadModules: function(threadID) {
      this.moduleList.forEach(function(module){
        this.loadModule(threadID, module);
      }.bind(this));
    },

    loadModule: function(threadID, module) {
      // Use uncached require to avoid that annoying bug
      // where certain modules would 'bleed' to other chats
      this.rooms[threadID].modules[module.name] = 
        requireUncached('../' + module.name + '/' + module.name + '.js')(this.api, module.args);
    },

    addModule: function(module) {
      this.moduleList.push(module);
      for (var key in this.rooms) {
        this.loadModule(key, module);
      }
    },


    newMessage: function(err, message) {

      if (!this.rooms[message.threadID]) {
        this.rooms[message.threadID] = {};
        this.rooms[message.threadID].modules = {};
        this.loadModules(message.threadID);
      }


      this.passToModules(message);
    },

    passToModules: function(message) {

      // TODO: conditions should be handled by modules
      if (!(message && message.type && message.body && message.type == "message")) return;

      this.api.getUserInfo(message.senderID, function(err, userInfo) {

        if (err) {
          message.senderName = "NAMELESS :P";
          // console.log(err);
        } else {
          // console.log(JSON.stringify(userInfo, null, 2));
          // console.log(userInfo[message.senderID].name);
          message.senderName = userInfo[message.senderID].name;
        }

        for (var key in this.rooms[message.threadID].modules) {
          this.rooms[message.threadID].modules[key].listen(message);
        }

      }.bind(this));

      // console.log(JSON.stringify(message, null, 2));





    }

  }
}

