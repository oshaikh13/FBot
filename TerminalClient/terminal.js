var exec = require('child_process').exec;

var socket = require('socket.io-client')('http://localhost:8000');

var options = {
  cwd: '/'
}

socket.on("disconnect", function(){
  console.log("SERVER DISABLED...");
});

socket.on('command', function(data){
  console.log("received command: " + data.command);
  exec(data.command, options, function(err, stdout, strerr){
    socket.emit('completed', {result: stdout, id: data.id});
  })
});
