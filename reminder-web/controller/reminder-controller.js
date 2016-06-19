angular
	.module('reminder.controller',['ngMaterial','ngMessages','ngMdIcons','ngCookies','ngFileUpload','materialCalendar']);

angular
	.module('reminder.controller')
	.config(function ($mdThemingProvider,$mdDateLocaleProvider) {
	$mdThemingProvider
    .theme('default')
    .primaryPalette('blue',{
    	'default' : '500',
    	'hue-1' : '400',
    	'hue-2': '800', 
      	'hue-3': 'A400'
    })
    .accentPalette('green',{
    	'default' : '500',
    	'hue-1' : '100',
    	'hue-2': '600', 
      	'hue-3': 'A100'
    })
    .warnPalette('red');
    $mdDateLocaleProvider.formatDate = function(date) {
       return moment(date).format('YYYY-MM-DD');
    };
});

angular
	.module('reminder.controller')
	.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

angular
	.module('reminder.controller')
	.directive('validNumber', function() {
  return {
    require: '?ngModel',
    link: function(scope, element, attrs, ngModelCtrl) {
      if(!ngModelCtrl) {
        return; 
      }

      ngModelCtrl.$parsers.push(function(val) {
        if (angular.isUndefined(val)) {
            var val = '';
        }
        var clean = val.replace( /[^0-9]+/g, '');
        if (val !== clean) {
          ngModelCtrl.$setViewValue(clean);
          ngModelCtrl.$render();
        }
        return clean;
      });

      element.bind('keypress', function(event) {
        if(event.keyCode === 32) {
          event.preventDefault();
        }
      });
    }
  };
});

angular.module('reminder.controller')
	.controller('loginCtrl', ['$scope','loginService','$log', '$location','$cookies',
	function($scope,loginService,$log,$location,$cookies){
		$scope.user ={};

		//LOGIN FUNCTION
		$scope.login = function(postData){
			return loginService.login(postData)
			.then(function(response){
				if(response.data.hasOwnProperty('error')){
					$scope.serverError = response.data.error;
					$scope.errorClass = "warn";
				}else{
					$scope.serverError = "Login Sukses";
					$scope.errorClass = "primary";
					$cookies.put('session',response.data.Session);
					$cookies.put('hak_akses',response.data.hak_akses);
					switch(response.data.hak_akses){
						case '0':
							$location.path('/super/kegiatan');
						break;
						case '1':
							$location.path('/admin/kegiatan');
						break;
						case '2':
							$location.path('/senat/kegiatan');
						break;
						//todo balma location
						case '3':
							$location.path('/balma/kegiatan');
						break;
						case '4':
							$location.path('/panitia/kegiatan');
						break;
						default:
							$scope.serverError = "Kegiatan anda telah berakhir hubungi senat mahasiwa untuk kegiatan yang baru";
						break;
					}
				}
			});
		}
	}]);

angular.module('reminder.controller')
	.controller('mainCtrl', ['$scope','$location','$cookies','$log','Poller','$interval',
	function($scope,$location,$cookies,$log,Poller,$interval){

	var Repeater = function () {
        Poller.poll('model/notif/longPolling/'+$cookies.get('session')).then(function(data){;
        	if($scope.dataNotif!==data.notif_count){
        		if($scope.dataNotif<data.notif_count){
        			var audio = new Audio('audio/sting.mp3');
					audio.play();
				}
            $scope.dataNotif = data.notif_count;
        	}
        });

        if($cookies.get('hak_akses')!=='4'){
        Poller.poll('model/kegiatan/poll').then(function(data){;
        	if($scope.pollKegiatan!==data.total_kegiatan){
            $scope.pollKegiatan = data.total_kegiatan;
        	}
        });
    	}
    };
    if($location.path()!=='/login'){
	$interval(Repeater,1000);
	}

	$scope.sidenav = {
		super : false,
		admin : false,
		senat : false,
		balma : false,
		panitia:false
	}
	$scope.$on('$routeChangeSuccess', function(next, current) {
		auditAkses();
	});

	function auditAkses(){
		if($location.path()!=='/login'){
			switch($cookies.get('hak_akses')){
			case '0':
				$scope.sidenav.super = true;
			break;
			case '1':
				$scope.sidenav.admin = true;
			break;
			case '2':
				$scope.sidenav.senat = true;
			break;
			case '3':
				$scope.sidenav.balma = true;
			break;
			case '4':
				$scope.sidenav.panitia = true;
			break;
			}
		}else{
			$scope.sidenav = {
			super : false,
			admin : false,
			senat : false,
			balma : false,
			panitia:false
			}
		}
	}
}]);

angular.module('reminder.controller')
	.controller('superCtrl', 
	['$scope','userService','$cookies','$log','$location','$mdSidenav','$mdComponentRegistry','$routeParams',
	function($scope,userService,$cookies,$log,$location,$mdSidenav,$mdComponentRegistry,$routeParams){
		$scope.user= null;
		$scope.menu= [];
		$scope.navigateTo = navigateTo;
		$scope.toggleSidenav = toggleSidenav;
		$scope.logout = logout;
		$scope.routeKegiatan = $routeParams.kegiatan;
		$scope.session = $cookies.get('session');
		$scope.hak_akses = $cookies.get('hak_akses');
		$scope.refreshBox = refreshBox;
		$scope.aksesCheck = aksesCheck;
		$scope.$on('$routeChangeSuccess', function(next, current) {
			menuHighlight($location.path());
			menu();
			$scope.refreshBox();
			$mdComponentRegistry.when('left').then(function(it){
  			it.close();
			});
		});
		$scope.aksesCheck();
		menuHighlight($location.path());
		menu();
		$scope.refreshBox();

		function aksesCheck(){
			if($cookies.get('hak_akses')!=='0'){
				$log.log("Unauthorized Super Admin ");
				switch($cookies.get('hak_akses')){
					case '1':
						$location.path('/admin/kegiatan');
					break;
					case '2':
						$location.path('/senat/kegiatan');
					break;
					case '3':
						$location.path('/balma/kegiatan');
					break;
					case '4':
						$location.path('/panitia/kegiatan');
					break;
				}
			}
		}
		function refreshBox(){
			userService.GetBoxById($scope.session).then(getBox);
		}

		function menuHighlight(location){
			$scope.fill = 
			{
				kegiatan : '#757575',
				admin:'#757575',
				panitia:'#757575',
				ormawa:'#757575',
				notifikasi:'#757575',
				setting:'#757575',
				kalender:'#757575'
			};
			$scope.backgrounds ={
					kegiatan : 'rgba(0,0,0,0)',
					admin:'rgba(0,0,0,0)',
					panitia:'rgba(0,0,0,0)',
					ormawa:'rgba(0,0,0,0)',
					notifikasi:'rgba(0,0,0,0)',
					setting:'rgba(0,0,0,0)',
					kalender:'rgba(0,0,0,0)'
			};
			switch(location){
				case '/super/kegiatan':
					$scope.fill.kegiatan = '#1565C0';
					$scope.backgrounds.kegiatan = 'rgba(0,0,0,.06)';
					break;
				case '/super/admin':
					$scope.fill.admin = '#1565C0';
					$scope.backgrounds.admin = 'rgba(0,0,0,.06)';
					break;
				case '/super/panitia':
					$scope.fill.panitia = '#1565C0';
					$scope.backgrounds.panitia = 'rgba(0,0,0,.06)';
					break;
				case '/super/ormawa':
					$scope.fill.ormawa = '#1565C0';
					$scope.backgrounds.ormawa = 'rgba(0,0,0,.06)';
				break;
				case '/super/notifikasi':
					$scope.fill.notifikasi = '#1565C0';
					$scope.backgrounds.notifikasi = 'rgba(0,0,0,.06)';
				break;
				case '/super/setting':
					$scope.fill.setting = '#1565C0';
					$scope.backgrounds.setting = 'rgba(0,0,0,.06)';
				break;
				case '/super/kalender':
					$scope.fill.kalender = '#1565C0';
					$scope.backgrounds.kalender = 'rgba(0,0,0,.06)';
				break;
			}
		}

		function menu(){
			$scope.menu = [
				{
					link: '/super/kegiatan',
					title:'Kelola Kegiatan',
					icon :'dashboard',
					fill : $scope.fill.kegiatan,
					backgrounds : $scope.backgrounds.kegiatan
				},
				{
					link: '/super/admin',
					title:'Kelola User',
					icon :'person',
					fill : $scope.fill.admin,
					backgrounds : $scope.backgrounds.admin
				},
				{
					link: '/super/panitia',
					title:'Kelola Panitia',
					icon :'group',
					fill : $scope.fill.panitia,
					backgrounds : $scope.backgrounds.panitia
				},
				{
					link: '/super/ormawa',
					title:'Kelola Ormawa',
					icon :'link',
					fill : $scope.fill.ormawa,
					backgrounds : $scope.backgrounds.ormawa
				},
				{
					link: '/super/notifikasi',
					title:'Notifikasi',
					icon :'notifications',
					fill: $scope.fill.notifikasi,
					backgrounds : $scope.backgrounds.notifikasi
				},
				{
					link: '/super/kalender',
					title:'Kalender Kegiatan',
					icon :'event',
					fill: $scope.fill.kalender,
					backgrounds : $scope.backgrounds.kalender
				}				
			];
		}

		function navigateTo(url){
			$location.path(url);
		}

		function getBox(response){
			$scope.user = response.data;
		}

		function toggleSidenav(menuId){
			$mdSidenav(menuId).toggle();
		}

		function logout(){
			userService.Logout().then(handleSuccess,handleError);
			function handleSuccess(){
				$location.path('/login');
			}
			function handleError(response){
				$log.log(response.data);
			}
		}
}]);

