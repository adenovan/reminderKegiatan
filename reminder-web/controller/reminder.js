
angular.module('reminderApp',[
	'ngRoute',
	'reminder.services',
	'reminder.controller'
	]);

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

angular.module('reminderApp').config(function ($httpProvider) {
    // send all requests payload as query string
    $httpProvider.defaults.transformRequest = function(data){
        if (data === undefined) {
            return data;
        }
        return serialize(data);
    };

    // set all post requests content type to x-www-form-urlencoded
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
});

angular.module('reminderApp').config(['$routeProvider','$locationProvider',
  function($routeProvider,$locationProvider) {
    
    $routeProvider
      //super navigation
      .when('/super/kegiatan',{
        templateUrl:'view/super/kegiatan.view.html',
        controller:'superCtrl'
      })
      .when('/super/refrensi/:kegiatan',{
        templateUrl:'view/super/refrensi-kegiatan.view.html',
        controller:'superCtrl'
      })
      .when('/super/admin',{
        templateUrl:'view/super/admin.view.html',
        controller:'superCtrl'
      })
      .when('/super/panitia',{
        templateUrl:'view/super/panitia.view.html',
        controller:'superCtrl'
      })
      .when('/super/ormawa',{
        templateUrl:'view/super/ormawa.view.html',
        controller:'superCtrl'
      })
      .when('/super/notifikasi',{
        templateUrl:'view/super/notifikasi.view.html',
        controller:'superCtrl'
      })
      .when('/super/notifikasi/:kegiatan',{
        templateUrl:'view/super/notifikasi-kegiatan.view.html',
        controller:'superCtrl'
      })
      .when('/super/setting',{
        templateUrl:'view/super/setting.view.html',
        controller:'superCtrl'
      })
      .when('/super/kalender',{
        templateUrl:'view/super/kalender.view.html',
        controller:'superCtrl'
      })
      //admin navigation
      .when('/admin/kegiatan',{
        templateUrl:'view/admin/kegiatan.view.html',
        controller:'adminCtrl'
      })
      .when('/admin/refrensi/:kegiatan',{
        templateUrl:'view/admin/refrensi-kegiatan.view.html',
        controller:'adminCtrl'
      })
      .when('/admin/notifikasi/:kegiatan',{
        templateUrl:'view/admin/notifikasi-kegiatan.view.html',
        controller:'adminCtrl'
      })
      .when('/admin/admin',{
        templateUrl:'view/admin/admin.view.html',
        controller:'adminCtrl'
      })
      .when('/admin/panitia',{
        templateUrl:'view/admin/panitia.view.html',
        controller:'adminCtrl'
      })
      .when('/admin/ormawa',{
        templateUrl:'view/admin/ormawa.view.html',
        controller:'adminCtrl'
      })
      .when('/admin/notifikasi',{
        templateUrl:'view/admin/notifikasi.view.html',
        controller:'adminCtrl'
      })
      .when('/admin/setting',{
        templateUrl:'view/admin/setting.view.html',
        controller:'adminCtrl'
      })
      .when('/admin/kalender',{
        templateUrl:'view/super/kalender.view.html',
        controller:'adminCtrl'
      })

      //senat balma navigation
      .when('/senat/kegiatan',{
        templateUrl:'view/senat/kegiatan.view.html',
        controller:'senatCtrl'
      })
      .when('/senat/refrensi/:kegiatan',{
        templateUrl:'view/senat/refrensi-kegiatan.view.html',
        controller:'senatCtrl'
      })
      .when('/senat/notifikasi/:kegiatan',{
        templateUrl:'view/senat/notifikasi-kegiatan.view.html',
        controller:'senatCtrl'
      })
      .when('/senat/panitia',{
        templateUrl:'view/senat/panitia.view.html',
        controller:'senatCtrl'
      })
      .when('/senat/ormawa',{
        templateUrl:'view/senat/ormawa.view.html',
        controller:'senatCtrl'
      })
      .when('/senat/notifikasi',{
        templateUrl:'view/senat/notifikasi.view.html',
        controller:'senatCtrl'
      })
      .when('/senat/setting',{
        templateUrl:'view/senat/setting.view.html',
        controller:'senatCtrl'
      })

      //balma balma navigation
      .when('/balma/kegiatan',{
        templateUrl:'view/balma/kegiatan.view.html',
        controller:'balmaCtrl'
      })
      .when('/balma/refrensi/:kegiatan',{
        templateUrl:'view/balma/refrensi-kegiatan.view.html',
        controller:'balmaCtrl'
      })
      .when('/balma/notifikasi/:kegiatan',{
        templateUrl:'view/balma/notifikasi-kegiatan.view.html',
        controller:'balmaCtrl'
      })
      .when('/balma/notifikasi',{
        templateUrl:'view/balma/notifikasi.view.html',
        controller:'balmaCtrl'
      })
      .when('/balma/setting',{
        templateUrl:'view/balma/setting.view.html',
        controller:'balmaCtrl'
      })
      
      //navigasi panitia
      .when('/panitia/kegiatan',{
        templateUrl:'view/panitia/kegiatan.view.html',
        controller:'panitiaCtrl'
      })
      .when('/panitia/refrensi/:kegiatan',{
        templateUrl:'view/panitia/refrensi-kegiatan.view.html',
        controller:'panitiaCtrl'
      })
      .when('/panitia/notifikasi/:kegiatan',{
        templateUrl:'view/panitia/notifikasi-kegiatan.view.html',
        controller:'panitiaCtrl'
      })
      .when('/panitia/notifikasi',{
        templateUrl:'view/panitia/notifikasi.view.html',
        controller:'panitiaCtrl'
      })
      .when('/panitia/setting',{
        templateUrl:'view/panitia/setting.view.html',
        controller:'panitiaCtrl'
      })

      .when('/login',{
        templateUrl :'view/login.view.html',
        controller:'loginCtrl'
      })

      .otherwise({redirectTo:'/login'})
}])
