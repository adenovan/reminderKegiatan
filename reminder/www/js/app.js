// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('ion-reminder', ['ionic','ionic.service.core','ion-reminder.controllers','ionic-material','ngCordova','ionic-modal-select'])

.run(function($ionicPlatform) {
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
})

.config(function($stateProvider, $urlRouterProvider,$httpProvider,$ionicConfigProvider,$windowProvider) {
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('addKegiatan', {
    url: '/addKegiatan',
    templateUrl: 'templates/forms/addKegiatan.html',
    controller: 'addKegiatanCtrl'
  })

  .state('editKegiatan', {
    url: '/editKegiatan/:id_kegiatan',
    templateUrl: 'templates/forms/editKegiatan.html',
    controller: 'editKegiatanCtrl'
  })

  .state('refrensiKegiatan', {
    url: '/refrensiKegiatan/:id_kegiatan',
    templateUrl: 'templates/forms/refrensiKegiatan.html',
    controller: 'refrensiKegiatanCtrl'
  })

  .state('addUser', {
    url: '/addUser/:kategori',
    templateUrl: 'templates/forms/addUser.html',
    controller: 'addUserCtrl'
  })

  .state('editUser', {
    url: '/editUser/:id',
    templateUrl: 'templates/forms/editUser.html',
    controller: 'editUserCtrl'
  })

  .state('addPanitia', {
    url: '/addPanitia',
    templateUrl: 'templates/forms/addPanitia.html',
    controller: 'addPanitiaCtrl'
  })

  .state('editPanitia', {
    url: '/editPanitia/:id',
    templateUrl: 'templates/forms/editPanitia.html',
    controller: 'editPanitiaCtrl'
  })

  .state('addOrmawa', {
    url: '/addOrmawa',
    templateUrl: 'templates/forms/addOrmawa.html',
    controller: 'addOrmawaCtrl'
  })

  .state('editOrmawa', {
    url: '/editOrmawa/:id',
    templateUrl: 'templates/forms/editOrmawa.html',
    controller: 'editOrmawaCtrl'
  })

  .state('notifikasiKegiatan', {
    url: '/notifikasiKegiatan/:id_kegiatan',
    templateUrl: 'templates/forms/notifikasiKegiatan.html',
    controller: 'notifikasiKegiatanCtrl'
  })

  // super abstraction
  .state('super', {
    url: '/super',
    abstract: true,
    templateUrl: 'templates/super.html',
    controller: 'SuperCtrl'
  })

  .state('super.kegiatan', {
    url: '/kegiatan',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/kegiatan.html',
            controller: 'kegiatanListCtrl'
            }
        }
  })

  .state('super.user1', {
    url: '/user1',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/user1.html',
            controller: 'userListCtrl'
            }
        }
  })

  .state('super.user2', {
    url: '/user2',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/user2.html',
            controller: 'userListCtrl2'
            }
        }
  })

  .state('super.user3', {
    url: '/user3',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/user3.html',
            controller: 'userListCtrl3'
            }
        }
  })

  .state('super.panitia1', {
    url: '/panitia1',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/panitia1.html',
            controller: 'panitiaListCtrl'
            }
        }
  })

  .state('super.panitia2', {
    url: '/panitia2',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/panitia2.html',
            controller: 'panitiaListCtrl2'
            }
        }
  })

  .state('super.ormawa', {
    url: '/ormawa',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/ormawa.html',
            controller: 'ormawaListCtrl'
            }
        }
  })

  .state('super.notifikasi', {
    url: '/notifikasi',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/notifikasi.html',
            controller: 'notifikasiListCtrl'
            }
        }
  })


  .state('super.pengaturan', {
    url: '/pengaturan',
    views: {
        'menuContent': {
            templateUrl: 'templates/forms/pengaturan.html',
            controller: 'pengaturanListCtrl'
            }
        }
  })

  //admin abstraction 
  .state('admin', {
    url: '/admin',
    abstract: true,
    templateUrl: 'templates/admin.html',
    controller: 'AdminCtrl'
  })

  .state('admin.kegiatan', {
    url: '/kegiatan',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/kegiatan.html',
            controller: 'kegiatanListCtrl'
            }
        }
  })

  .state('admin.user2', {
    url: '/user2',
    views: {
        'menuContent': {
            templateUrl: 'templates/admin/user2.html',
            controller: 'userListCtrl2'
            }
        }
  })

  .state('admin.user3', {
    url: '/user3',
    views: {
        'menuContent': {
            templateUrl: 'templates/admin/user3.html',
            controller: 'userListCtrl3'
            }
        }
  })

  .state('admin.panitia1', {
    url: '/panitia1',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/panitia1.html',
            controller: 'panitiaListCtrl'
            }
        }
  })

  .state('admin.panitia2', {
    url: '/panitia2',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/panitia2.html',
            controller: 'panitiaListCtrl2'
            }
        }
  })

  .state('admin.ormawa', {
    url: '/ormawa',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/ormawa.html',
            controller: 'ormawaListCtrl'
            }
        }
  })

  .state('admin.notifikasi', {
    url: '/notifikasi',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/notifikasi.html',
            controller: 'notifikasiListCtrl'
            }
        }
  })


  .state('admin.pengaturan', {
    url: '/pengaturan',
    views: {
        'menuContent': {
            templateUrl: 'templates/forms/pengaturan.html',
            controller: 'pengaturanListCtrl'
            }
        }
  })

  //senat abstraction
  .state('senat', {
    url: '/senat',
    abstract: true,
    templateUrl: 'templates/senat.html',
    controller: 'SenatCtrl'
  })


  .state('senat.kegiatan', {
    url: '/kegiatan',
    views: {
        'menuContent': {
            templateUrl: 'templates/senat/kegiatan.html',
            controller: 'kegiatanListCtrl'
            }
        }
  })

  .state('senat.panitia1', {
    url: '/panitia1',
    views: {
        'menuContent': {
            templateUrl: 'templates/senat/panitia1.html',
            controller: 'panitiaListCtrl'
            }
        }
  })

  .state('senat.panitia2', {
    url: '/panitia2',
    views: {
        'menuContent': {
            templateUrl: 'templates/senat/panitia2.html',
            controller: 'panitiaListCtrl2'
            }
        }
  })

  .state('senat.notifikasi', {
    url: '/notifikasi',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/notifikasi.html',
            controller: 'notifikasiListCtrl'
            }
        }
  })


  .state('senat.pengaturan', {
    url: '/pengaturan',
    views: {
        'menuContent': {
            templateUrl: 'templates/forms/pengaturan.html',
            controller: 'pengaturanListCtrl'
            }
        }
  })

  //balma abstraction
  .state('balma', {
    url: '/balma',
    abstract: true,
    templateUrl: 'templates/balma.html',
    controller: 'BalmaCtrl'
  })


  .state('balma.kegiatan', {
    url: '/kegiatan',
    views: {
        'menuContent': {
            templateUrl: 'templates/balma/kegiatan.html',
            controller: 'kegiatanListCtrl'
            }
        }
  })

  .state('balma.notifikasi', {
    url: '/notifikasi',
    views: {
        'menuContent': {
            templateUrl: 'templates/super/notifikasi.html',
            controller: 'notifikasiListCtrl'
            }
        }
  })


  .state('balma.pengaturan', {
    url: '/pengaturan',
    views: {
        'menuContent': {
            templateUrl: 'templates/forms/pengaturan.html',
            controller: 'pengaturanListCtrl'
            }
        }
  })
  //panitia abstraction
  .state('panitia', {
    url: '/panitia',
    abstract: true,
    templateUrl: 'templates/panitia.html',
    controller: 'PanitiaCtrl'
  })

  .state('panitia.kegiatan', {
    url: '/kegiatan',
    views: {
        'menuContent': {
            templateUrl: 'templates/panitia/kegiatan.html',
            controller: 'kegiatanListCtrl'
            }
        }
  })

  .state('panitia.notifikasi', {
    url: '/notifikasi',
    views: {
        'menuContent': {
            templateUrl: 'templates/panitia/notifikasi.html',
            controller: 'notifikasiListCtrl'
            }
        }
  })


  .state('panitia.pengaturan', {
    url: '/pengaturan',
    views: {
        'menuContent': {
            templateUrl: 'templates/forms/pengaturan.html',
            controller: 'pengaturanListCtrl'
            }
        }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
  
  var serialize = function(obj, prefix) {
  var str = [];
  for(var p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push(typeof v == "object" ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
  };

  $httpProvider.defaults.transformRequest = function(data){
        if (data === undefined) {
            return data;
        }
        return serialize(data);
    };

    // set all post requests content type to x-www-form-urlencoded
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  $ionicConfigProvider.navBar.alignTitle('left');
  $ionicConfigProvider.tabs.position('top'); 
})

.directive('searchBar', [function () {
  return {
    scope: {
      ngModel: '='
    },
    require: ['^ionNavBar', '?ngModel'],
    restrict: 'E',
    replace: true,
    template: '<ion-nav-buttons side="right">'+
            '<div class="searchBar">'+
              '<div class="searchTxt" ng-show="ngModel.show">'+
                  '<div class="bgdiv"></div>'+
                  '<div class="bgtxt row">'+
                    '<input type="text" placeholder="Pencarian..." ng-model="ngModel.txt">'+
                    '<button class="button-clear" ng-click="cari(ngModel.txt)"><i class="ion ion-android-send icon-navbar"></i></button>'+
                  '</div>'+
                '</div>'+
                '<i class="icon placeholder-icon" ng-class="ngModel.show ?\'ion-close\':\'ion-search\'" ng-click="ngModel.show ?  pull() : ngModel.txt=undefined;ngModel.show=!ngModel.show;"></i>'+
            '</div>'+
          '</ion-nav-buttons>',
    
    compile: function (element, attrs) {

      
      return function($scope, $element, $attrs, ctrls) {
        var navBarCtrl = ctrls[0];
        $scope.navElement = $attrs.side === 'right' ? navBarCtrl.rightButtonsElement : navBarCtrl.leftButtonsElement;
        
      };
    },
    controller: ['$scope','$ionicNavBarDelegate', function($scope,$ionicNavBarDelegate){
      var title, definedClass;
      $scope.$watch('ngModel.show', function(showing, oldVal, scope) {
        if(showing!==oldVal) {
          if(showing) {
            if(!definedClass) {
              var numicons=$scope.navElement.children().length;
              angular.element($scope.navElement[0].querySelector('.searchBar')).addClass('numicons'+numicons);
            }
            
            title = $ionicNavBarDelegate.title();
            $ionicNavBarDelegate.title('');
          } else {
            $ionicNavBarDelegate.title(title);
          }
        } else if (!title) {
          title = $ionicNavBarDelegate.title();
        }
      });
    }]
  };
}])

.service('PUSH_NOTIFICATIONS', function($http,$state, $ionicPlatform, $cordovaDevice, $q,$window,$ionicPopup){

function showpopup(data){
    var popup = $ionicPopup.confirm({
      title: 'Anda mendapatkan notifikasi baru apakah anda ingin melihatnya? ',
      template: data.message,
      buttons:[{text:"Tidak"},{text:"Ya",type:"button-positive",onTap:function(e){return true;}}]
      });

    popup.then(function(res) {
          if(res) {
              var params = {'id_kegiatan':data.additionalData.id_kegiatan};
              $state.go('notifikasiKegiatan',params);
              $http.post('http://192.168.43.24/reminder/model/notif/updateNotif',{'id_notif':data.additionalData.id_notifikasi}).then(function(res){
                console.log(res);
              });
          }
    });
}

var _registered = false, _inprogress = false, _push, _gcm_id, _device;

this.init = function(){
    _inprogress = true;
    $ionicPlatform.ready(function(){

        // If already registered or not signed in

        if(_registered || ['Android','iOS'].indexOf($cordovaDevice.getPlatform()) == -1) return; // Ensure that we're running on Android or iOS

        // Push Notifications Init

        var push = PushNotification.init({
            android: {
                senderID: "5181899000" // GCM Sender ID (project ID)
            },
            ios: {
                alert: "true",
                badge: "true",
                sound: "true",
                senderID: "5181899000" // GCM Sender ID (project ID)
            }
        });

        _push = push;

        push.on('registration', function(data){
            _gcm_id = data.registrationId;

            // Post our GCM and device information to our API
            $http.post('http://192.168.43.24/reminder/model/user/updateGCM', {
                gcm_id: data.registrationId,
                device: $cordovaDevice.getDevice(),
                id : $window.localStorage['session']
            }).then(
                function(res){
                    console.log("Registered on API...");
                    console.log(res);
                    _registered = true;
                    _inprogress = false;
                },
                function(err){
                    console.log("error registering for PN", err);
                    _inprogress = false;
                }
            );
        });

        push.on('notification', function(data){
            // Here is what we will do if we get a push notification while using the app
            console.log("GOT PN", data);
            showpopup(data);
        });

        push.on('error', function(err){
            console.log("PNR Error", err);
        });
    });
};
this.unregister = function(){
    return $q(function(resolve, reject){
        _push.unregister();
        return $http.post('http://192.168.43.24/reminder/model/user/updateGCM', {id : $window.localStorage['session'],device: _device, gcm_id: "NULL"})
            .then(
                function(success){
                    _registered = false;
                    resolve();
                },
                function(err){
                    // We didn't manage to inform the server that we unregistered
                    console.log("Error unregistering");
                    resolve();
                }
            );
    });
};
})