//TODO ADMIN CTRL VIEW
angular.module('reminder.controller')
	.controller('adminCtrl', ['$scope','userService','$cookies','$log','$location','$mdSidenav','$mdComponentRegistry','$routeParams',
	function($scope,userService,$cookies,$log,$location,$mdSidenav,$mdComponentRegistry,$routeParams){
		$scope.user= {};
		$scope.menu= [];
		$scope.navigateTo = navigateTo;
		$scope.toggleSidenav = toggleSidenav;
		$scope.logout = logout;
		$scope.refreshBox = refreshBox;
		$scope.routeKegiatan = $routeParams.kegiatan;
		$scope.aksesCheck = aksesCheck;

		menuHighlight($location.path());
		menu();
		$scope.refreshBox();
		$scope.aksesCheck();

		$scope.$on('$routeChangeSuccess', function(event,next, current) {
			menuHighlight($location.path());
			menu();
			$scope.refreshBox();
			$mdComponentRegistry.when('left').then(function(it){
  			it.close();
			});
		});

		function aksesCheck(){
			if($cookies.get('hak_akses')!=='1'){
				$log.log("Unauthorized Admin");
				switch($cookies.get('hak_akses')){
					case '0':
						$location.path('/super/kegiatan');
					break;
					case '2':
						$location.path('/senat/kegiatan');
					break;
					case '3':
						$location.path('/balma/kegiatan');
					break;
					case '4':
						$location.path('/panitia/kegiatan');
					break;
				}
			}
		}

		function refreshBox(){
			userService.GetBoxById($cookies.get('session')).then(getBox);
		}

		function menuHighlight(location){
			$scope.fill = 
			{
				kegiatan : '#757575',
				admin : '#757575',
				panitia:'#757575',
				ormawa:'#757575',
				notifikasi:'#757575',
				setting:'#757575',
				kalender:'#757575'
			};
			$scope.backgrounds ={
					kegiatan : 'rgba(0,0,0,0)',
					admin : 'rgba(0,0,0,0)',
					panitia:'rgba(0,0,0,0)',
					ormawa:'rgba(0,0,0,0)',
					notifikasi:'rgba(0,0,0,0)',
					setting:'rgba(0,0,0,0)',
					kalender:'rgba(0,0,0,0)'
			};
			switch(location){
				case '/admin/kegiatan':
					$scope.fill.kegiatan = '#1565C0';
					$scope.backgrounds.kegiatan = 'rgba(0,0,0,.06)';
					break;
				case '/admin/admin':
					$scope.fill.admin = '#1565C0';
					$scope.backgrounds.admin = 'rgba(0,0,0,.06)';
					break;
				case '/admin/panitia':
					$scope.fill.panitia = '#1565C0';
					$scope.backgrounds.panitia = 'rgba(0,0,0,.06)';
					break;
				case '/admin/ormawa':
					$scope.fill.ormawa = '#1565C0';
					$scope.backgrounds.ormawa = 'rgba(0,0,0,.06)';
				break;
				case '/admin/notifikasi':
					$scope.fill.notifikasi = '#1565C0';
					$scope.backgrounds.notifikasi = 'rgba(0,0,0,.06)';
				break;
				case '/admin/setting':
					$scope.fill.setting = '#1565C0';
					$scope.backgrounds.setting = 'rgba(0,0,0,.06)';
				break;
				case '/admin/kalender':
					$scope.fill.kalender = '#1565C0';
					$scope.backgrounds.kalender = 'rgba(0,0,0,.06)';
				break;
			}
		}

		function menu(){
			$scope.menu = [
				{
					link: '/admin/kegiatan',
					title:'Kelola Kegiatan',
					icon :'dashboard',
					fill : $scope.fill.kegiatan,
					backgrounds : $scope.backgrounds.kegiatan
				},
				{
					link: '/admin/admin',
					title:'Kelola User',
					icon :'person',
					fill : $scope.fill.admin,
					backgrounds : $scope.backgrounds.admin
				},
				{
					link: '/admin/panitia',
					title:'Kelola Panitia',
					icon :'group',
					fill : $scope.fill.panitia,
					backgrounds : $scope.backgrounds.panitia
				},
				{
					link: '/admin/ormawa',
					title:'Kelola Ormawa',
					icon :'link',
					fill : $scope.fill.ormawa,
					backgrounds : $scope.backgrounds.ormawa
				},
				{
					link: '/admin/notifikasi',
					title:'Notifikasi',
					icon :'notifications',
					fill: $scope.fill.notifikasi,
					backgrounds : $scope.backgrounds.notifikasi
				},				{
					link: '/admin/kalender',
					title:'Kalender Kegiatan',
					icon :'event',
					fill: $scope.fill.kalender,
					backgrounds : $scope.backgrounds.kalender
				}
			];
		}

		function navigateTo(url){
			$location.path(url);
		}

		function getBox(response){
			$scope.user = response.data;
		}

		function toggleSidenav(menuId){
			$mdSidenav(menuId).toggle();
		}

		function logout(){
			userService.Logout().then(handleSuccess,handleError);
			function handleSuccess(response){
				$location.path('/login');
			}
			function handleError(response){
				$log.log(response.data);
			}
		}
}]);

angular.module('reminder.controller')
	.controller('senatCtrl', ['$scope','userService','$cookies','$log','$location','$mdSidenav','$mdComponentRegistry','$routeParams',
	function($scope,userService,$cookies,$log,$location,$mdSidenav,$mdComponentRegistry,$routeParams){
		$scope.user= {};
		$scope.menu= [];
		$scope.navigateTo = navigateTo;
		$scope.toggleSidenav = toggleSidenav;
		$scope.logout = logout;
		$scope.refreshBox = refreshBox;
		$scope.routeKegiatan = $routeParams.kegiatan;
		$scope.aksesCheck = aksesCheck;

		menuHighlight($location.path());
		menu();
		$scope.refreshBox();
		$scope.aksesCheck();
		
		$scope.$on('$routeChangeSuccess', function(event,next, current) {
			menuHighlight($location.path());
			menu();
			$scope.refreshBox();
			$mdComponentRegistry.when('left').then(function(it){
  			it.close();
			});
		});

		function aksesCheck(){
			if($cookies.get('hak_akses')!=='2'){
				$log.log("Unauthorized Senat");
				switch($cookies.get('hak_akses')){
					case '0':
						$location.path('/super/kegiatan');
					break;
					case '1':
						$location.path('/admin/kegiatan');
					break;
					case '3':
						$location.path('/balma/kegiatan');
					break;
					case '4':
						$location.path('/panitia/kegiatan');
					break;
				}
			}
		}

		function refreshBox(){
			userService.GetBoxById($cookies.get('session')).then(getBox);
		}

		function menuHighlight(location){
			$scope.fill = 
			{
				kegiatan : '#757575',
				panitia:'#757575',
				ormawa:'#757575',
				notifikasi:'#757575',
				setting:'#757575'
			};
			$scope.backgrounds ={
					kegiatan : 'rgba(0,0,0,0)',
					panitia:'rgba(0,0,0,0)',
					ormawa:'rgba(0,0,0,0)',
					notifikasi:'rgba(0,0,0,0)',
					setting:'rgba(0,0,0,0)'
			};
			switch(location){
				case '/senat/kegiatan':
					$scope.fill.kegiatan = '#1565C0';
					$scope.backgrounds.kegiatan = 'rgba(0,0,0,.06)';
					break;
				case '/senat/panitia':
					$scope.fill.panitia = '#1565C0';
					$scope.backgrounds.panitia = 'rgba(0,0,0,.06)';
					break;
				case '/senat/ormawa':
					$scope.fill.ormawa = '#1565C0';
					$scope.backgrounds.ormawa = 'rgba(0,0,0,.06)';
				break;
				case '/senat/notifikasi':
					$scope.fill.notifikasi = '#1565C0';
					$scope.backgrounds.notifikasi = 'rgba(0,0,0,.06)';
				break;
				case '/senat/setting':
					$scope.fill.setting = '#1565C0';
					$scope.backgrounds.setting = 'rgba(0,0,0,.06)';
				break;
			}
		}

		function menu(){
			$scope.menu = [
				{
					link: '/senat/kegiatan',
					title:'Kelola Kegiatan',
					icon :'dashboard',
					fill : $scope.fill.kegiatan,
					backgrounds : $scope.backgrounds.kegiatan
				},
				{
					link: '/senat/panitia',
					title:'Kelola Panitia',
					icon :'group',
					fill : $scope.fill.panitia,
					backgrounds : $scope.backgrounds.panitia
				},
				{
					link: '/senat/ormawa',
					title:'Kelola Ormawa',
					icon :'link',
					fill : $scope.fill.ormawa,
					backgrounds : $scope.backgrounds.ormawa
				},
				{
					link: '/senat/notifikasi',
					title:'Notifikasi',
					icon :'notifications',
					fill: $scope.fill.notifikasi,
					backgrounds : $scope.backgrounds.notifikasi
				}
			];
		}

		function navigateTo(url){
			$location.path(url);
		}

		function getBox(response){
			$scope.user = response.data;
		}

		function toggleSidenav(menuId){
			$mdSidenav(menuId).toggle();
		}

		function logout(){
			userService.Logout().then(handleSuccess,handleError);
			function handleSuccess(){
				$location.path('/login');
			}
			function handleError(response){
				$log.log(response.data);
			}
		}
}]);

