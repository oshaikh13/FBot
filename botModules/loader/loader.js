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
      this.rooms[threadID].modules[module.name] = 
        require('../' + module.name + '/' + module.name + '.js')(this.api, module.args);
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
      for (var key in this.rooms[message.threadID].modules) {
        this.rooms[message.threadID].modules[key].listen(message);
      }
    }

  }
}

