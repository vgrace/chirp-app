var app = angular.module('chirpApp', ['ngRoute', 'ngResource', 'ngCookies']).run(function ($rootScope, $http, userPersistenceService) {
    $rootScope.authenticated = userPersistenceService.getAuthCookieData(); //false;//
    $rootScope.current_user = userPersistenceService.getCookieData(); //"";//
    $rootScope.post_to_edit = null;

    $rootScope.logout = function () {
        $http.get('/auth/signout');
        $rootScope.authenticated = false;
        $rootScope.current_user = "";
    }
});

app.config(function ($routeProvider) {
    $routeProvider
      //the timeline display
      .when('/', {
          templateUrl: 'main.html',
          controller: 'mainController'
      })
      //the login display
      .when('/login', {
          templateUrl: 'login.html',
          controller: 'authController'
      })
      //the signup display
      .when('/register', {
          templateUrl: 'register.html',
          controller: 'authController'
      });
});

app.factory("userPersistenceService", ["$cookies", function ($cookies) {
    var userName = "";
    var userAuthenticated = false;

    return {
        setCookieData: function (username, authenticated) {
            userName = username;
            $cookies.put("userName", username);
        },
        getCookieData: function () {
            userName = $cookies.get("userName");
            return userName;
        },
        clearCookieData: function () {
            userName = "";
            $cookies.remove("userName");
        },

        setAuthCookieData: function (authenticated) {
            userAuthenticated = authenticated;
            $cookies.put("userAuthenticated", authenticated);
        },
        getAuthCookieData: function () {
            userAuthenticated = $cookies.get("userAuthenticated");
            return userAuthenticated;
        },
        clearAuthCookieData: function () {
            userAuthenticated = "";
            $cookies.remove("userAuthenticated");
        }
    }
}
]);

app.factory('postService', function ($resource) {
    return $resource('/api/posts/:id', null,
    {
        'update': { method:'PUT' }
    });
});

app.controller('mainController', function ($rootScope, $scope, postService) {
    //Scope contains all models
    // ng-model for twoway databinding, np-bind one way data binding (controller populate view but not the other way), use for static text

    $scope.posts = postService.query();
    $scope.newPost = { created_by: '', text: '', created_at: '' };

    $scope.post = function () {
        $scope.newPost.created_by = $rootScope.current_user;
        $scope.newPost.created_at = Date.now();
        postService.save($scope.newPost, function () {
            $scope.posts = postService.query(); // Refresh chirp stream
            $scope.newPost = { created_by: '', text: '', created_at: '' }; // clear new post form
        });
    };

    $scope.edit = function (post_to_edit) {
        console.log('edit post: ');
        console.log(post_to_edit);
        $rootScope.post_to_edit = post_to_edit;
        $scope.newPost.text = post_to_edit.text;
    }

    $scope.updatepost = function () {
        console.log('Update post: ');
        $rootScope.post_to_edit.text = $scope.newPost.text; 
        $id = $rootScope.post_to_edit._id;
        console.log($id); 
        postService.update({ id: $id }, $rootScope.post_to_edit, function () {
            $rootScope.post_to_edit = null;
            $scope.newPost = { created_by: '', text: '', created_at: '' }; // clear new post form
        });
    }
});

app.controller('authController', function ($scope, $http, $rootScope, $location, userPersistenceService) {
    $scope.user = { username: '', password: '' };
    $scope.error_message = '';

    $scope.login = function () {
        $http.post('auth/login', $scope.user).success(function (data) {
            $rootScope.authenticated = true;
            $rootScope.current_user = data.user.username;
            userPersistenceService.setCookieData(data.user.username);
            userPersistenceService.setAuthCookieData(true);
            $location.path('/');
        });
    };

    $scope.register = function () {
        $http.post('auth/signup', $scope.user).success(function (data) {
            $rootScope.authenticated = true;
            $rootScope.current_user = data.user.username;
            userPersistenceService.setCookieData(data.user.username);
            userPersistenceService.setAuthCookieData(true);
            $location.path('/');
        });
    };
});