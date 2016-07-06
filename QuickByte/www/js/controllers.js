angular.module('starter.controllers', ['ionic', 'ngCordova'])

var currentUser;
var $loader; // making the loader global so we can always access it/ set in QbSettings
var changedSearchParams; // boolean to keep track of whether or not user changed the search params
var serverUrl;

var DEFAULT_PROFILE_PIC_PATH = '/../img/default_profile_pic.png';

app.controller('MainCtrl', function($scope, $ionicLoading, $ionicScrollDelegate) {
  $loader = $ionicLoading;
  $scroll = $ionicScrollDelegate;
  changedSearchParams = false;

  $scope.getUserImgUrl = function(user) {
    return user.get("picture") != null ? user.get("picture")._url : DEFAULT_PROFILE_PIC_PATH;
  }
})

app.controller('RestaurantsCtrl', function($scope, $state) {
  $scope.$root.tabsHidden = "tabs-show";
  getLocation();
})


app.controller('TabsCtrl', function($scope, $state) {
  isLoggedOut($state);

  $scope.$root.tabsHidden = "tabs-show";
  $scope.goRestaurants = function(){
    $state.go("tab.restaurants");
  }

  $scope.goMap = function(){
    $state.go("tab.map");
  }

})

app.controller('DirectionsCtrl', function($scope, $stateParams,$state,$ionicHistory) {
  isLoggedOut($state);

  $scope.$root.tabsHidden = "tabs-hide";
  var restaurant = getRestaurant($stateParams.restaurantId);

  var map = initMap("mapDirections");
  if (restaurant) {
    console.log(restaurant);
    calculateAndDisplayRoute(
      map,
      restaurant.location.coordinate.latitude,
      restaurant.location.coordinate.longitude
    );
  }

  $scope.goBack = function(){
    $ionicHistory.goBack();
  };
})

