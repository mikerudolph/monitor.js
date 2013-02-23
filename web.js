
var express = require('express')
  , gzippo = require('gzippo')
  , path 	 = require('path')
  , app  = express.createServer()
  , io = require('socket.io').listen(app)
  , ping = require('./lib/ping')
  , db = require('./lib/db');

app.configure(function() {
  app.set('views', __dirname + "/views");
  app.set('view engine', 'ejs');
  app.register('.html', require('ejs'));
  app.use(gzippo.staticGzip(path.join(__dirname, '/public')));

  db.connect();
});

app.get('/', function(req,res) {
    console.log('SERVED CONTENT');
  res.render('index.html');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log('listening on',port);
});

io.sockets.on('connection', function(socket) {
  setInterval(function() {
    ping.ping();}, 5000);

  ping.serviceEvents.on('pingResults', function(data){
    socket.emit('new:ping', data);
  });

  socket.on('add:service', function(data) {
    db.addService(data);
  });

  ping.serviceEvents.on('serviceResults', function(data){
    socket.emit('new:service', data);
  });  
});

