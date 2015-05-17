var express = require('express')
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server);

app.set('port', (process.env.PORT || 5000))
app.use(express.static("public"));

io.sockets.on("connection", function(socket){
	socket.on("send message", function(data){
		io.sockets.emit("new message", data);
	});
});

server.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});