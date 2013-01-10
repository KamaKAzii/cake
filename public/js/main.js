// main.js

function MessageListCtrl($scope) {
  var socket = io.connect();
  socket.on('send-chat', function(data) {
    $scope.$apply(function() {
      $scope.receiveMessage(data);
    });
  });

  $scope.receiveMessage = function(data) {
    $scope.messages.push(
        {content: data.login + ": " + data.text});
  };

  $scope.message = '';
  $scope.messages = [
    /*
    {"content": "Some Lorem Ipsum goes here"},
    {"content": "And some more Ipsum Wipsum can go here"},
    {"content": "And some more stuff can go here"}
    */
  ];

  $scope.submitForm = function() {
    if ($scope.message == '')
      return;
    socket.emit('send-chat', {text: $scope.message});
    $scope.message = '';
    console.log("HI");
  };
};
