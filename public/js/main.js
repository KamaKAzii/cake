// main.js

function MessageListCtrl($scope) {
  var socket = io.connect();
  var routes = {
    'send-chat': 'onSendChat',
    'welcome': 'onWelcome',
  };
  var installRoute = function(eventName, methodName) {
    console.log('routing', eventName, 'to', methodName);
    socket.on(eventName, function(data) {
      $scope.$apply(function() {
        if (!$scope[methodName]) {
          console.error("no handler for " + methodName);
          return;
        }
        $scope[methodName](data);
      });
    });
  }

  for (var k in routes) {
    if (routes.hasOwnProperty(k)) {
      installRoute(k, routes[k]);
    }
  }

  $scope.onSendChat = function(data) {
    $scope.messages.push(
        {content: data.login + ": " + data.text});
  };
  $scope.onWelcome = function(data) {
    $scope.login = data.login;
  };

  $scope.login = null;
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
  };
};