angular.module('reminder.controller')
	.controller('balmaCtrl', ['$scope','userService','$cookies','$log','$location','$mdSidenav','$mdComponentRegistry','$routeParams',
	function($scope,userService,$cookies,$log,$location,$mdSidenav,$mdComponentRegistry,$routeParams){
		$scope.user= {};
		$scope.menu= [];
		$scope.navigateTo = navigateTo;
		$scope.toggleSidenav = toggleSidenav;
		$scope.logout = logout;
		$scope.refreshBox = refreshBox;
		$scope.routeKegiatan = $routeParams.kegiatan;
		$scope.aksesCheck = aksesCheck;

		menuHighlight($location.path());
		menu();
		$scope.refreshBox();
		$scope.aksesCheck();
		
		$scope.$on('$routeChangeSuccess', function(event,next, current) {
			menuHighlight($location.path());
			menu();
			$scope.refreshBox();
			$mdComponentRegistry.when('left').then(function(it){
  			it.close();
			});
		});

		function aksesCheck(){
			if($cookies.get('hak_akses')!=='3'){
				$log.log("Unauthorized Balma");
				switch($cookies.get('hak_akses')){
					case '0':
						$location.path('/super/kegiatan');
					break;
					case '1':
						$location.path('/admin/kegiatan');
					break;
					case '2':
						$location.path('/senat/kegiatan');
					break;
					case '4':
						$location.path('/panitia/kegiatan');
					break;
				}
			}
		}

		function refreshBox(){
			userService.GetBoxById($cookies.get('session')).then(getBox);
		}

		function menuHighlight(location){
			$scope.fill = 
			{
				kegiatan : '#757575',
				notifikasi:'#757575',
				setting:'#757575'
			};
			$scope.backgrounds ={
					kegiatan : 'rgba(0,0,0,0)',
					notifikasi:'rgba(0,0,0,0)',
					setting:'rgba(0,0,0,0)'
			};
			switch(location){
				case '/balma/kegiatan':
					$scope.fill.kegiatan = '#1565C0';
					$scope.backgrounds.kegiatan = 'rgba(0,0,0,.06)';
					break;
				case '/balma/notifikasi':
					$scope.fill.notifikasi = '#1565C0';
					$scope.backgrounds.notifikasi = 'rgba(0,0,0,.06)';
				break;
				case '/balma/setting':
					$scope.fill.setting = '#1565C0';
					$scope.backgrounds.setting = 'rgba(0,0,0,.06)';
				break;
			}
		}

		function menu(){
			$scope.menu = [
				{
					link: '/balma/kegiatan',
					title:'Kelola Kegiatan',
					icon :'dashboard',
					fill : $scope.fill.kegiatan,
					backgrounds : $scope.backgrounds.kegiatan
				},
				{
					link: '/balma/notifikasi',
					title:'Notifikasi',
					icon :'notifications',
					fill: $scope.fill.notifikasi,
					backgrounds : $scope.backgrounds.notifikasi
				}
			];
		}

		function navigateTo(url){
			$location.path(url);
		}

		function getBox(response){
			$scope.user = response.data;
		}

		function toggleSidenav(menuId){
			$mdSidenav(menuId).toggle();
		}

		function logout(){
			userService.Logout().then(handleSuccess,handleError);
			function handleSuccess(){
				$location.path('/login');
			}
			function handleError(response){
				$log.log(response.data);
			}
		}
}]);

angular.module('reminder.controller')
	.controller('panitiaCtrl', ['$scope','userService','$cookies','$log','$location','$mdSidenav','$mdComponentRegistry','$routeParams',
	function($scope,userService,$cookies,$log,$location,$mdSidenav,$mdComponentRegistry,$routeParams){
		$scope.user= {};
		$scope.menu= [];
		$scope.navigateTo = navigateTo;
		$scope.toggleSidenav = toggleSidenav;
		$scope.logout = logout;
		$scope.refreshBox = refreshBox;
		$scope.routeKegiatan = $routeParams.kegiatan;
		$scope.aksesCheck = aksesCheck;

		menuHighlight($location.path());
		menu();
		$scope.refreshBox();
		$scope.aksesCheck();
		
		$scope.$on('$routeChangeSuccess', function(event,next, current) {
			menuHighlight($location.path());
			menu();
			$scope.refreshBox();
			$mdComponentRegistry.when('left').then(function(it){
  			it.close();
			});
		});

		function aksesCheck(){
			if($cookies.get('hak_akses')!=='4'){
				$log.log("Unauthorized Panitia");
				switch($cookies.get('hak_akses')){
					case '0':
						$location.path('/super/kegiatan');
					break;
					case '1':
						$location.path('/admin/kegiatan');
					break;
					case '2':
						$location.path('/senat/kegiatan');
					break;
					case '3':
						$location.path('/balma/kegiatan');
					break;
				}
			}
		}

		function refreshBox(){
			userService.GetBoxById($cookies.get('session')).then(getBox);
		}

		function menuHighlight(location){
			$scope.fill = 
			{
				kegiatan : '#757575',
				notifikasi:'#757575',
				setting:'#757575'
			};
			$scope.backgrounds ={
					kegiatan : 'rgba(0,0,0,0)',
					notifikasi:'rgba(0,0,0,0)',
					setting:'rgba(0,0,0,0)'
			};
			switch(location){
				case '/panitia/kegiatan':
					$scope.fill.kegiatan = '#1565C0';
					$scope.backgrounds.kegiatan = 'rgba(0,0,0,.06)';
					break;
				case '/panitia/notifikasi':
					$scope.fill.notifikasi = '#1565C0';
					$scope.backgrounds.notifikasi = 'rgba(0,0,0,.06)';
				break;
				case '/panitia/setting':
					$scope.fill.setting = '#1565C0';
					$scope.backgrounds.setting = 'rgba(0,0,0,.06)';
				break;
			}
		}

		function menu(){
			$scope.menu = [
				{
					link: '/panitia/kegiatan',
					title:'Kegiatan Anda',
					icon :'dashboard',
					fill : $scope.fill.kegiatan,
					backgrounds : $scope.backgrounds.kegiatan
				},
				{
					link: '/panitia/notifikasi',
					title:'Notifikasi',
					icon :'notifications',
					fill: $scope.fill.notifikasi,
					backgrounds : $scope.backgrounds.notifikasi
				}
			];
		}

		function navigateTo(url){
			$location.path(url);
		}

		function getBox(response){
			$log.log(response);
			$scope.user = response.data;
		}

		function toggleSidenav(menuId){
			$mdSidenav(menuId).toggle();
		}

		function logout(){
			userService.Logout().then(handleSuccess,handleError);
			function handleSuccess(){
				$location.path('/login');
			}
			function handleError(response){
				$log.log(response.data);
			}
		}
}]);

