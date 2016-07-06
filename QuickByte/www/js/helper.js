function isLoggedOut(state) {
  currentUser = Parse.User.current();
  if (!currentUser) {
    state.go('signin');
  }
}

function isLoggedIn(state) {
  currentUser = Parse.User.current();
  if (currentUser) {
    state.go('tab.restaurants');
  }
}

function loadComment(scope, loader, stateParams) {
  scope.comments = [];
  scope.data = {};
  scope.currentUser = currentUser;
  // scope.currentUserId = Parse.User.current();
  scope.img_url = currentUser.attributes.picture != null ? currentUser.attributes.picture._url : DEFAULT_PROFILE_PIC_PATH;

  var query = new Parse.Query(Parse.Object.extend("Comments"));
  query.equalTo('restoID', stateParams.restaurantId);
  query.ascending("updatedAt");
  query.include('userID');

  loader.show();

  query.find({
    success: function(results) {
      loader.hide();
      for (var i = 0; i < results.length; i++) {
        var comment = results[i];
        var img = comment.get('userID').get('picture');
        comment.img_url = img != null ? img._url : DEFAULT_PROFILE_PIC_PATH;
        scope.comments.unshift(comment);
      }
    },
    error: function(error) {
      loader.hide();
      alert("Error: " + error.code + " " + error.message);
    }
  });
}

function createComment(scope, stateParams, loader) {
  if (scope.data.comment) {
    scope.currentUser = currentUser;

    var Comment = Parse.Object.extend("Comments");
    var comment = new Comment();

    comment.set("userID", currentUser);
    comment.set("restoID", stateParams.restaurantId);
    comment.set("text", scope.data.comment);
    comment.set("thumbsUp",0);
    comment.set("thumbsDown",0);
    comment.set("usersThatHaveVoted",[]);

    loader.show();

    comment.save(null, {
      success: function(comment) {
        loader.hide();
        // Get recentComment relation of currentUser
        var recentCmts = currentUser.get("PublicUserData").relation("recentComments");
        // Add a comment to recentComment relation of currentUser
        recentCmts.add(comment);
        // Save currentUser's data in Parse
        currentUser.save();
        $("#comment-textarea").val("");
        var img = currentUser.get("picture");
        comment.img_url = img == null ? DEFAULT_PROFILE_PIC_PATH : img._url;
        scope.comments.unshift(comment);
      },
      error: function(comment, error) {
        loader.hide();
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        alert('Failed to create new object, with error code: ' + error.message);
      }
    });
  }
}

function deleteComment(loader, ionicListDelegate, scope, commentid, index) {
  var deathRowComment = Parse.Object.extend("Comments"); // lol nice var name
  var query = new Parse.Query(deathRowComment);

  loader.show();

  query.get(commentid, {
    success: function(myObj) {
      loader.hide();
      ionicListDelegate.closeOptionButtons();
      myObj.destroy({});
      scope.comments.splice(index, 1);
    },
    error: function(object, error) {
      loader.hide();
      ionicListDelegate.closeOptionButtons();
      alert('Failed to delete comment, with error code: ' + error.message);
      // The object was not retrieved successfully.
      // error is a Parse.Error with an error code and description.
    }
  });
}

function logOut(state) {
  ParsePushPlugin.unsubscribe(currentUser.id, function(msg) {
    alert('OK');
  }, function(e) {
    alert('error');
  });

  ParsePushPlugin.getSubscriptions(function(subscriptions) {
    alert(subscriptions);
  }, function(e) {
    alert('error');
  });

  Parse.User.logOut();
  state.go('signin');
  //    .then(function (_response) {
  // transition to next state
  //state.go('signin');
  //     }, function (_error) {
  //          alert("error logging in " + _error.debug);
  //      })
}

function signIn(state, loader) {
  var username = $('#username-input').val();
  console.log(username);
  var password = $('#password-input').val();
  console.log(password);

  loader.show();

  Parse.User.logIn(username, password, {
    success: function(user) {
      var data = user.get("PublicUserData");
      // ParsePushPlugin.register({
      //   appId:"bJq93xMNW7k0Bq8BJ8PPdL2VLkEXRQmZENQS6VRH", clientKey:"a1FsUUO7fY9q4dEuvjOtShAgDBoEEBzkBw1lL8oA", eventKey:""}, //will trigger receivePN[pnObj.myEventKey]
      //   function() {
      //     alert('successfully registered device!');
      //   }, function(e) {
      //     alert('error registering device: ' + e);
      // });
      ParsePushPlugin.getInstallationId(function(id) {
        alert(id);
      }, function(e) {
        alert('error');
      });


      if (data == null) {
        var PublicUserData = Parse.Object.extend("PublicUserData");
        data = new PublicUserData();
        data.save().then(function(data) {
          user.set("PublicUserData", data);
          return user.save();
        }).then(function(user) {
          loader.hide();
          currentUser = user;
          state.go('tab.restaurants');
        }, function(error) {
          loader.hide();
          alert("Error: " + error.message);
        });
      } else {
        loader.hide();
        currentUser = user;
        state.go('tab.restaurants');
      }
    },
    error: function(user, error) {
      loader.hide();
      alert('Error: ' + error.message);
    }
  });
}

