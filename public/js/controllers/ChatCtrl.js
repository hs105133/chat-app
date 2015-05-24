angular.module("myApp")
    .controller('ChatCtrl', function($scope) {
        var socket = io.connect();

        $scope.privateChatUsers = {};


        $scope.chats = [{
            avatar: "http://placehold.it/50/55C1E7/fff&text=U",
            nickName: "Varun Gupta",
            msg: "Lorem ipsum dolor sit amet, consectetur."
        }, {
            avatar: "http://placehold.it/50/FA6F57/fff&text=ME",
            nickName: "Hemant Singh",
            msg: "Lorem ipsum dolor sit amet, consectetur."
        }, {
            avatar: "http://placehold.it/50/55C1E7/fff&text=U",
            nickName: "Varun Gupta",
            msg: "Lorem ipsum dolor sit amet, consectetur."
        }];

        $scope.pvtChats = {};

        $scope.sendMessage = function() {
            socket.emit("send message", $scope.chatMsg);
        };
        $scope.pvtMsg = [];
        $scope.sendPvtMessage = function($event, pvtKey, index) {
        	

            if ($event.keyCode == 13 && !$event.shiftKey) {
                //$event.preventDefault();
                var msg = $scope.pvtMsg[index].replace(/<(?:.|\n)*?>/gm, '');

                socket.emit("send private message", {
                    toUser: pvtKey,
                    pvtMsg: msg
                });

                $scope.privateChatUsers[pvtKey].pvtChats.push({
                    //avatar: data.avatar,
                    nickName: $scope.username,
                    msg: msg               	
                })

                $scope.pvtMsg[index] = "";
            }
        };

        socket.on("new message", function(data) {
            $scope.$apply(function() {
                $scope.chats.push({
                    avatar: data.avatar,
                    nickName: data.nickName,
                    msg: data.msg
                });

                $scope.chatMsg = "";
            });
        });

        socket.on("new private message", function(data) {
        	console.log(data, socket);
            $scope.$apply(function() {
            	if(!$scope.privateChatUsers[data.nickName]){
            		$scope.privateChatUsers[data.nickName] = {
            			pvtChats: []
            		};	
            	}
            	$scope.privateChatUsers[data.nickName].pvtChats.push(data);
            });
        });

        $scope.addNickName = function() {
            console.log($scope.nickName)
            socket.emit("new user", $scope.nickName, function(nickName) {
                if (!nickName) {

                } else {
                    $scope.nickErr = true;
                    $scope.username = $scope.nickName;
                }

                $scope.nickName = "";
            });
        };

        socket.on("load old msgs", function(msgs){
            $scope.$apply(function() {
                $scope.chats = msgs.reverse();
            });
        });

        socket.on("usernames", function(names) {
            $scope.$apply(function() {
                $scope.nicknames = names;
            });
        });

        socket.on("removePvtChatWindow", function(pKey){
        	$scope.closePrivateChat(pKey);
        });


        $scope.privateChat = function(user) {
            console.log(user);
            $scope.privateChatUsers[user.nickName] = {
                avatar: user.avatar,
                lastLogin: user.lastLogin,
                pvtChats: []
            };
        };

        $scope.setPosition = function(index) {
            return index * 255 + "px";
        };

        $scope.closePrivateChat = function(pKey) {
            delete $scope.privateChatUsers[pKey];
        };
        $scope.chatWindow = {};
        $scope.toggleChatWindow = function(pKey){
        	$scope.chatWindow[pKey] = !$scope.chatWindow[pKey];
        	console.log($scope.chatWindow[pKey]);
        };
    });