angular.module('reminder.controller').controller('kegiatanListCtrl', 
	['$scope','kegiatanService','$cookies','$log','$location','$mdDialog','$mdMedia','panitiaService','ukmService','$mdToast','$filter',
	function($scope,kegiatanService,$cookies,$log,$location,$mdDialog,$mdMedia,panitiaService,ukmService,$mdToast,$filter){
	$scope.kegiatanList = null;
	$scope.panitiaList = [];
	$scope.ukmList = [];
	$scope.dataKegiatan = [];
	$scope.addKegiatan = addKegiatan;
	$scope.deleteKegiatan = deleteKegiatan;
	$scope.editKegiatan = editKegiatan;
	$scope.refrensiKegiatan = refrensiKegiatan;
	$scope.pull = pull;
	$scope.refresh = refresh;
	$scope.getMore = getMore;
	$scope.showSimpleToast = showSimpleToast;
	$scope.orderBy = orderBy;
	$scope.cari = cari;
	$scope.switchToolbar = switchToolbar;
	$scope.pull();
	$scope.$watch('pollKegiatan', function(newValue ,oldValue) {
		if(newValue > oldValue){
			$log.log("newValue : " + newValue);
			$log.log("oldValue : " + oldValue);
       		$scope.refresh((newValue-oldValue));
       	}
    },true);
	$scope.$watch(function() {
	      return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	      $scope.customFullscreen = (wantsFullScreen === true);
	});

	function cari(){
		$scope.kegiatanList = null;
		kegiatanService.Search($scope.textCari).then(GetSearch);
	}

	function switchToolbar(){
		$scope.showSearch = false;
		$scope.kegiatanList = null;
		$scope.pull();
		$scope.textCari = null;
	}

	function orderBy(key){
		$scope.key = key;
		$scope.reverse = ($scope.key === key) ? !$scope.reverse : false;
		$scope.icon = ($scope.reverse) ? 'arrow_drop_down' : 'arrow_drop_up';
		$scope.kegiatanList  = $filter('orderBy')($scope.kegiatanList,key,$scope.reverse);
	}

	function pull(){
		if($cookies.get('hak_akses') === '4'){
			kegiatanService.GetAllKegiatanPanitia($cookies.get('session')).then(GetAll);
		}else{
			kegiatanService.GetAll().then(GetAll);
		}
		
	}

	function getMore(){
		if($cookies.get('hak_akses') === '4'){
			kegiatanService.GetAllOffsetKegiatanPanitia($scope.kegiatanList.length).then(moreAll);
		}else{
			kegiatanService.GetAllOffset(10,$scope.kegiatanList.length).then(moreAll);
		}
	}

	function refresh(limit){
		kegiatanService.GetAllLimit(limit).then(refreshAll);
	}

	function refreshAll(response){
		$log.log('refresh');
		$log.log(response.data);
		$scope.kegiatanList.splice.apply($scope.kegiatanList,[0,0].concat(response.data));
	};

	function GetAll(response){
		$log.log(response.data);
		$scope.kegiatanList = response.data;
	};

	function GetSearch(response){
		$log.log(response.data);
		if(response.status===404){
			$scope.showSimpleToast(response.data.error);
			$scope.kegiatanList = {};
		}else{
			$scope.kegiatanList = response.data;
		}
		
	};

	function moreAll(response){
		//$log.log(response.data);
		$scope.kegiatanList = $scope.kegiatanList.concat(response.data);
	}

	function showSimpleToast(content) {
    	$mdToast.show(
      	$mdToast.simple()
        .textContent(content)
        .position('top right')
        .hideDelay(2000)
    	);
  	};

	function deleteKegiatan(ev,index,kegiatan,id_kegiatan) {
		$mdDialog.show({
	      controller: deleteKegiatanCtrl,
	      templateUrl: 'view/super/deletekegiatan.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: false,
	      locals : {
            id : id_kegiatan,
            kegiatan : kegiatan,
            index:index
          }
	    }).then(function(data) {

	      if(data.id !== undefined){
	      	kegiatanService.Delete({'id_kegiatan':data.id}).then(handleSuccess,handleError);
	      }
	      function handleSuccess(response){
	    		$log.log(response.data);
	    		$scope.showSimpleToast(response.data.success);
	    		$log.log(" Splice " + data.index)
	    		$scope.kegiatanList.splice(data.index,1);
	    	}
	    	function handleError(response){
	    		$log.log(response.data);
	    		$scope.showSimpleToast(response.data.error);
	    	}
	    }, function() {
	      $scope.showSimpleToast('Delete kegiatan di batalkan');
	    });
  	};

	function addKegiatan(ev) {
	    $mdDialog.show({
	      controller: addKegiatanCtrl,
	      templateUrl: 'view/super/addkegiatan.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: $scope.customFullscreen
	    })
	    .then(function(dataKegiatan) {
	    	$log.log(dataKegiatan);
	    	kegiatanService.Create(dataKegiatan).then(handleSuccess,handleError);
	    	function handleSuccess(response){
	    		$log.log(response);
	    		$scope.showSimpleToast(response.data.success);
	    	}
	    	function handleError(response){
	    		$log.log(response);
	    		$scope.showSimpleToast(response.data.error);
	    	}
	    }, function() {
	       $scope.showSimpleToast("Tambah Kegiatan di batalkan");
	    });
  	};

  	function editKegiatan(ev,id_kegiatan,index) {
  		$log.log(id_kegiatan);
  		$log.log(index);
	    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
	    $mdDialog.show({
	      controller: editKegiatanCtrl,
	      templateUrl: 'view/super/editkegiatan.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: $scope.customFullscreen,
	      locals : {
            id : id_kegiatan,
            indexs : index
          }
	    })
	    .then(function(dataKegiatan,indexs) {
	    	$log.log('Answer Edit');
	    	kegiatanService.Update(dataKegiatan).then(handleSuccess,handleError);
	    	function handleSuccess(response){
	    		$log.log("Edit Kegiatan");
	    		$log.log(response.data);
	    		updateInterface();
	    		$scope.showSimpleToast(response.data.success);
	    	}
	    	
	 		function updateInterface(){
	 			kegiatanService.GetById(dataKegiatan.id_kegiatan).then(handleInterface,handleError);
	 		}

	    	function handleInterface(response){
	    		$log.log("Edit User Interface");
	    		$log.log(response.data);
	    		$scope.kegiatanList[index] = response.data;
	    	}

	    	function handleError(response){
	    		$log.log(response);
	    		$scope.showSimpleToast(response.data.error);
	    	}
	    }, function() {
	      $scope.showSimpleToast("Edit Kegiatan di batalkan");
	    });
  	};

  	function refrensiKegiatan(id_kegiatan) {
  		switch($cookies.get('hak_akses')){
				case '0':
				$location.path('/super/refrensi/'+id_kegiatan);
				break;
				case '1':
				$location.path('/admin/refrensi/'+id_kegiatan);
				break;
				case '2':
				$location.path('/senat/refrensi/'+id_kegiatan);
				break;
				case '3':
				$location.path('/balma/refrensi/'+id_kegiatan);
				break;
				case '4':
				$location.path('/panitia/refrensi/'+id_kegiatan);
				break;
		}
  	};

	function addKegiatanCtrl($scope, $mdDialog,panitiaService,ukmService,$log,kegiatanService) {
		$scope.jam = [{value:'00'},{value:'01'},{value:'02'},{value:'03'},{value:'04'},{value:'05'},{value:'06'}
		,{value:'07'},{value:'08'},{value:'09'},{value:'10'},{value:'11'},{value:'12'},{value:'13'}
		,{value:'14'},{value:'15'},{value:'16'},{value:'17'},{value:'18'},{value:'19'},{value:'20'}
		,{value:'21'},{value:'22'},{value:'23'}];
		$scope.menit = [{value:'00'},{value:'05'},{value:'10'},{value:'15'},{value:'20'}
		,{value:'25'},{value:'30'},{value:'35'},{value:'40'},{value:'45'},{value:'50'},{value:'55'}];
		$scope.panitia = null;
		$scope.refrensi = null;
		$scope.ukm = null;
		$scope.dataKegiatan = {};
		$scope.Tanggalkegiatan = new Date();
		$scope.Tanggalaudiensi = new Date();
		$scope.Jamkegiatan = '12';
		$scope.Jamaudiensi = '12';

		panitiaService.SelectAll().then(selectPanitia);
		ukmService.SelectAll().then(selectUkm);
		kegiatanService.SelectAll().then(selectRefrensi);

		$scope.cancel = function() {
		    $mdDialog.cancel();
		  };
		
		$scope.answer = function() {
			if($scope.Tanggalkegiatan !==undefined){
			$scope.dataKegiatan.tanggal_kegiatan = 
				moment($scope.Tanggalkegiatan).format('YYYY-MM-DD')+' '+
				$scope.Jamkegiatan+':'+
				$scope.Menitkegiatan+':00';
			}
			if($scope.Tanggalaudiensi!==undefined){
			$scope.dataKegiatan.tanggal_audiensi = 
				moment($scope.Tanggalaudiensi).format('YYYY-MM-DD')+' '+
				$scope.Jamaudiensi+':'+
				$scope.Menitaudiensi+':00';
			}
		    $mdDialog.hide($scope.dataKegiatan);
		};

		function selectPanitia(response){
			$log.log(response.data);
			$scope.panitia = response.data;
		}

		function selectUkm(data){
			$log.log(data);
			$scope.ukm = data;
		}

		function selectRefrensi(response){
			$log.log(response.data);
			$scope.refrensi = response.data;
		}
	};

	function editKegiatanCtrl($scope, $mdDialog,panitiaService,ukmService,$log,kegiatanService,id,indexs) {
		$scope.jam = [{value:'00'},{value:'01'},{value:'02'},{value:'03'},{value:'04'},{value:'05'},{value:'06'}
		,{value:'07'},{value:'08'},{value:'09'},{value:'10'},{value:'11'},{value:'12'},{value:'13'}
		,{value:'14'},{value:'15'},{value:'16'},{value:'17'},{value:'18'},{value:'19'},{value:'20'}
		,{value:'21'},{value:'22'},{value:'23'}];
		$scope.menit = [{value:'00'},{value:'05'},{value:'10'},{value:'15'},{value:'20'}
		,{value:'25'},{value:'30'},{value:'35'},{value:'40'},{value:'45'},{value:'50'},{value:'55'}];
		$scope.panitia = null;
		$scope.refrensi = null;
		$scope.ukm = null;
		$scope.cancel = cancel;
		$scope.answer = answer;
		$scope.dataKegiatan = {};

		panitiaService.SelectAll().then(selectPanitia,handleError);
		ukmService.SelectAll().then(selectUkm,handleError);
		kegiatanService.SelectEditAll(id).then(selectRefrensi,handleError);
		kegiatanService.SelectOne(id).then(fillData,handleError);

		function cancel(){
		    $mdDialog.cancel();
		};
	
		function answer(){
			if($scope.Tanggalkegiatan !==undefined){
			$scope.dataKegiatan.tanggal_kegiatan = 
				moment($scope.Tanggalkegiatan).format('YYYY-MM-DD')+' '+
				$scope.Jamkegiatan+':'+
				$scope.Menitkegiatan+':00';
			}
			if($scope.Tanggalaudiensi!==undefined){
			$scope.dataKegiatan.tanggal_audiensi = 
				moment($scope.Tanggalaudiensi).format('YYYY-MM-DD')+' '+
				$scope.Jamaudiensi+':'+
				$scope.Menitaudiensi+':00';
			}
		    $mdDialog.hide($scope.dataKegiatan,indexs);
		};

		function selectPanitia(response){
			$log.log(response.data);
			$scope.panitia = response.data;
		}

		function selectUkm(data){
			$log.log(data);
			$scope.ukm = data;
		}

		function selectRefrensi(response){
			$log.log(response.data);
			$scope.refrensi = response.data;
		}

		function fillData(response){
			$log.log('fillData Edit');
			$log.log(response.data);
			$scope.dataKegiatan = response.data;
			//tanggal kegiatan
			var tglK = $scope.dataKegiatan.tanggal_kegiatan;
			//tanggal audiensi
			var tglA = $scope.dataKegiatan.tanggal_audiensi;
			$scope.Tanggalkegiatan = new Date(tglK.substring(0,10));
			$scope.Tanggalaudiensi = new Date(tglA.substring(0,10));
			$scope.Jamkegiatan = tglK.substring(11,13);
			$scope.Jamaudiensi = tglA.substring(11,13);
			$scope.Menitkegiatan = tglK.substring(14,16);
			$scope.Menitaudiensi = tglA.substring(14,16);	
		}

		function handleError(response){
			$log.log(response);
		}
	};

	function deleteKegiatanCtrl($scope,id,index,kegiatan,$mdDialog){
		$scope.kegiatan = kegiatan;
		$scope.answer = answer;
		$scope.cancel = cancel;
		$scope.data = {};

		function cancel(){
			$mdDialog.cancel();
		}

		function answer(){
			$scope.data.id = id;
			$scope.data.index = index;
			$mdDialog.hide($scope.data);
		}
	}

}]);