function signUp(loader, state, scope) {
  if (/^[a-zA-Z0-9- ]*$/.test(scope.data.username) == false || !scope.data.username) {
    alert("The username is invalid.")
  } else if (!scope.data.email || !/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(scope.data.email)) {
    alert("The E-mail is invalid.")
  } else {
    loader.show();

    var PublicUserData = Parse.Object.extend("PublicUserData");
    var data = new PublicUserData();
    data.save().then(function(data) {
      var user = new Parse.User();
      user.set('username', scope.data.username);
      user.set('password', scope.data.password);
      user.set('email', scope.data.email);
      user.set('PublicUserData', data);
      return user.signUp();
    }).then(function(user) {
      loader.hide();
      state.go('signin');
      scope.data.username = "";
      scope.data.password = "";
      scope.data.email = "";
      Parse.User.logOut()
    }, function(error) {
      loader.hide();
      alert('Error: ' + error.message);
      scope.data.username = "";
      scope.data.password = "";
      scope.data.email = "";
    });

  }
}

function loadRestaurantDetail(scope, stateParams) {
  var restaurant = getRestaurant(stateParams.restaurantId);
  scope.restaurant = restaurant;
  if (restaurant) {
    // Creates a print friendly list of the restaurant's food categories
    var foodCategories = "";
    restaurant.categories.forEach(function(element, index, array) {
      // Add a comma only if we're not the first element in the list
      if (index > 0) {
        foodCategories += ", ";
      }
      foodCategories += element[0];
    });
    // Add the variable to the scope of the template
    scope.foodCategories = foodCategories;
  }
}

function callRestaurant(ionicPopup, restaurant) {
  //If there is a number, try to call it
  if (restaurant.display_phone != null) {

    var confirmPopup = ionicPopup.confirm({
      title: restaurant.display_phone,
      template: 'Are you sure you want to call this number?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        // TODO: implement phone calling
        //alert("Number:    " + restaurant.display_phone);
        window.plugins.CallNumber.callNumber(onSuccess, onError, restaurant.display_phone);

        function onSuccess() {
          console.log("Calling");
        }
        function onError() {
          alert("Error calling");
        }
        // console.log(confirmPopup.title)
        // window.plugins.phoneDialer.dial(confirmPopup.title);
      }
    });
  }
  //If there was no number, alert the user.
  else {
    alert("Number not available");
  }
}

function editProfilePic(ionicPopup, scope, cordovaCamera) {
  var editPicturePopup = ionicPopup.show({
    title: "Choose one of the options",
    scope: scope,
    buttons: [
      {
        text: 'Take<br>Photo',
        type: 'button-assertive button-small',
        onTap: function(e) {
          console.log("Take Photo");
          var options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
          };
          cordovaCamera.getPicture(options).then(function (imageData) {
            scope.imgURI = "data:image/jpeg;base64," + imageData;
            // update the picture in parse.com and then update the picture in app.
            var imgFile = new Parse.File("myPic.jpg", { base64: scope.imgURI });
            currentUser.set("picture", imgFile);
            currentUser.save(null, {
              success: function() {
                var image = document.getElementById('profile-image');
                image.src = scope.imgURI;
                alert("Your profile image has been successfully changed.");
              },
              error: function(error) {
                console.log("Error: " + error.message);
              }
            });
          }, function (err) {
            // An error occured. Show a message to the user
            console.log("Error: " + err.message);
          });
        }
      },
      {
        text: 'Pick<br>Photo',
        type: 'button-balanced button-small',
        onTap: function(e) {
          console.log("Choose Photo");
          var options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
          };

          cordovaCamera.getPicture(options).then(function (imageData) {
            scope.imgURI = "data:image/jpeg;base64," + imageData;
            // update the picture in parse.com and then update the picture in app.
            var imgFile = new Parse.File("myPic.jpg", { base64: scope.imgURI });
            currentUser.set("picture", imgFile);
            currentUser.save(null, {
              success: function() {
                var image = document.getElementById('profile-image');
                image.src = scope.imgURI;
                alert("Your profile image has been successfully changed.");
              },
              error: function(error) {
                console.log("Error: " + error.message);
              }
            });
          }, function (err) {
            // An error occured. Show a message to the user
          });
        }
      },
      {
        text: 'Cancel',
        type: 'button-small',
      }
    ]
  });
}