app.controller('CommentsCtrl', function($scope, $stateParams,$state,$ionicHistory,$ionicPopup,$ionicListDelegate) {

  isLoggedOut($state);
  loadComment($scope, $loader, $stateParams);

  $scope.goBack = function(){
    $ionicHistory.goBack();
  };

  $scope.createComment = function() {
    createComment($scope, $stateParams, $loader);
  };

  $scope.deleteComment = function(commentid, index) {
    deleteComment($loader, $ionicListDelegate, $scope, commentid, index);
  };

  $scope.thumbsUp = function(index, commentid){
    var comment2Upvote = Parse.Object.extend("Comments");
    var query = new Parse.Query(comment2Upvote);
    query.equalTo("objectId",commentid);

    $loader.show();
    query.first({
      success: function(object) {
        var value = object.get("thumbsUp");
        object.increment("thumbsUp");
        object.get("usersThatHaveVoted").push(currentUser.id);
        object.save().then(function(comment) {
          $loader.hide();
          // $("#thumbsup-" + comment.id).html(comment.get("thumbsUp"));
          $scope.comments[index].set("usersThatHaveVoted", comment.get("usersThatHaveVoted"));
         $scope.comments[index].set("thumbsUp", comment.get("thumbsUp"));
          $ionicListDelegate.closeOptionButtons();
        }, function(error) {
          $loader.hide();
          alert("Error: " + error.message);
        });
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }

  $scope.thumbsDown = function(index, commentid){

    var comment2Downvote = Parse.Object.extend("Comments");
    var query = new Parse.Query(comment2Downvote);
    query.equalTo("objectId",commentid);

    $loader.show();
    query.first({
      success: function(object) {
        var value = object.get("thumbsDown");
        object.increment("thumbsDown");
        object.get("usersThatHaveVoted").push(currentUser.id);
        object.save().then(function(comment) {
          $loader.hide();
          // $("#thumbsdown-" + comment.id).html(comment.get("thumbsDown"));
          $scope.comments[index].set("usersThatHaveVoted", comment.get("usersThatHaveVoted"));
         $scope.comments[index].set("thumbsDown", comment.get("thumbsDown"));
          $ionicListDelegate.closeOptionButtons();
        }, function(error) {
          $loader.hide();
          alert("Error: " + error.message);
        });
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }


  $scope.goToProfile = function(userid) {
    $state.go('account/:userid', {userid: userid});
  }
})


app.controller('RestaurantDetailCtrl', function($scope, $stateParams,$ionicHistory, $state) {
  isLoggedOut($state);

  $scope.$root.tabsHidden = "tabs-hide";

  loadRestaurantDetail($scope, $stateParams);

  $scope.sendPush = function(restaurant) {
    // Parse.Push.send({
    //   channels: ['Broadcast'],
    //   data: {
    //     alert: currentUser.attributes.username + " is at " + restaurant.name
    //   }
    // }, {
    //   success: function() {
    //     console.log("PUSH WAS SUCCESSFUL");
    //     console.log(currentUser.attributes.username + " is at " + restaurant.name);
    //   },
    //   error: function(error) {
    //     console.log("Error: " + error.message);
    //   }
    // });

    var followerArray = new Array();

    var user = Parse.Object.extend("_User");
    var pushQuery = new Parse.Query(user);
    pushQuery.include("PublicUserData");
    var followers = currentUser.get("PublicUserData").relation("followers").query();
    followers.find({
      success: function(followers) {
        for (i in followers) {
          followerArray.push(followers[i].id);
          console.log("followers: ", followers[i].id);
        }
        pushQuery.containedIn("objectId", followerArray);
        Parse.Push.send({
          channels: followerArray,
          data: {
            alert: currentUser.attributes.username + " is at " + restaurant.name
          }
        }, {
          success: function() {
            console.log("PUSH WAS SUCCESSFUL");
            console.log(currentUser.attributes.username + " is at " + restaurant.name);
          },
          error: function(error) {
            console.log("Error: " + error.message);
          }
        });
        followerArray = [];
      },
      error: function(error) {
        console.log(error.message);
      }
    });
  }

  $scope.upVoteRestaurant = function($event) {
    // UP BUTTON DOES NOT INCREMENT THE COUNT!!!!!
    $(".vote-button").attr("disabled", true);
    var x = parseInt($("#restaurant-upvote-value").text());
    $("#restaurant-upvote-value").html(x + 1);
  }

  $scope.downVoteRestaurant = function($event) {
    $(".vote-button").attr("disabled", true);
    var x = parseInt($("#restaurant-downvote-value").text());
    $("#restaurant-downvote-value").html(x - 1);
  }

  $scope.goBack = function(){
    $scope.$root.tabsHidden = "tabs-show";
    $ionicHistory.goBack();
  };
})



app.controller('QbSettingsCtrl', function($scope, $state, $ionicSideMenuDelegate) {
  $scope.toggleRight = function() {
    $ionicSideMenuDelegate.toggleRight();
  };

  $scope.doLogoutAction = function () {
    $scope.toggleRight();
    logOut($state);
    //if(Parse.User.current()){
    //  alert("you didn't log out");
    //}else{
    //  alert("you logged out");
    //}

  };

  $scope.goToProfile = function(){
    $scope.toggleRight();
    $state.go('account/:userid', {userid: currentUser.id});
  };

  $scope.$watch(function () {
    return $ionicSideMenuDelegate.isOpen();
  },
  function (isOpen) {
    if (!isOpen && changedSearchParams){
      changedSearchParams = false;
      getLocation();
    }

  });
})

app.controller('UserCtrl', function($scope, $state) {
  isLoggedIn($state);

  $scope.gosignIn = function() {
    $state.go('signin');
  }

  $scope.signIn = function() {
    signIn($state, $loader);
  }

  $scope.gosignUp = function() {
    $state.go('signup');
  }

  $scope.signUp = function() {
    signUp($loader, $state, $scope);
  }
})

app.controller('FacebookCtrl', function($state,$scope,$cordovaFacebook){
  $scope.linkFacebook = function(){
    // alert("gonna try to link fbook");
    $cordovaFacebook.login(["public_profile", "email"]).then(function(success){
      console.log(success);
      var expiration_date = new Date();
      expiration_date.setSeconds(expiration_date.getSeconds() + success.authResponse.expiresIn);
      expiration_date = expiration_date.toISOString();

      var facebookAuthData = {
        "id": success.authResponse.userID,
        "access_token": success.authResponse.accessToken,
        "expiration_date": expiration_date
      };
      // alert(success);
      console.log(success);
      linkFbook(Parse.User.current(),facebookAuthData);

    }, function(error){
      alert("error on fbook login");
      console.log(error);
    });
    alert("finished trying");
  }

  $scope.facebookLogin = function(){
    alert("facebookLogin()");
    $cordovaFacebook.login(["public_profile", "email"]).then(function(success){
      alert("cordovaFacebook Success");
      console.log(success);
      var expiration_date = new Date();
      expiration_date.setSeconds(expiration_date.getSeconds() + success.authResponse.expiresIn);
      expiration_date = expiration_date.toISOString();

      var facebookAuthData = {
        "id": success.authResponse.userID,
        "access_token": success.authResponse.accessToken,
        "expiration_date": expiration_date
      };
      fbookLogin(facebookAuthData, $state, $scope, $loader);

      console.log(success);

    }, function(error){
      alert("cordova FAcebook login failure: "+error.message);
      console.log(error);
    });
  }
})

app.controller('MapCtrl', function($scope,$state){
  isLoggedOut($state);

  $scope.$root.tabsHidden = "tabs-show";
  console.log(document.getElementById("map"));
  //addMarker(latLng.lat, latLng.lon, "a")

  var map = initMap("map");
  addMarkers(map);
})

app.controller('ConfirmCallCtrl',function($scope, $ionicPopup, $state) {
  isLoggedOut($state);

  // A confirm dialog
  $scope.showConfirm = function(restaurant) {
    callRestaurant($ionicPopup, restaurant);
  };
})

app.controller('FandFCtrl', function($scope, $state, $ionicHistory, $stateParams) {
  isLoggedOut($state);

  $loader.show();
  $scope.default_profile_pic = DEFAULT_PROFILE_PIC_PATH;
  $scope.fftype = $stateParams.fftype;

  var query = new Parse.Query(Parse.Object.extend("_User"));
  query.include("PublicUserData");

  query.get($stateParams.userid, {
    success: function(user) {
      $scope.is_own_list = user.id == currentUser.id;

      user.get("PublicUserData").relation($scope.fftype).query().find({
        success: function(list) {
          $loader.hide();
          $scope.users = list;
        },
        error: function(obj, error) {
          $loader.hide();
          alert("Error getting " + $scope.fftype + " : " + error.message);
        }
      });
    },
    error: function(object, error) {
      $loader.hide();
      alert("Error loading results: " + error.message);
    }
  });

  $scope.goToProfile = function(userid) {
    $state.go('account/:userid', {userid: userid});
  }

  $scope.goBack = function(){
    $ionicHistory.goBack();
  };

})

app.controller('AccountCtrl', function($scope,$state,$ionicHistory,$ionicPopup,$cordovaCamera,$stateParams) {
  isLoggedOut($state);

  $scope.data = {};
  $scope.isOwnProfile = currentUser.id == $stateParams.userid;

  $loader.show();

  var query = new Parse.Query(Parse.Object.extend("_User"));
  query.include("PublicUserData");

  // Get the user for this account page
  query.get($stateParams.userid, {
    success: function(user) {
      $scope.user = user;
      $scope.isLinked = user.get("authData") != null;
      $scope.img_url = user.attributes.picture != null ? user.attributes.picture._url : DEFAULT_PROFILE_PIC_PATH;

      var data = $scope.user.get("PublicUserData");
      data.relation("followers").query().find({
        success: function(list) {
          console.log("followers: ", list);
          $scope.num_followers = list.length;
          $scope.already_following = $.grep(list, function(follower){ return follower.id == currentUser.id; }).length > 0;
          $scope.user.get("PublicUserData").relation("following").query().find({
            success: function(list) {
              console.log("following", list);
              $scope.num_following = list.length;
              $scope.user.get("PublicUserData").relation("recentComments").query().find({
                success: function(list) {
                  $loader.hide();
                  $scope.recentComments = list;
                },
                error: function(error) {
                  $loader.hide();
                  alert("Error: " + error.message);
                }
              })
            },
            error: function(error) {
              $loader.hide();
              alert("Error : " + error.message);
            }
          });
        },
        error: function(error) {
          $loader.hide();
          alert("Error : " + error.message);
        }
      });
    },
    error: function(object, error) {
      $loader.hide();
      $(".no-profile-info").find("p").html(error.message);
      // The object was not retrieved successfully.
      // error is a Parse.Error with an error code and description.
    }
  });

  $scope.editPicture = function() {
    editProfilePic($ionicPopup, $scope, $cordovaCamera);
  }

  $scope.editUsername = function() {
    editUsername($ionicPopup, $scope);
  }

  $scope.editEmail = function() {
    editEmail($ionicPopup, $scope);
  }

  $scope.editPassword = function() {
    editPassword($ionicPopup, $scope);
  }

  $scope.goBack = function(){
    $ionicHistory.goBack();
  };

  $scope.goToFollowing = function(userid) {
    $state.go(':userid/:fftype', {userid: userid, fftype: 'following'});
  }

  $scope.goToFollowers = function(userid) {
    $state.go(':userid/:fftype', {userid: userid, fftype: 'followers'});
  }

  $scope.follow = function() {
    $loader.show();

    var query = new Parse.Query(Parse.Object.extend("_User"));
    query.include("PublicUserData");
    query.get(currentUser.id, {
      success: function(curr_user) {
        var curr_user_data = curr_user.get("PublicUserData");
        curr_user_data.relation("following").add($scope.user);

        curr_user.save().then(function(result) {
          var user_data = $scope.user.get("PublicUserData");
          user_data.relation("followers").add(result);
          return user_data.save();
/////////////////////////////
ParsePushPlugin.subscribe($scope.user.get("objectId"), function(msg) {
      alert('OK');
  }, function(e) {
      alert('error');
  });
////////////////////////////////

        }).then(function(result) {
          $loader.hide();
          $scope.num_followers += 1;
          $scope.already_following = true;
        }, function(error) {
          $loader.hide();
          alert("Error: " + error.message);
        })
      },
      error: function(obj, error) {
        $loader.hide();
        alert("Error: " + error.message);
      }
    });
  }

  $scope.unfollow = function() {
    $loader.show();

    var query = new Parse.Query(Parse.Object.extend("_User"));
    query.include("PublicUserData");
    query.get(currentUser.id, {
      success: function(curr_user) {
        var curr_user_data = curr_user.get("PublicUserData");
        curr_user_data.relation("following").remove($scope.user);

        curr_user.save().then(function(result) {
          var user_data = $scope.user.get("PublicUserData");
          user_data.relation("followers").remove(result);
          return user_data.save();
/////////////////////
ParsePushPlugin.unsubscribe($scope.user.get("objectId"), function(msg) {
       alert('OK');
   }, function(e) {
       alert('error');
   });
//////////////////////////////////

        }).then(function(result) {
          $loader.hide();
          $scope.num_followers -= 1;
          $scope.already_following = false;
        }, function(error) {
          $loader.hide();
          alert("Error: " + error.message);
        })
      },
      error: function(obj, error) {
        $loader.hide();
        alert("Error: " + error.message);
      }
    });
  }
});