//Todo list search function
angular.module('reminder.controller').controller('adminListCtrl', 
	['$scope','userService','$mdToast','$log','$mdDialog','$cookies','Upload','$mdMedia','$filter',
	function($scope,userService,$mdToast,$log,$mdDialog,$cookies,Upload,$mdMedia,$filter){
	$scope.titles = "Admin";
	$scope.changeTitle = changeTitle;
	$scope.addAdmin = addAdmin;
	$scope.editAdmin = editAdmin;
	$scope.deleteAdmin = deleteAdmin;
	$scope.showSimpleToast = showSimpleToast;
	$scope.pull = pull;
	$scope.adminList = null;
	$scope.senatList = null;
	$scope.balmaList = null;
	$scope.switchToolbar = switchToolbar;
	$scope.cari = cariAdmin;
	$scope.orderBy = orderBy;
	$scope.hakakses = $cookies.get('hak_akses');
	$scope.$watch(function() {
	      return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	      $scope.customFullscreen = (wantsFullScreen === true);
	});
	$scope.$watch('selectedIndex', function () {
		switch($scope.selectedIndex){
			case 0:
				$scope.cari = cariAdmin;
				break;
			case 1:
				$scope.cari = cariSenat;
				break;
			case 2:
				$scope.cari = cariBalma;
				break;
		}
    });	
	$scope.pull();


	function switchToolbar(){
		$scope.showSearch = false;
		switch($scope.selectedIndex){
			case 0:
				$scope.changeTitle('Admin');
				break;
			case 1:
				$scope.changeTitle('Senat');
				break;
			case 2:
				$scope.changeTitle('Balma');
				break;
		}
		$scope.textCari = null;
	}

	function orderBy(key){
		$scope.key = key;
		$scope.reverse = ($scope.key === key) ? !$scope.reverse : false;
		$scope.icon = ($scope.reverse) ? 'arrow_drop_down' : 'arrow_drop_up';
		$scope.adminList  = $filter('orderBy')($scope.adminList,key,$scope.reverse);
		$scope.senatList  = $filter('orderBy')($scope.senatList,key,$scope.reverse);
		$scope.balmaList  = $filter('orderBy')($scope.balmaList,key,$scope.reverse);
	}

	function cariAdmin(){
		userService.CariAdmin($scope.textCari).then(fillAdminList);
	}

	function cariSenat(){
		userService.CariSenat($scope.textCari).then(fillSenatList);
	}

	function cariBalma(){
		userService.CariBalma($scope.textCari).then(fillBalmaList);
	}

	function pull(){
		if($cookies.get('hak_akses') ==='0'){
			userService.GetAdmin().then(fillAdminList,handleError);
			$scope.indexAdmin = 0;
			$scope.indexSenat = 1;
			$scope.indexBalma = 2;
		}else{
			$scope.indexSenat = 0;
			$scope.indexBalma = 1;
		}
	}

	function changeTitle(title){
		$scope.titles = title;
		if(title === 'Senat'){
			if($scope.senatList === null){
			userService.GetSenat().then(fillSenatList,handleError);
			}
		}else if(title === 'Balma'){
			if($scope.balmaList === null){
			userService.GetBalma().then(fillBalmaList,handleError);
			}
		}else if(title === 'Admin'){
			if($scope.adminList === null){
			pull();
			}
		}
	}

	function fillAdminList(response){
		$log.log(response.data);
		if(response.status>400){
			$scope.showSimpleToast(response.data.error);
		}else{
			$scope.adminList = null;
			$scope.adminList = response.data;
		}
	}

	function fillSenatList(response){
		$log.log(response.data);
		if(response.status>400){
			$scope.showSimpleToast(response.data.error);
		}else{
			$scope.senatList = null;
			$scope.senatList = response.data;
		}
	}

	function fillBalmaList(response){
		$log.log(response.data);
		if(response.status>400){
			$scope.showSimpleToast(response.data.error);
		}else{
			$scope.balmaList = null;
			$scope.balmaList = response.data;
		}
	}

	function handleError(response){
		showSimpleToast(response.data);
	}
	
	function addAdmin(ev) {
	    $mdDialog.show({
	      controller: addAdminCtrl,
	      templateUrl: 'view/super/addadmin.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: $scope.customFullscreen
	    })
	    .then(addData,cancel);

	    function addData(response) {
	    	if(response.status > 400){
	    		$scope.showSimpleToast(response.data.error);
	    	}else{
	    		$scope.showSimpleToast(response.data.success);
	    		$log.log(response);
	    		$log.log(response.config.fields.hakakses);
	    		switch(response.config.fields.hakakses){
	    			case '1':
	    				$scope.selectedIndex = $scope.indexAdmin;
	    				userService.GetAdmin().then(fillAdminList,handleError);
	    			break;
	    			case '2':
	    				$scope.selectedIndex = $scope.indexSenat;
	    				userService.GetSenat().then(fillSenatList,handleError);
	    			break;
	    			case '3':
	    				$scope.selectedIndex = $scope.indexBalma;
	    				userService.GetBalma().then(fillBalmaList,handleError);
	    			break;
	    		}
	    	}
	    }

	    function cancel() {
	       $scope.showSimpleToast("Tambah Admin di batalkan");
	    }
  	};

  	function addAdminCtrl($scope,$mdDialog,$log,$cookies,Upload){
  		$scope.upload = upload;
  		$scope.answer = answer;
  		$scope.cancel = cancel;
  		$scope.listAkses = listAkses;
  		$scope.dataAdmin = {};
  		$scope.listAkses();
  		$scope.dataAdmin.hakakses = '1';

  		function listAkses(){
  			switch($cookies.get('hak_akses')){
  				case '0':
  				$scope.Akses = [
  					{akses: 'Admin',value:'1'},
  					{akses: 'Senat',value:'2'},
  					{akses: 'Balma',value:'3'}
  				];
  				break;
  				case '1':
  				$scope.Akses = [
					{akses: 'Senat',value:'2'},
  					{akses: 'Balma',value:'3'}
  				];
  				break;
  			}
  		}

		function upload(file) {
	        Upload.upload({
	            url: 'model/user/newuser',
	            method: 'POST',
	    		file: file,
	   			sendFieldsAs: 'form',
	    		fields: {
	    			email : $scope.dataAdmin.email,
	        		password : $scope.dataAdmin.password,
	        		nama : $scope.dataAdmin.nama,
	        		handphone : $scope.dataAdmin.handphone,
	        		hakakses : $scope.dataAdmin.hakakses
	    		}
	        }).then(function (response) {
	        	$mdDialog.hide(response);
	        }, function (response) {
	        	$mdDialog.hide(response);
	        }, function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        });
    	};

  		function cancel(){
			$mdDialog.cancel();
		}

		function answer(){
			$scope.upload($scope.file);
		}

  	}

  	//TODO LIST
  	function editAdmin(ev,id,index){
  		$log.log(id);
  		$log.log(index);
  		$mdDialog.show({
	      controller: editAdminCtrl,
	      templateUrl: 'view/super/editadmin.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: $scope.customFullscreen,
	      locals : {
            id : id,
            index:index
          }
	    })
	    .then(addData,cancel);
	   	function addData(response) {
	    	if(response.status > 400){
	    		$scope.showSimpleToast(response.data.error);
	    	}else{
	    		$scope.showSimpleToast(response.data.success);
	    		$log.log(response);
	    		$log.log(response.config.fields.hakakses);
	    		switch(response.config.fields.hakakses){
	    			case '1':
	    				$scope.selectedIndex = 0;
	    				userService.GetAdmin().then(fillAdminList,handleError);
	    			break;
	    			case '2':
	    				$scope.selectedIndex = 1;
	    				userService.GetSenat().then(fillSenatList,handleError);
	    			break;
	    			case '3':
	    				$scope.selectedIndex = 2;
	    				userService.GetBalma().then(fillBalmaList,handleError);
	    			break;
	    		}
	    	}
	    }

	    function cancel() {
	       $scope.showSimpleToast("Edit admin dibatalkan");
	    }

  	}

  	function editAdminCtrl($scope,$mdDialog,$log,$cookies,Upload,id,index,userService){
  		$scope.upload = upload;
  		$scope.answer = answer;
  		$scope.cancel = cancel;
  		$scope.listAkses = listAkses;
  		$scope.dataAdmin = {};
  		$scope.listAkses();
  		$log.log(id);
  		userService.GetEditForm(id).then(fillData);

  		function fillData(response){
  			if(response.status > 400){
  				$mdDialog.hide(response);
  			}else{
  				$log.log(response.data);
  				$scope.dataAdmin.email = response.data.email_user;
  				$scope.dataAdmin.password = undefined;
  				$scope.dataAdmin.nama = response.data.nama_user;
  				$scope.dataAdmin.handphone = response.data.no_handphone;
  				$scope.dataAdmin.hakakses = response.data.hak_akses;
  			}
  		}

  		function listAkses(){
  			switch($cookies.get('hak_akses')){
  				case '0':
  				$scope.Akses = [
  					{akses: 'Admin',value:'1'},
  					{akses: 'Senat',value:'2'},
  					{akses: 'Balma',value:'3'}
  				];
  				break;
  				case '1':
  				$scope.Akses = [
					{akses: 'Senat',value:'2'},
  					{akses: 'Balma',value:'3'}
  				];
  				break;
  			}
  		}

		function upload(file) {
	        Upload.upload({
	            url: 'model/user/editUser',
	            method: 'POST',
	    		file: file,
	   			sendFieldsAs: 'form',
	    		fields: {
	    			id : id,
	    			email : $scope.dataAdmin.email,
	        		password : $scope.dataAdmin.password,
	        		nama : $scope.dataAdmin.nama,
	        		handphone : $scope.dataAdmin.handphone,
	        		hakakses : $scope.dataAdmin.hakakses
	    		}
	        }).then(function (response) {
	        	$mdDialog.hide(response);
	        }, function (response) {
	        	$mdDialog.hide(response);
	        }, function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        	});
    	};

  		function cancel(){
			$mdDialog.cancel();
		}

		function answer(){
			$scope.upload($scope.file);
		}
  	}

  	function deleteAdmin(ev,id,type,nama,hakakses){
  		$mdDialog.show({
	      controller: deleteAdminCtrl,
	      templateUrl: 'view/super/deleteadmin.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: false,
	      locals : {
            id : id,
            type:type,
            nama:nama,
            hakakses: hakakses
          }
	    })
	    .then(deleteUser,cancel);
	    function deleteUser(data){
	    	userService.Delete({id:data.id}).then(handleSuccess);
	    	function handleSuccess(response){
	    		if(response.status>400){
	    			$scope.showSimpleToast(response.data.error);
	    		}else{
	    			$scope.showSimpleToast(response.data.success);
	    			switch(data.hakakses){
	    			case '1':
	    				userService.GetAdmin().then(fillAdminList,handleError);
	    			break;
	    			case '2':
	    				userService.GetSenat().then(fillSenatList,handleError);
	    			break;
	    			case '3':
	    				userService.GetBalma().then(fillBalmaList,handleError);
	    			break;
	    			}
	    		}
	    	}
	    }

	  	function cancel() {
	       $scope.showSimpleToast("Delete user dibatalkan");
	    }

  	}

  	function deleteAdminCtrl($scope,id,type,nama,hakakses){
  		$scope.nama = nama;
  		$scope.type = type;
  		$scope.answer = answer;
  		$scope.cancel = cancel;

  		function answer(){
  			var data = {id:id,hakakses:hakakses};
  			$mdDialog.hide(data);
  		}
  		function cancel(){
			$mdDialog.cancel();
		}
  	}

	function showSimpleToast(content) {
    	$mdToast.show(
      	$mdToast.simple()
        .textContent(content)
        .position('top right')
        .hideDelay(2000)
    	);
  	};
}])