function editUsername(ionicPopup, scope) {
  var editUserNamePopup = ionicPopup.show({
    title: "Edit Username",
    subTitle: "Please do not use special characters<br>(e.g. !@#$%)",
    template: '<input type="text" ng-model="data.username" placeholder="' + currentUser.attributes.username + '" />' +
    '<span class="hidden error-msg"></span>',
    scope: scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (/^[a-zA-Z0-9- ]*$/.test(scope.data.username) == false || !scope.data.username) {
            alert("The username is invalid.")
            scope.data.username = '';
          } else {
            return scope.data.username;
          }
        }
      }
    ]
  });
  editUserNamePopup.then(function(res) {
    if(res) {
      currentUser.setUsername(scope.data.username)
      currentUser.save(null, {
        success: function() {
          $("#profile-username").html(scope.data.username);
          alert("Your username has been successfully changed.")
          scope.data.username = '';
        },
        error: function(error) {
          console.log("Error: " + error.message)
          scope.data.username = '';
        }
      });
    }
  });
}

function editEmail(ionicPopup, scope) {
  var editEmailPopup = ionicPopup.show({
    title: "Edit E-mail",
    subTitle: "you@domain.com",
    template: '<input type="email" ng-model="data.email" placeholder="' + currentUser.attributes.email + '" />' +
    '<span class="hidden error-msg"></span>',
    scope: scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!scope.data.email || !/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(scope.data.email)) {
            alert("The E-mail is invalid.")
            scope.data.email = '';
          } else {
            return scope.data.email;
          }
        }
      }
    ]
  });
  editEmailPopup.then(function(res) {
    if(res) {
      currentUser.setEmail(scope.data.email)
      currentUser.save(null, {
        success: function() {
          $("#profile-email").html(scope.data.email);
          alert("Your E-mail has been successfully changed.")
          scope.data.email = '';
        },
        error: function(error) {
          console.log("Error: " + error.message)
          scope.data.email = '';
        }
      });
    }
  });
}

function editPassword(ionicPopup, scope) {
  var editPasswordPopup = ionicPopup.show({
    title: "Edit password",
    template: '<input type="password" ng-model="data.password" placeholder="' + '********' + '" />' +
    '<span class="hidden error-msg"></span>',
    scope: scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!scope.data.password) {
            alert("The password is invalid.")
            scope.data.password = '';
          } else {
            return scope.data.password;
          }
        }
      }
    ]
  });
  editPasswordPopup.then(function(res) {
    if(res) {
      currentUser.setPassword(scope.data.password)
      currentUser.save(null, {
        success: function() {
          // $("#profile-password").html(scope.data.email);
          alert("Your password has been successfully changed.")
          scope.data.password = '';
        },
        error: function(error) {
          console.log("Error: " + error.message)
          scope.data.password = '';
        }
      });
    }
  });
}

//FACEBOOK CONTROLLER FUNCTIONS
//facebook linking
function linkFbook(currentUser,facebookAuthData){
  if (!Parse.FacebookUtils.isLinked(currentUser)) {
    Parse.FacebookUtils.link(currentUser, facebookAuthData, {
      success: function(user) {
        // alert("Woohoo, user logged in with Facebook!");
      },
      error: function(user, error) {
        alert("User cancelled the Facebook login or did not fully authorize."+error.message);
      }
    });
  }

}

//Sign-up or log-in using facebook
//if new user, will create an account on log in
function fbookLogin(facebookAuthData,state,scope,loader){
  alert("INside parse login");
  loader.show();
  Parse.FacebookUtils.logIn(facebookAuthData, {
    success: function(user) {
      if (!user.existed()) {
        alert("User signed up and logged in through Facebook!");
        ParsePushPlugin.subscribe(user.id, function(msg) {
          alert('subcribed to ourselves');
        }, function(e) {
          alert('error');
        });
        // alert(user.username);
        var PublicUserData = Parse.Object.extend("PublicUserData");
        var data = new PublicUserData();
        data.save().then(function(data) {
          console.log(data)
        });
        user.set('PublicUserData', data);
        user.save();
        loader.hide();
        state.go("tab.restaurants");
      } else {
        alert("User logged in through Facebook!");
        ParsePushPlugin.subscribe(user.id, function(msg) {
          alert('subcribed to ourselves');
        }, function(e) {
          alert('error');
        });
        loader.hide();
        state.go("tab.restaurants");
      }
    },
    error: function(user, error) {
      alert("User cancelled the Facebook login or did not fully authorize.");
    }
  });
}
