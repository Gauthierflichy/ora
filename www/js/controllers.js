angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  var ref = new Firebase("https://crackling-inferno-6605.firebaseio.com");
  $scope.logout = function () {
    ref.unauth();
    $state.go('login');
  };

})

.controller('loginCtrl', function($scope, $state, $ionicModal){

  $scope.isSomethingLoading = false;
  $scope.loginfb = function () {
    /*var provider = new firebase.auth.FacebookAuthProvider();
     firebase.auth().signInWithPopup(provider).then(function(result) {
     // This gives you a Facebook Access Token. You can use it to access the Facebook API.
     var token = result.credential.accessToken;
     // The signed-in user info.
     var user = result.user;
     // ...
     }).catch(function(error) {
     // Handle Errors here.
     var errorCode = error.code;
     var errorMessage = error.message;
     // The email of the user's account used.
     var email = error.email;
     // The firebase.auth.AuthCredential type that was used.
     var credential = error.credential;
     // ...
     });
     */

    var ref = new Firebase("https://crackling-inferno-6605.firebaseio.com");
    ref.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Authentication Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $state.go('app.dashboard');
      }
    });
  };

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/register.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal2 = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function () {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.loginRedirect = function () {
    $scope.modal.show();
  };

  // Open the register modal
  $scope.registerRedirect = function () {
    $scope.modal2.show();
  };

  $scope.register = function(user) {
    var ref = new Firebase("https://crackling-inferno-6605.firebaseio.com");
    ref.createUser({
      email    : user.email,
      password : user.password
    }, function(error, userData) {
      if (error) {
        console.log("Error creating user:", error);
        $scope.modal2.hide();
        $state.go('login');
      } else {
        console.log("Successfully created user account with uid:", userData.uid);
        $scope.modal2.hide();
        $state.go('app.dashboard');
      }
    });
  };

  $scope.login = function(user) {
    var isNewUser = true;
    var ref = new Firebase("https://crackling-inferno-6605.firebaseio.com");

    if (user === undefined) {
      $scope.error = 'Veuillez renseigner tous les champs';
      $scope.modal.hide();
      $state.go('login');
    } else {
      $scope.isSomethingLoading = true;

      ref.authWithPassword({
        email: user.email,
        password: user.password

      }, function testError(error, authData) {
        if (error) {
          switch (error.code) {
            case "INVALID_EMAIL":
              console.log("The specified user account email is invalid.");
              $scope.error = 'Email incorrect';
              $scope.isSomethingLoading = false;
              $state.go('login');
              break;
            case "INVALID_PASSWORD":
              console.log("The specified user account password is incorrect.");
              $scope.error = 'Mot de passe incorrect';
              $scope.isSomethingLoading = false;
              $state.go('login');
              break;
            case "INVALID_USER":
              console.log("The specified user account does not exist.");
              $scope.error = 'Ce compte inexistant';
              $scope.isSomethingLoading = false;
              $state.go('login');
              break;
            default:
              console.log("Error logging user in:", error);
              $scope.error = 'Veuillez réessayer';
              $scope.isSomethingLoading = false;
              $state.go('login');
          }
        } else {
          console.log("Authenticated successfully with payload:", authData);
          $scope.isSomethingLoading = false;
          $scope.modal.hide();
          $state.go('app.dashboard');
        }

        $scope.$apply();

      });
    }

    ref.onAuth(function(authData) {
      if (authData && isNewUser) {
        // save the user's profile into the database so we can list users,
        // use them in Security and Firebase Rules, and show profiles
        ref.child("users").child(authData.uid).set({
          provider: authData.provider,
          name: getName(authData)
        });

        function getName(authData) {
          switch(authData.provider) {
            case 'password':
              return authData.password.email.replace(/@.*/, '').replace(/\./g, "");
            case 'twitter':
              return authData.twitter.displayName;
            case 'facebook':
              return authData.facebook.displayName;
          }
        }
      }
    });
  };
})

.controller('VideosCtrl', function($scope, $http){

      $scope.categorie = function(z){
        $scope.type = z;
      };

      $scope.back = function (){
        $scope.hidebtn =false;
        $scope.type="Catégories";
      }


      $scope.hidebtn=false;//Pour cacher les boutons sur la page de vidéos

      $scope.research = function (keyword){

        $scope.hidebtn=true;
        $scope.videos = [];

        console.log(keyword);
        $scope.youtubeParams = {
          key: 'AIzaSyDK9o9agLRbyMysXeUaR1NMRAuM7393vD4',
          type: 'video',
          maxResults: '3',
          part: 'id,snippet',
          q: keyword,
          order: 'relevance',
          rating:'like',
          safeSearch:'strict',
          videoDuration:'medium',
          publishedAfter:'2016-05-01T00:00:00Z'
        };

        $http.get('https://www.googleapis.com/youtube/v3/search', {params:$scope.youtubeParams}).success(function(response){
          angular.forEach(response.items, function(child){
            $scope.videos.push(child);
          });
        });
      };

      $scope.playerVars = {
        rel: 0,
        showinfo: 0,
        modestbranding: 0
      }
    })

    
