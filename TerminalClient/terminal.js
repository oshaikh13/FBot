
var spawn = require('child_process').spawn;
var socket = require('socket.io-client')('http://localhost:8000');

var latest = null;



var sh = spawn('bash');

socket.on('command', function(data){
  console.log(data);
  sh.stdin.write(data.command + "\n");
  latest = data.id;
  // socket.emit('completed', data);
});

sh.stdout.on('data', function(data) {
  console.log("ACTUAL DATA \n" + data)
  socket.emit('completed', {result: data, id: latest});
});

sh.stderr.on('data', function(data) {
  console.log("ACTUAL ERROR")
  socket.emit('completed', {result: data, id: latest});
});

sh.on('exit', function (code) {
  socket.emit(completed, 'Exited console');
});