//TODO LIST Panitia add , tabs select search orderby
angular.module('reminder.controller').controller('panitiaListCtrl', 
	['$scope', 'panitiaService','$mdToast','$log','$mdDialog','Upload','$mdMedia','$filter',
	function($scope,panitiaService,$mdToast,$log,$mdDialog,Upload,$mdMedia,$filter){
	$scope.titles= "Panitia Aktif";
	$scope.changeTitle = changeTitle;
	$scope.panitiaAktif = null;
	$scope.panitiaTidakAktif = null;
	$scope.addPanitia = addPanitia;
	$scope.editPanitia = editPanitia;
	$scope.deletePanitia = deletePanitia;
	$scope.showSimpleToast = showSimpleToast;
	$scope.orderBy = orderBy;
	$scope.poll = poll;
	$scope.poll2 = poll2;
	$scope.cari = cariPanitiaAktif;
	$scope.switchToolbar = switchToolbar;
	$scope.$watch(function() {
	    return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	    $scope.customFullscreen = (wantsFullScreen === true);
	});
	$scope.$watch('selectedIndex', function () {
		$log.log($scope.selectedIndex);
		switch($scope.selectedIndex){
			case 0:
				$scope.cari = cariPanitiaAktif;
				break;
			case 1:
				$scope.cari = cariPanitiaTidakAktif;
				break;
		}
    });

	$scope.poll();

	function switchToolbar(){
		$scope.showSearch = false;
		switch($scope.selectedIndex){
			case 0:
				$scope.poll()
				break;
			case 1:
				$scope.poll2()
				break;
		}
		$scope.textCari = null;
	}

	function poll(){
	panitiaService.GetAktif().then(fillPanitiaAktif);
	}

	function poll2(){
	panitiaService.GetTidakAktif().then(fillPanitiaTidakAktif);
	}

	function cariPanitiaAktif(){
		panitiaService.CariAktif($scope.textCari).then(fillPanitiaAktif);
	}

	function cariPanitiaTidakAktif(){
		panitiaService.CariTidakAktif($scope.textCari).then(fillPanitiaTidakAktif);
	}

	function orderBy(key){
		$scope.key = key;
		$scope.reverse = ($scope.key === key) ? !$scope.reverse : false;
		$scope.icon = ($scope.reverse) ? 'arrow_drop_down' : 'arrow_drop_up';
		$scope.panitiaAktif  = $filter('orderBy')($scope.panitiaAktif,key,$scope.reverse);
		$scope.panitiaTidakAktif  = $filter('orderBy')($scope.panitiaTidakAktif,key,$scope.reverse);
	}

	function changeTitle(title){
		$scope.titles = title;
		if($scope.panitiaAktif===null){
			$scope.poll();
		}
		if($scope.panitiaTidakAktif===null){
			$scope.poll2();
		}
	}

	function fillPanitiaAktif(response){
		if(response.status>400){
			$scope.showSimpleToast(response.data.error);
		}else{
			$scope.panitiaAktif = response.data;
		}
	}

	function fillPanitiaTidakAktif(response){
		if(response.status>400){
			$scope.showSimpleToast(response.data.error);
		}else{
			$scope.panitiaTidakAktif = response.data;
		}
	}
	
	function showSimpleToast(content) {
    	$mdToast.show(
      	$mdToast.simple()
        .textContent(content)
        .position('top right')
        .hideDelay(2000)
    	);
  	};

  	function addPanitia(ev){
  		$mdDialog.show({
	      controller: addPanitiaCtrl,
	      templateUrl: 'view/super/addpanitia.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: $scope.customFullscreen
	    })
	    .then(addData,cancel);

	    function addData(response){
	    	if(response.status > 400){
	    		$scope.showSimpleToast(response.data.error);
	    	}else{
	    		$scope.showSimpleToast(response.data.success);
	    		$scope.selectedIndex = 0;
	    		$scope.poll();
	    	}
	    }

	    function cancel(){
	    	$scope.showSimpleToast('Tambah Panitia dibatalkan');
	    }
  	};

  	function editPanitia(ev,id){
  		$mdDialog.show({
	      controller: editPanitiaCtrl,
	      templateUrl: 'view/super/editpanitia.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: $scope.customFullscreen,
	      locals : {
	      	id : id
	      }
	    })
	    .then(addData,cancel);

	   	function addData(response){
	   		$log.log(response);
	    	if(response.status > 400){
	    		$scope.showSimpleToast(response.data.error);
	    	}else{
	    		$scope.showSimpleToast(response.data.success);
	    		$scope.poll();
	    		$scope.poll2();
	    	}
	    }

	    function cancel(){
	    	$scope.showSimpleToast('Edit Panitia dibatalkan');
	    }
  	};

  	function deletePanitia(ev,id,nama){
  		$mdDialog.show({
	      controller: deletePanitiaCtrl,
	      templateUrl: 'view/super/deletepanitia.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: false,
	      locals : {
	      	id : id,
	      	nama : nama
	      }
	    })
	    .then(deleteData,cancel);

	   	function deleteData(id){
	   		panitiaService.Delete({id : id}).then(handleSuccess,handleError);
	    }

	    function handleSuccess(response){
	    	$scope.showSimpleToast(response.data.success);
	    	$scope.poll();
	    	$scope.poll2();
	    }

	    function handleError(response){
	    	$scope.showSimpleToast(response.data.error);
	    }

	    function cancel(){
	    	$scope.showSimpleToast('Hapus Panitia dibatalkan');
	    }
  	};

  	function addPanitiaCtrl($scope,Upload,$mdDialog){
  		$scope.answer = answer;
  		$scope.cancel = cancel;
  		$scope.upload = upload;

  		function upload(file) {
	        Upload.upload({
	            url: 'model/user/newuser',
	            method: 'POST',
	    		file: file,
	   			sendFieldsAs: 'form',
	    		fields: {
	    			email : $scope.dataAdmin.email,
	        		password : $scope.dataAdmin.password,
	        		nama : $scope.dataAdmin.nama,
	        		handphone : $scope.dataAdmin.handphone,
	        		hakakses : '4',
	        		nim : $scope.dataAdmin.nim
	    		}
	        }).then(function (response) {
	        	$mdDialog.hide(response);
	        }, function (response) {
	        	$mdDialog.hide(response);
	        }, function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        });
    	};

  		function answer(){
  			$scope.upload($scope.file);
  		}

  		function cancel(){
			$mdDialog.cancel();
		}
  	};

  	function editPanitiaCtrl($scope,$mdDialog,Upload,id,panitiaService){
  		$scope.answer = answer;
  		$scope.cancel = cancel;
  		$scope.upload = upload;
  		$scope.dataAdmin = {};
  		$scope.switchAkses = switchAkses;
  		panitiaService.GetEditForm(id).then(fillData);

  		function switchAkses(){
  			switch($scope.dataAdmin.akses){
  				case 'Aktif':
  					$scope.dataAdmin.hakakses = '4';
  				break;
  				case 'Tidak Aktif':
  					$scope.dataAdmin.hakakses = '5';
  				break;
  			}
  			$log.log($scope.dataAdmin.hakakses);
  		}

  		function fillData(response){
  			if(response.status > 400){
  				$mdDialog.hide(response);
  			}else{
  				$log.log(response);
  				$scope.dataAdmin.email = response.data.email_user;
  				$scope.dataAdmin.nama = response.data.nama_user;
  				$scope.dataAdmin.handphone = response.data.no_handphone;
  				$scope.dataAdmin.nim = response.data.nim;
  				$scope.dataAdmin.password = undefined;
  				switch(response.data.hak_akses){
  					case '4':
  						$scope.dataAdmin.akses = 'Aktif';
  					break;
  					case '5':
  						$scope.dataAdmin.akses = 'Tidak Aktif';
  					break;
  				}
  			}
  		}

  		function upload(file) {
  			$log.log(" Hak edit " + $scope.dataAdmin.hakakses);
	        Upload.upload({
	            url: 'model/panitia/editPanitia',
	            method: 'POST',
	    		file: file,
	   			sendFieldsAs: 'form',
	    		fields: {
	    			id : id,
	    			email : $scope.dataAdmin.email,
	        		password : $scope.dataAdmin.password,
	        		nama : $scope.dataAdmin.nama,
	        		handphone : $scope.dataAdmin.handphone,
	        		nim : $scope.dataAdmin.nim,
	        		hakakses : $scope.dataAdmin.hakakses
	    		}
	        }).then(function (response) {
	        	$mdDialog.hide(response);
	        }, function (response) {
	        	$mdDialog.hide(response);
	        }, function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        });
    	};

  		function answer(){
  			$scope.upload($scope.file);
  		}

  		function cancel(){
			$mdDialog.cancel();
		}
  	};

  	function deletePanitiaCtrl($scope,id,nama){
  		$scope.nama = nama;
  		$scope.answer = answer;
  		$scope.cancel = cancel;

  		function answer(){
  			$mdDialog.hide(id);
  		}
  		function cancel(){
			$mdDialog.cancel();
		}
  	};

}]);


