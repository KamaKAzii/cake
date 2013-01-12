// main.js

function MessageListCtrl($scope) {
  var socket = io.connect();
  var routes = {
    'send-chat': 'onSendChat',
    'welcome': 'onWelcome',
    'join': 'onJoin',
    'leave': 'onLeave',
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

  var padWith = function(str, n, padding) {
    str += '';
    while (str.length < n) {
      str = padding + str;
    }
    return str;
  };

  var toShortDate = function(dateString) {
    var date = new Date(dateString);
    var hours = padWith(date.getHours(), 2, '0');
    var minutes = padWith(date.getMinutes(), 2, '0');
    return hours + ":" + minutes;
  };

  $scope.onSendChat = function(data) {
    var message = {
      date: toShortDate(data.date),
      login: data.login,
      text: data.text
    };
    $scope.messages.push(message);
  };
  $scope.onWelcome = function(data) {
    $scope.login = data.login;
    $scope.members = data.members;
  };
  $scope.onJoin = function(data) {
    $scope.members.push(data.login);
  };
  $scope.onLeave = function(data) {
    var i = $scope.members.indexOf(data.login);
    if (i != -1) {
      $scope.members.splice(i, 1);
    }
  };

  // Name of the logged in user.
  $scope.login = null;

  // List of logins who are listening to the convo.
  $scope.members = [];

  // Messages displayed on the screen. Of form {date, login, text}.
  $scope.messages = [];

  // Bound to the input box for the current message.
  $scope.message = '';

  $scope.submitForm = function() {
    if ($scope.message == '')
      return;
    socket.emit('send-chat', {text: $scope.message});
    $scope.message = '';
  };
};
