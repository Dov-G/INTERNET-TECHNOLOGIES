todomvc.controller('LoginCtrl', function MainCtrl($scope, $http, $location) {

    $scope.login = function(loginUser, pw) {
        $http.post('/login', {username:loginUser, password:pw}).success(function(data) {
            $location.path("/");
        }).error(function (data, status, headers, config) {
                alert('Bad user name or password');
                return status;
            })

    }

    $scope.register = function(regFullName, regUserName, regPW) {
        $http.post('/register', {username:regUserName, fullname:regFullName, password:regPW}).success(function(data) {
            $location.path("/");
        }).error(function (data, status, headers, config) {
                alert('username already used or password is not 3 characters long');
                return status;
            });
    }
});