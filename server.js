var express = require('express')
    app = express(),
    mongoose = require("mongoose"),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    nicknames = [],
    users = {};

app.set('port', (process.env.PORT || 5000))
app.use(express.static("public"));

mongoose.connect("mongodb://hkchat:123@ds031922.mongolab.com:31922/chat", function(err){
	if(err) 
		console.log(err);
	else 
		console.log("Cponnected to Mongolab");
});

var ChatSchema = mongoose.Schema({
	avatar: String,
	nickName: String,
	msg: String,
	created: { type: Date, default: Date.now }
}); 

var Chat = mongoose.model("Message", ChatSchema);

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

io.sockets.on("connection", function(socket){

	var query = Chat.find({});

	query.sort("-created").limit(5).exec(function(err, res){
		if(err) throw err;
		socket.emit("load old msgs", res);
	});

	socket.on("new user", function(name, callback){
		if(nicknames.indexOf(name) === -1){
			callback(true);
			socket.nickName = name;
			socket.avatar = "http://placehold.it/50/"+getRandomColor()+"/fff&text="+name[0].toUpperCase();

			nicknames.push({
				avatar: socket.avatar,
				nickName: socket.nickName, 
				lastLogin: new Date().getTime()
			});
			users[socket.nickName] = socket;
			updateNickNames();
		} else {
			callback(false);
		}

		// if(name in users){
		// 	callback(false);
		// } else {
		// 	callback(true);
		// 	socket.nickName = name;
		// 	socket.avatar = "http://placehold.it/50/"+getRandomColor()+"/fff&text="+name[0].toUpperCase();
		// 	socket.lastLogin = new Date().getTime();

		// 	users[socket.nickName] = socket;
		// 	updateNickNames();			
		// }
	});

	function updateNickNames(){
		io.sockets.emit("usernames", nicknames);
	}

	socket.on("send message", function(data){
		var newMsg = new Chat({
			avatar: socket.avatar,
			nickName: socket.nickName,
			msg: data
		});

		newMsg.save(function(err){
			if(err) throw err;
			io.sockets.emit("new message", {
				avatar: socket.avatar,
				nickName: socket.nickName,
				msg: data
			});			
		});


	});

	socket.on("send private message", function(data){
		var name = data.toUser;

		if(name in users){
			users[name].emit("new private message", {
				avatar: socket.avatar,
				nickName: socket.nickName,
				msg: data.pvtMsg
			});
		}
	});

	socket.on("disconnect", function(data){
		if(!socket.nickName) return;

		nicknames.splice(nicknames.indexOf(socket.nickName), 1);

		if(users[socket.nickName]){
			io.sockets.emit("removePvtChatWindow", socket.nickName);
			delete users[socket.nickName];
		}

		updateNickNames();
	});
});

server.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});