//pencarian
angular.module('reminder.controller').controller('ormawaListCtrl', 
	['$scope','ukmService','$mdToast','$log','$mdDialog','Upload','$mdMedia','$filter',
	function($scope,ukmService,$mdToast,$log,$mdDialog,Upload,$mdMedia,$filter){
	$scope.$watch(function() {
	    return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	    $scope.customFullscreen = (wantsFullScreen === true);
	});
	$scope.ukmList = null;
	$scope.poll = poll;
	$scope.showSimpleToast = showSimpleToast;
	$scope.addOrmawa = addOrmawa;
	$scope.editOrmawa = editOrmawa;
	$scope.deleteOrmawa = deleteOrmawa;
	$scope.orderBy = orderBy;
	$scope.cari = cariUkm;
	$scope.switchToolbar =switchToolbar;
	$scope.poll();

	function switchToolbar(){
		$scope.showSearch = false;
		$scope.poll();
		$scope.textCari = null;
	}

	function cariUkm(){
		ukmService.Cari($scope.textCari).then(fillUkm,handleError);
	};

	function poll(){
		ukmService.GetAll().then(fillUkm,handleError);
	};
	
	function orderBy(key){
		$scope.key = key;
		$scope.reverse = ($scope.key === key) ? !$scope.reverse : false;
		$scope.icon = ($scope.reverse) ? 'arrow_drop_down' : 'arrow_drop_up';
		$scope.ukmList  = $filter('orderBy')($scope.ukmList,key,$scope.reverse);
	}

	function fillUkm(data){
		$log.log(data);
		if(data.hasOwnProperty('error')){
			$scope.showSimpleToast(data.error);
		}else{
			$scope.ukmList = data;
		}
	};

	function handleError(error){
		$scope.showSimpleToast(error);
	};
	
	function showSimpleToast(content) {
    	$mdToast.show(
      	$mdToast.simple()
        .textContent(content)
        .position('top right')
        .hideDelay(2000)
    	);
  	};

  	function addOrmawa(ev){
  		$mdDialog.show({
	      controller: addOrmawaCtrl,
	      templateUrl: 'view/super/addormawa.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: $scope.customFullscreen
	    })
	    .then(addData,cancel);

	    function addData(response){
	    	if(response.status > 400){
	    		$scope.showSimpleToast(response.data.error);
	    	}else{
	    		$scope.showSimpleToast(response.data.success);
	    		$scope.poll();
	    	}
	    }

	    function cancel(){
	    	$scope.showSimpleToast('Tambah Organisasi Mahasiswa dibatalkan');
	    }
  	}

  	function editOrmawa(ev,id,nama){
  		$mdDialog.show({
	      controller: editOrmawaCtrl,
	      templateUrl: 'view/super/editormawa.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: $scope.customFullscreen,
	      locals : {
	      	id : id,
	      	nama : nama
	      }
	    })
	    .then(addData,cancel);

	    function addData(response){
	    	if(response.status > 400){
	    		$scope.showSimpleToast(response.data.error);
	    	}else{
	    		$scope.showSimpleToast(response.data.success);
	    		$scope.poll();
	    	}
	    }

	    function cancel(){
	    	$scope.showSimpleToast('Edit Organisasi Mahasiswa dibatalkan');
	    }
  	}

  	function deleteOrmawa(ev,id,nama){
  		$mdDialog.show({
	      controller: deleteOrmawaCtrl,
	      templateUrl: 'view/super/deleteormawa.template.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: false,
	      locals : {
	      	id : id,
	      	nama : nama
	      }
	    })
	    .then(deleteData,cancel);

	   	function deleteData(id){
	   		ukmService.Delete({id_ukm : id}).then(handleSuccess,handleError);
	    }

	    function handleSuccess(data){
	    	$scope.showSimpleToast(data.success);
	    	$scope.poll();
	    }

	    function handleError(error){
	    	$scope.showSimpleToast(error);
	    }

	    function cancel(){
	    	$scope.showSimpleToast('Hapus Organisasi Mahasiswa dibatalkan');
	    }
  	}

  	function addOrmawaCtrl($scope,Upload,$mdDialog){
  		$scope.answer = answer;
  		$scope.cancel = cancel;
  		$scope.upload = upload;

  		function upload(file) {
	        Upload.upload({
	            url: 'model/ukm/newukm',
	            method: 'POST',
	    		file: file,
	   			sendFieldsAs: 'form',
	    		fields: {
	    			nama_ukm : $scope.dataUkm.nama
	    		}
	        }).then(function (response) {
	        	$mdDialog.hide(response);
	        }, function (response) {
	        	$mdDialog.hide(response);
	        }, function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        });
    	};

  		function answer(){
  			$scope.upload($scope.file);
  		}

  		function cancel(){
			$mdDialog.cancel();
		}
  	}

  	function editOrmawaCtrl($scope,Upload,$mdDialog,id,nama){
  		$scope.dataUkm = {};
  		$scope.dataUkm.nama = nama;
  		$scope.answer = answer;
  		$scope.cancel = cancel;
  		$scope.upload = upload;

  		function upload(file) {
	        Upload.upload({
	            url: 'model/ukm/editUkm',
	            method: 'POST',
	    		file: file,
	   			sendFieldsAs: 'form',
	    		fields: {
	    			id_ukm : id,
	    			nama_ukm : $scope.dataUkm.nama
	    		}
	        }).then(function (response) {
	        	$mdDialog.hide(response);
	        }, function (response) {
	        	$mdDialog.hide(response);
	        }, function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        });
    	};

  		function answer(){
  			$scope.upload($scope.file);
  		}

  		function cancel(){
			$mdDialog.cancel();
		}

  	}

  	function deleteOrmawaCtrl($scope,id,nama){
  		$scope.answer = answer;
  		$scope.cancel = cancel;
  		$scope.nama = nama;
  		$log.log("ID Delete ormawa : " + id);
  		$log.log("Nama Delete Ormawa : "+ nama);

  		function answer(){
  			$mdDialog.hide(id);
  		}

  		function cancel(){
			$mdDialog.cancel();
		}
  	}
}]);

angular.module('reminder.controller').controller('notifikasiListCtrl', 
	['$scope','notifikasiService', '$cookies','$log','$mdToast',
	function($scope,notifikasiService,$cookies,$log,$mdToast){
	$scope.notifikasiList = null;
	var session = $cookies.get('session');

	$scope.$watch('dataNotif', function() {
       	notifikasiService.GetAll(session,0,25).then(fillNotif,handleError);
    });

	function fillNotif(response){
		$log.log(response.data);
		$scope.notifikasiList= response.data;
	}

	function handleError(response){
		showSimpleToast(response.data);
	}
	
	function showSimpleToast(content) {
    	$mdToast.show(
      	$mdToast.simple()
        .textContent(content)
        .position('top right')
        .hideDelay(2000)
    	);
  	};
}]);


angular.module('reminder.controller').controller('notifikasiCtrl', 
	['$scope', '$log','notifikasiService','$location','$mdToast','$cookies',
	function($scope,$log,notifikasiService,$location,$mdToast,$cookies){
	switch($scope.notifikasiList[$scope.$parent.$index].tipe){
		case "0":
		$scope.icons = "dashboard";
		$scope.fills = "#2196F3";
		break;
		case "1":
		$scope.icons = "alarm";
		$scope.fills = "#2196F3";
		break;
	}
	switch($scope.notifikasiList[$scope.$parent.$index].status_dibaca){
		case "0":
		$scope.updateNotifikasi = true;
		$scope.backgrounds = "white";
		break;
		case "1":
		$scope.updateNotifikasi = false;
		$scope.backgrounds = "bg-transparent";
		$scope.fills = "#757575";
		break;
	}
	$scope.viewKegiatan = viewKegiatan;

	function viewKegiatan(id_kegiatan , id_notifikasi){
		if($scope.updateNotifikasi){
			$log.log('notifikasi updated executed');
			var formData = {id_notif : id_notifikasi};
			notifikasiService.Update(formData).then(handleSuccess);
		}else{
			$log.log('notifikasi updated not executed');
			navigateTo(id_kegiatan);
		}

		function handleSuccess(response){
			if(response.status>400){
				showSimpleToast(response.data.error);
			}else{
				navigateTo(id_kegiatan);
			}
		}

		function showSimpleToast(content) {
	    	$mdToast.show(
	      	$mdToast.simple()
	        .textContent(content)
	        .position('top right')
	        .hideDelay(2000)
	    	);
  		};

  		function navigateTo(id_kegiatan){
  			switch($cookies.get('hak_akses')){
				case '0':
				$location.path('/super/notifikasi/'+id_kegiatan);
				break;
				case '1':
				$location.path('/admin/notifikasi/'+id_kegiatan);
				break;
				case '2':
				$location.path('/senat/notifikasi/'+id_kegiatan);
				break;
				case '3':
				$location.path('/balma/notifikasi/'+id_kegiatan);
				break;
				case '4':
				$location.path('/panitia/notifikasi/'+id_kegiatan);
				break;
			}
  		}
	}
}]);

angular.module('reminder.controller').controller('settingCtrl', 
	['$scope','Upload','userService','$cookies','$log','$mdToast','$route',
	function($scope,Upload,userService,$cookies,$log,$mdToast,$route){
  		$scope.dataAdmin = {};
  		$scope.poll = poll;
  		$scope.showSimpleToast = showSimpleToast;
  		$scope.poll();

  		function poll(){
  			userService.GetEditForm($cookies.get('session')).then(fillData);
  			if($cookies.get('hak_akses') === '4'){
  				$scope.upload = uploadPanitia;
  			}
  			else{
  				$scope.upload = upload;
  			}
  		}
  		
  		function fillData(response){
  			if(response.status > 400){
  				$scope.showSimpleToast(response.data.error);
  			}else{
  				//$log.log(response.data);
  				$scope.dataAdmin.id = response.data.id_user;
  				$scope.dataAdmin.email = response.data.email_user;
  				$scope.dataAdmin.password = undefined;
  				$scope.dataAdmin.nama = response.data.nama_user;
  				$scope.dataAdmin.handphone = response.data.no_handphone;
  				$scope.dataAdmin.hakakses = response.data.hak_akses;
  			}
  		}

		function upload(file) {
	        Upload.upload({
	            url: 'model/user/editUser',
	            method: 'POST',
	    		file: file,
	   			sendFieldsAs: 'form',
	    		fields: {
	    			id : $scope.dataAdmin.id,
	    			email : $scope.dataAdmin.email,
	        		password : $scope.dataAdmin.password,
	        		nama : $scope.dataAdmin.nama,
	        		handphone : $scope.dataAdmin.handphone,
	        		hakakses : $scope.dataAdmin.hakakses
	    		}
	        }).then(function (response) {
	        	$scope.showSimpleToast(response.data.success);
	        	$route.reload();
	        }, function (response) {
	        	$scope.showSimpleToast(response.data.error);
	        }, function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        	});
    	};

    	function uploadPanitia(file) {
	        Upload.upload({
	            url: 'model/panitia/editPanitia',
	            method: 'POST',
	    		file: file,
	   			sendFieldsAs: 'form',
	    		fields: {
	    			id : $scope.dataAdmin.id,
	    			email : $scope.dataAdmin.email,
	        		password : $scope.dataAdmin.password,
	        		nama : $scope.dataAdmin.nama,
	        		handphone : $scope.dataAdmin.handphone,
	        		hakakses : $scope.dataAdmin.hakakses
	    		}
	        }).then(function (response) {
	        	$scope.showSimpleToast(response.data.success);
	        	$route.reload();
	        }, function (response) {
	        	$scope.showSimpleToast(response.data.error);
	        }, function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        	});
    	};

		function showSimpleToast(content) {
	    	$mdToast.show(
	      	$mdToast.simple()
	        .textContent(content)
	        .position('top right')
	        .hideDelay(2000)
	    	);
  		};
}]);

