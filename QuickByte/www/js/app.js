// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

Parse.initialize("bJq93xMNW7k0Bq8BJ8PPdL2VLkEXRQmZENQS6VRH", "keF8UXdx6EvQ1jQUcCbWfqKfBy7aETxy4iNp6bnA");

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {


    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // Parse.initialize("bJq93xMNW7k0Bq8BJ8PPdL2VLkEXRQmZENQS6VRH", "keF8UXdx6EvQ1jQUcCbWfqKfBy7aETxy4iNp6bnA");
  });
})

app.constant('$ionicLoadingConfig', {
  template: '<ion-spinner class="spinner-positive" icon="ios"></i></ion-spinner>'
})

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'TabsCtrl'
  })



  // Each tab has its own nav history stack:
  .state('tab.restaurants', {
    url: '/restaurants',
    views: {
      'tab-restaurants': {
        templateUrl: 'templates/tab-restaurants.html',
        controller: 'RestaurantsCtrl'
      }
    }
  })
//restaurant details
    .state('tab.restaurant-detail', {
    url: '/restaurants/:restaurantId',
    views: {
      'tab-restaurants': {
        templateUrl: 'templates/restaurant-detail.html',
        controller: 'RestaurantDetailCtrl'
      }
    }
  })


//restaurant details directions map
  .state('tab.directions', {
    url: '/restaurants/:restaurantId/directions',
    views: {
      'tab-restaurants': {
        templateUrl: 'templates/directions.html',
        controller: 'DirectionsCtrl'
      }
    }
  })

//comments
  .state('tab.comments', {
    url: '/restaurants/:restaurantId/comments',
    views: {
      'tab-restaurants': {
        templateUrl: 'templates/comments.html',
        controller: 'CommentsCtrl'
      }
    }
  })

  //login
 .state('signin', {
      cache: false,
      url: '/signin',
      templateUrl: 'templates/login.html',
      controller: 'UserCtrl'
  })
//signup
  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'UserCtrl'
  })

//map
  .state('tab.map', {
      url: '/map',
      views: {
        'tab-map': {
          templateUrl: 'templates/tab-map.html',
          controller: 'MapCtrl'
        }
      }
    })

  .state(':userid/:fftype', {
    url: '/:userid/:fftype',
    templateUrl: 'templates/followersAndFollowing.html',
    controller: 'FandFCtrl'
  })

//profile
  .state('account/:userid', {
        cache: false,
        url: '/account/:userid',
        templateUrl: 'templates/account.html',
        controller: 'AccountCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/signin');

});
