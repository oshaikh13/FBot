module.exports = function (api) {

  return {

    rooms: {},
    modules: {},
    api: api,

    init: function (moduleArrayList) {
      moduleArrayList.forEach(function(module){
        this.modules[module.name] = {};
        this.modules[module.name].create = require('../' + module.name + '/' + module.name + '.js');
        this.modules[module.name].args = module.args;
      }.bind(this));
    },

    loadModules: function(threadID) {
      for (var key in this.modules) {
        this.rooms[threadID].modules[key] = this.modules[key].create(api, this.modules[key].args);
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