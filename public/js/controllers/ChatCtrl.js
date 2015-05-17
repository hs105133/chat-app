angular.module("myApp")
	.controller('ChatCtrl', function($scope){
		var socket = io.connect();

		$scope.chats = [{
			avatar: "http://placehold.it/50/55C1E7/fff&text=U",
			name: "Varun Gupta",
			msg: "Lorem ipsum dolor sit amet, consectetur."
		},{
			avatar: "http://placehold.it/50/FA6F57/fff&text=ME",
			name: "Hemant Singh",
			msg: "Lorem ipsum dolor sit amet, consectetur."
		},{
			avatar: "http://placehold.it/50/55C1E7/fff&text=U",
			name: "Varun Gupta",
			msg: "Lorem ipsum dolor sit amet, consectetur."
		}];

		$scope.sendMessage = function(){
			socket.emit("send message", $scope.chatMsg);
		};

		socket.on("new message", function(data){
			$scope.$apply(function(){
				$scope.chats.push({
					avatar: "http://placehold.it/50/FA6F57/fff&text=ME",
					name: "Hemant Singh",
					msg: data
				});
				$scope.chatMsg = "";
			});
		});

	});