angular.module('reminder.controller').controller('refrensiKegiatanCtrl', 
	['$scope','$log','$location','kegiatanService','$location','$mdToast','$cookies',
	function($scope,$log,$location,kegiatanService,$location,$mdToast,$cookies){
	$scope.kegiatan = null;
	$scope.back = navigateBack;
	$scope.refrensiKegiatan = refrensiKegiatan;
	$scope.navigateTo = navigateTo;
	$log.log($scope.routeKegiatan);
	kegiatanService.GetById($scope.routeKegiatan).then(handleSuccess);
	function refrensiKegiatan(id_kegiatan) {
  		switch($cookies.get('hak_akses')){
				case '0':
				$location.path('/super/refrensi/'+id_kegiatan);
				break;
				case '1':
				$location.path('/admin/refrensi/'+id_kegiatan);
				break;
				case '2':
				$location.path('/senat/refrensi/'+id_kegiatan);
				break;
				case '3':
				$location.path('/balma/refrensi/'+id_kegiatan);
				break;
				case '4':
				$location.path('/panitia/refrensi/'+id_kegiatan);
				break;
		}
  	};

  	function navigateTo(id_kegiatan){
  		switch($cookies.get('hak_akses')){
			case '0':
			$location.path('/super/notifikasi/'+id_kegiatan)
			break;
			case '1':
			$location.path('/admin/notifikasi/'+id_kegiatan);
			break;
			case '2':
			$location.path('/senat/notifikasi/'+id_kegiatan);
			break;
			case '3':
			$location.path('/balma/notifikasi/'+id_kegiatan);
			break;
			case '4':
			$location.path('/panitia/notifikasi/'+id_kegiatan);
			break;
		}
  	}

	function handleSuccess(response){
		$scope.kegiatan = response.data;
		$log.log(response.data);
		if(response.status>400){
			handleError(response.data.error);
		}
	}

	function handleError(string){
		showSimpleToast(string);
		$location.path('/super/kegiatan');
	}

	function showSimpleToast(content) {
    	$mdToast.show(
      	$mdToast.simple()
        .textContent(content)
        .position('top right')
        .hideDelay(2000)
    	);
  	};

  	function navigateBack(to){
  		$location.path(to);
  	}
}]);



angular.module('reminder.controller').controller('kegiatanCtrl', ['$scope',
	function($scope){
	$scope.$watch('showDes', function () {
       	if ($scope.showDes) {
           	$scope.showDesicon= "keyboard_arrow_up";
       	}else {
        	$scope.showDesicon  = "keyboard_arrow_down";
       	}
    });	
}]);

angular.module('reminder.controller').controller('infoPanitiaCtrl', ['$scope','panitiaService','$log',
	function($scope,panitiaService,$log){
	$scope.showPanitia = false;
	$scope.getpanitia = getpanitia;
	$scope.panitia = null;
	$scope.loading = false;
	$scope.$watch('showPanitia', function () {
       	if ($scope.showPanitia) {
           	$scope.showPanitiaicon= "keyboard_arrow_up";
       	}else {
           	$scope.showPanitiaicon = "keyboard_arrow_down";
       	}
    });	

	function getpanitia(id){
		if(!$scope.panitia){
		$scope.loading = true;
		panitiaService.GetById(id).then(fillPanitia);
		}else{
			$scope.showPanitia = !$scope.showPanitia;
		}
	}

	function fillPanitia(response){
		$log.log(response.data);
		$scope.panitia = response.data;
		$scope.showPanitia = !$scope.showPanitia;
		$scope.loading = false;
	}
}]);

angular.module('reminder.controller').controller('infoEvaluasiCtrl', 
	['$scope','evaluasiService','$log',
	function($scope,evaluasiService,$log){
	$scope.showEval = false;
	$scope.getEvaluasi = getEvaluasi;
	$scope.childUpdate = childUpdate;
	$scope.evaluasiList = null;
	$scope.loading = false;
	$scope.$watch('showEval', function () {
       	if ($scope.showEval) {
         	$scope.showEvalicon= "keyboard_arrow_up";
       	}else {
           	$scope.showEvalicon  = "keyboard_arrow_down";
       	}
    });

    function getEvaluasi(id){
		if(!$scope.evaluasiList){
		$scope.loading = true;
		evaluasiService.GetAll(id).then(fillEvaluasi);
		}else{
			$scope.showEval = !$scope.showEval;
		}
	}

	function childUpdate(id){
	 	evaluasiService.GetLast(id).then(pushEvaluasi);
	}

	function fillEvaluasi(response){
		$log.log(response.data);
		$scope.evaluasiList = response.data;
		$scope.showEval = !$scope.showEval;
		$scope.loading = false;
	}

	function pushEvaluasi(response){
		$log.log(response.data);
		$scope.evaluasiList.push(response.data);
	}
}]);

angular.module('reminder.controller').controller('refInfoEvaluasiCtrl', 
	['$scope','evaluasiService','$log',
	function($scope,evaluasiService,$log){
	$scope.showEval = false;
	$scope.evalToggle = evalToggle;
	$scope.$watch('showEval', function () {
       	if ($scope.showEval) {
         	$scope.showEvalicon= "keyboard_arrow_up";
       	}else {
           	$scope.showEvalicon  = "keyboard_arrow_down";
       	}
    });
    $scope.evaluasiList = null;
    evaluasiService.GetAll($scope.routeKegiatan).then(fillEvaluasi);

	function fillEvaluasi(response){
		$scope.evaluasiList = response.data;
		$scope.showEval = !$scope.showEval;
	}

	function evalToggle(){
		$scope.showEval = !$scope.showEval;
	}

}]);


angular.module('reminder.controller').controller('kirimEvaluasiCtrl', ['$scope','Upload','$log','$mdToast','$cookies',
	function($scope,Upload,$log,$mdToast,$cookies){
	$scope.evaluasi = null;
	$scope.submit = function(){
		$scope.upload($scope.file);
	}
	$scope.upload = function (file) {
        Upload.upload({
            url: 'model/kegiatan/newEvaluasi',
            method: 'POST',
    		file: file,
   			sendFieldsAs: 'form',
    		fields: {
    			id_kegiatan : $scope.id_kegiatan,
    			id_panitia : $cookies.get('session'),
        		evaluasi : $scope.evaluasi
    		}
        }).then(function (response) {
            $log.log(response);
            $scope.showSimpleToast(response.data.success);
            $scope.$parent.childUpdate($scope.id_kegiatan);
            $scope.evaluasi = null;
            $scope.file = null;
        }, function (response) {
        	$log.log(response);
			$scope.showSimpleToast(response.data.error);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        });
    };

    function showSimpleToast(content) {
    	$mdToast.show(
      	$mdToast.simple()
        .textContent(content)
        .position('top right')
        .hideDelay(3000)
    	);
  	};
}]);

angular.module('reminder.controller').controller('kalenderCtrl', 
	['$scope','$mdToast','$route','$filter','$log','$http','MaterialCalendarData',
	function($scope,$mdToast,$route,$filter,$log,$http,MaterialCalendarData){
		$scope.printDiv = function(divName) {
		  var printContents = document.getElementById(divName).innerHTML;
		  var popupWin = window.open('', '_blank', 'width=1366,height=768');
		  popupWin.document.open();
		  popupWin.document.write('<html><head><title>Kalender Kegiatan</title><link rel="stylesheet" href="libs/bower_components/angular-material/angular-material.min.css"><link rel="stylesheet" href="libs/bower_components/material-calendar/dist/angular-material-calendar.min.css"><link rel="stylesheet" href="css/reminder.css"></head><body onload="window.print()">' + printContents + '</body></html>');
		  popupWin.document.close();
		} 
		$scope.count= 0;
		$scope.startData = undefined;
		$scope.endData = undefined;
		$scope.kalenderInit = false;
		$scope.dayFormat = "d";
		$scope.dataKegiatan = null;
	    // To select a single date, make sure the ngModel is not an array.
	    $scope.selectedDate = null;

	    // If you want multi-date select, initialize it as an array.

	    $scope.firstDayOfWeek = 0; // First day of the week, 0 for Sunday, 1 for Monday, etc.
	    $scope.setDirection = function(direction) {
	      $scope.direction = direction;
	      $scope.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
	    };

	    $scope.dayClick = function(date) {

	    };

	    $scope.prevMonth = function(data) {
	    	$scope.count = 0;
	    };

	    $scope.nextMonth = function(data) {
	    	$scope.count = 0;
	    };

	    $scope.tooltips = true;

	    $scope.setDayContent = function(date) {
	        // You would inject any HTML you wanted for
	        // that particular date here.
	        // http call data
	        $scope.count+= 1;
	        var numFmt = function(num) {
		        num = num.toString();
		        if (num.length < 2) {
		            num = "0" + num;
		        }
		        return num;
		    };
	        var key = [date.getFullYear(), numFmt(date.getMonth()+1), numFmt(date.getDate())].join("-");
	        if($scope.count === 1){
	        	$scope.startData = key;
	        }else if($scope.count === 35){
	        	if($scope.kalenderInit){
	        		$scope.count = 0;
	        		$scope.endData = key;
	        		$log.log('model/kegiatan/kalender/'+$scope.startData+'/'+$scope.endData);
	        		$http.get('model/kegiatan/kalender/'+$scope.startData+'/'+$scope.endData).then(handleSuccess,handleError);
	        	}else{
	        		$scope.kalenderInit = true;
	        		$scope.count = 0;
	        	}
	        }
	        return '<div class="kalender"><div>&nbsp</div><div>&nbsp</div><div>&nbsp</div> </div>';
	    };


  		$scope.showSimpleToast = showSimpleToast;

		function showSimpleToast(content) {
	    	$mdToast.show(
	      	$mdToast.simple()
	        .textContent(content)
	        .position('top right')
	        .hideDelay(2000)
	    	);
  		};

  		function handleSuccess(response){
  			//$log.log(response.data);
  			$scope.dataKegiatan = response.data;
  			angular.forEach($scope.dataKegiatan,function(value,index){
                //$log.log(value);
                var date = new Date(index);
                var html = '<div class="kalender">';
                angular.forEach(value, function(nama,indexNama){
                	html+= '<div class="container"><div class="merah" flex="nowrap">&nbsp</div><div class="isi">'+nama.kegiatan+'</div></div>';
                });
                html+= "</div>";
                MaterialCalendarData.setDayContent(date,html);
            });
  		}

  		function handleError(response){
  			$log.log(response);
  			$scope.showSimpleToast(response.data.error);
  		}
}]);
