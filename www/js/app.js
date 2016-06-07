// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase', 'youtube-embed'])

.run(function($ionicPlatform, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  function authDataCallback(authData) {
    if (authData) {
      //console.log("User " + authData.password.email.replace(/@.*/, '') + " is logged in with " + authData.provider);
      $state.go('app.dashboard');
    } else {
      console.log("User is logged out");
      ref.unauth();
      $state.go('login');
    }
  }
  // Register the callback to be fired every time auth state changes
  var ref = new Firebase("https://crackling-inferno-6605.firebaseio.com");
  ref.onAuth(authDataCallback);

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl',
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/new.html'
      }
    }
  })

  .state('app.videos', {
      url: '/videos',
      views: {
        'menuContent': {
          templateUrl: 'templates/videos.html',
          controller: 'VideosCtrl'
        }
      }
    })
  .state('app.dashboard', {
    cache: false,
    url: '/dashboard',
    views: {
      'menuContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl'
      }
    }
  })

  .state('app.profile', {
    cache: false,
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })
  .state('app.new', {
    url: '/new',
    views: {
      'menuContent': {
        templateUrl: 'templates/new.html',
        controller: 'NewCtrl'
      }
    }
  })

      .state('app.mentions', {
        url: '/mentions',
        views: {
          'menuContent': {
            templateUrl: 'templates/mentions.html'
          }
        }
      })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/connect.html',
    controller: 'loginCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/dashboard');
});