.controller('DashboardCtrl', function($scope, $state, $ionicHistory, DBconnect) {
  var ref = new Firebase("https://crackling-inferno-6605.firebaseio.com");
  var authData = ref.getAuth();
  var currentDate = new Date();
  var date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  $scope.isloading = true;

  ionic.Platform.ready(function() {
    if (authData) {
      $scope.name = DBconnect.getName(authData);
      ref.child("exercices/" + name).orderByChild("date").equalTo(date.toJSON()).on("value", function (snapshot) {
        //console.log(snapshot.val());
        $scope.myExercices = snapshot.val();

        if ($scope.myExercices == null) {
          $scope.noExos = true;
        } else {
          $scope.noExos = false;
          //$scope.$apply();
        }
        $scope.isloading = false;
        //$scope.$apply();

        ref.child("exercices/" + name + "/score").on("value", function (snapshot) {
          var tempscore = snapshot.val();
          $scope.score = tempscore.score;
          //$scope.$apply();
        });
        $ionicHistory.clearCache();
        $state.go('app.dashboard');
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });

    } else {
      ref.unauth();
      $state.go('login');
    }
  });

  $scope.validateExo = function (ex) {
    DBconnect.validateExo(ex, ref, $scope.name)
  };

  $scope.deleteExo = function (ex) {
    DBconnect.deleteExo(ex, ref, $scope.name)
  };


  $scope.new = function () {
    $state.go('app.new');
  };

})

.controller('NewCtrl', function($scope, $http, $state, $ionicHistory, DBconnect) {
  var ref = new Firebase("https://crackling-inferno-6605.firebaseio.com");
  var authData = ref.getAuth();

  $scope.name = DBconnect.getName(authData);

  var currentDate = new Date();
  var date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());


  $scope.date = date;

  $scope.category = {
    available: {},
    selectedOption: {id: '10', name: 'Abs'}
  };

  $scope.equipment = {
    available: {},
    selectedOption: {id: '1', name: 'Barbell'}
  };

  $scope.exercise = {
    available: {},
    selectedOption: {},
    image: {}
  };

  $scope.e = {
    name: {},
    newDate: $scope.date,
    series: 1,
    repetitions : 5,
    frequence: "Une seul fois"
  };



  ionic.Platform.ready(function(){
    $http({
      method: 'GET',
      url: "https://wger.de/api/v2/exercise.json/?language=2&category=" + $scope.category.selectedOption.id + "&equipment="+ $scope.equipment.selectedOption.id,
      headers: {'Accept': 'application/json',
        'Authorization': 'Token ad78fdd67e0802f6eae06c02b406fbb1b51b558a'}
    }).then(function successCallback(response) {
      $scope.exercise.available = response.data.results;
      $scope.e.name = response.data.results[0];
      $scope.is_available = true;
    }, function errorCallback(response) {
      console.log("No data found..");
    });

    $http({
      method: 'GET',
      url: 'https://wger.de/api/v2/exercisecategory.json',
      headers: {'Accept': 'application/json',
        'Authorization': 'Token ad78fdd67e0802f6eae06c02b406fbb1b51b558a'}
    }).then(function successCallback(response) {
      $scope.category.available = response.data.results;
    }, function errorCallback(response) {
      console.log("No data found..");
    });

    $http({
      method: 'GET',
      url: 'https://wger.de/api/v2/equipment/',
      headers: {'Accept': 'application/json',
        'Authorization': 'Token ad78fdd67e0802f6eae06c02b406fbb1b51b558a'}
    }).then(function successCallback(response) {
      $scope.equipment.available = response.data.results;
    }, function errorCallback(response) {
      console.log("No data found..");
    });

    $http({
      method: 'GET',
      url: "https://wger.de/api/v2/exerciseimage/"+ $scope.exercise.selectedOption.id + "/",
      headers: {'Accept': 'application/json',
        'Authorization': 'Token ad78fdd67e0802f6eae06c02b406fbb1b51b558a'}
    }).then(function successCallback(response) {
      console.log(response.data.image);
      $scope.exercise.image = response.data.image;
    }, function errorCallback(response) {
      console.log("No data found..");
      $scope.exercise.image = 'https://wger.de/static/images/icons/image-placeholder.svg';
    });

    /* Enregistrement d'un evenement */

    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    $scope.addExo = function (e) {
      //console.log(e);
      DBconnect.addExo(e, ref, $scope.name);
      $state.go('app.dashboard');
    };

    /* Fin En */

  });


  $scope.newSearch = function () {
    $http({
      method: 'GET',
      url: "https://wger.de/api/v2/exercise.json/?language=2&category=" + $scope.category.selectedOption.id + "&equipment="+ $scope.equipment.selectedOption.id,
      headers: {'Accept': 'application/json',
        'Authorization': 'Token ad78fdd67e0802f6eae06c02b406fbb1b51b558a'}
    }).then(function successCallback(response) {
      if(response.data.count !== 0){
        $scope.is_available = true;
      }else{
        $scope.is_available = false;
      }
      $scope.exercise.available = response.data.results;
      $scope.e.name = response.data.results[0];

      console.log($scope.is_available);

    }, function errorCallback(response) {
      console.log("No data found..");
    });

  };

  $scope.updateExo = function () {
    $http({
      method: 'GET',
      url: "https://wger.de/api/v2/exerciseimage/"+ $scope.exercise.selectedOption.id + "/",
      headers: {'Accept': 'application/json',
        'Authorization': 'Token ad78fdd67e0802f6eae06c02b406fbb1b51b558a'}
    }).then(function successCallback(response) {
      console.log(response.data.image);
      $scope.exercise.image = response.data.image;
    }, function errorCallback(response) {
      console.log("No data found..");
      $scope.exercise.image = 'https://wger.de/static/images/icons/image-placeholder.svg';
    });
  };
})

.controller('ProfileCtrl', function ($scope, $state) {
  //
});
