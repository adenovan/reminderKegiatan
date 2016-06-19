angular.module('ion-reminder.controllers', ['ionic-toast','reminder.services'])

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
})

.controller('LoginCtrl', function($scope, $stateParams,ionicToast,loginService,$window,$state,$log,PUSH_NOTIFICATIONS) {
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.route = route;

	$scope.$on( "$ionicView.enter", function(event) {
		$log.log($window.localStorage['hak_akses']);
		$log.log($window.localStorage['session']);
		if($window.localStorage['hak_akses']!== undefined){
			$scope.route(false);
		}
	});

	$scope.login =  function(postData){
		return loginService.login(postData).then(loginHandle,error);
	};

	function loginHandle(response){
			if(response.data.hasOwnProperty('error')){
				$scope.showToast(response.data.error)
			}else{
					$window.localStorage['session'] = response.data.Session;
					$window.localStorage['hak_akses'] = response.data.hak_akses;
					$scope.route(true);
			}
	};

	function route(toast){
		if(toast){
		$scope.showToast("Login Berhasil");
		}
		switch($window.localStorage['hak_akses']){
			case '0':
			$state.go('super.kegiatan');
			PUSH_NOTIFICATIONS.init();
			break;
			case '1':
			$state.go('admin.kegiatan');
			PUSH_NOTIFICATIONS.init();
			break;
			case '2':
			$state.go('senat.kegiatan');
			PUSH_NOTIFICATIONS.init();
			break;
			//todo balma location
			case '3':
			$state.go('balma.kegiatan');
			PUSH_NOTIFICATIONS.init();
			break;
			case '4':
			$state.go('panitia.kegiatan');
			PUSH_NOTIFICATIONS.init();
			break;
			default:
			$scope.showToast("Kegiatan anda telah berakhir hubungi senat mahasiwa untuk kegiatan yang baru");
			break;
		}
	}
	function error(response){
		$log.log(response);
		$scope.showToast("Tidak ada koneksi internet");
	}
})

.controller('SuperCtrl', function($scope,$rootScope,$state,$stateParams,$log,userService,$window,Poller,ionicToast,$ionicHistory,PUSH_NOTIFICATIONS) {
	// nav colori
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};
	$scope.user = null;
	$scope.$on( "$ionicView.enter", function(event) {
		if($scope.user === null){
		userService.GetBoxById($window.localStorage['session']).then(getBox,handleError);
		}
		Poller.poll('http://192.168.43.24/reminder/model/notif/longPolling/'+$window.localStorage['session']).then(handleNotif,handleError);
	});

	$scope.logout = function(){
    PUSH_NOTIFICATIONS.unregister();
    $window.localStorage.clear();
    $state.go('login');
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
 	};

	function handleNotif(response){
		$log.log(response);
		$scope.dataNotif = response;
	}

	function handleError(response){
		$log.log(response);
		$scope.showToast("koneksi internet terputus..");
	}
	function getBox(response){
		$log.log("getBox");
		$scope.user = response.data;
	}

	$rootScope.$on('$stateChangeSuccess', 
	function(event, toState){
		switch(toState.url){
			case '/kegiatan':
				$rootScope.kegiatanColor = true;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/user1':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = true;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/user2':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = true;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;				
			case '/user3':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = true;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/panitia1':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = true;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/panitia2':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = true;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/ormawa':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = true;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/notifikasi':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = true;
				$rootScope.pengaturanColor = false;	
				break;			
			case '/pengaturan':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = true;	
				break;	
			default:
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;
				break;
		}
	})
})

.controller('AdminCtrl', function($scope,$rootScope,$state,$stateParams,$log,userService,$window,Poller,ionicToast,$ionicHistory,PUSH_NOTIFICATIONS) {
	// nav colori
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};
	$scope.user = null;
	$scope.$on( "$ionicView.enter", function(event) {
		if($scope.user === null){
		userService.GetBoxById($window.localStorage['session']).then(getBox,handleError);
		}
		Poller.poll('http://192.168.43.24/reminder/model/notif/longPolling/'+$window.localStorage['session']).then(handleNotif,handleError);
	});

	$scope.logout = function(){
    PUSH_NOTIFICATIONS.unregister();
    $window.localStorage.clear();
    $state.go('login');
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
 	};

	function handleNotif(response){
		$log.log(response);
		$scope.dataNotif = response;
	}

	function handleError(response){
		//$log.log(response);
		$scope.showToast("koneksi internet terputus..");
	}
	function getBox(response){
		$log.log("getBox");
		$scope.user = response.data;
	}

	$rootScope.$on('$stateChangeSuccess', 
	function(event, toState){
		switch(toState.url){
			case '/kegiatan':
				$rootScope.kegiatanColor = true;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/user1':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = true;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/user2':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = true;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;				
			case '/user3':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = true;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/panitia1':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = true;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/panitia2':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = true;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/ormawa':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = true;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/notifikasi':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = true;
				$rootScope.pengaturanColor = false;	
				break;			
			case '/pengaturan':
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = true;	
				break;	
			default:
				$rootScope.kegiatanColor = false;
				$rootScope.userColor = false;	
				$rootScope.panitiaColor = false;
				$rootScope.ormawaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;
				break;
		}
	})
})

.controller('SenatCtrl', function($scope,$state,$rootScope, $stateParams,$log,userService,$window,Poller,ionicToast,$ionicHistory,PUSH_NOTIFICATIONS) {
	// nav colori
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};
	$scope.user = null;
	$scope.$on( "$ionicView.enter", function(event) {
		if($scope.user === null){
		userService.GetBoxById($window.localStorage['session']).then(getBox,handleError);
		}
		Poller.poll('http://192.168.43.24/reminder/model/notif/longPolling/'+$window.localStorage['session']).then(handleNotif,handleError);
	});

	$scope.logout = function(){
    PUSH_NOTIFICATIONS.unregister();
    $window.localStorage.clear();
    $state.go('login');
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
 	};

	function handleNotif(response){
		$log.log(response);
		$scope.dataNotif = response;
	}

	function handleError(response){
		//$log.log(response);
		$scope.showToast("koneksi internet terputus..");
	}
	function getBox(response){
		$log.log("getBox");
		$scope.user = response.data;
	}

	$rootScope.$on('$stateChangeSuccess', 
	function(event, toState){
		switch(toState.url){
			case '/kegiatan':
				$rootScope.kegiatanColor = true;	
				$rootScope.panitiaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/panitia1':
				$rootScope.kegiatanColor = false;
				$rootScope.panitiaColor = true;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/panitia2':
				$rootScope.kegiatanColor = false;	
				$rootScope.panitiaColor = true;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/notifikasi':
				$rootScope.kegiatanColor = false;
				$rootScope.panitiaColor = false;
				$rootScope.notifikasiColor = true;
				$rootScope.pengaturanColor = false;	
				break;			
			case '/pengaturan':
				$rootScope.kegiatanColor = false;
				$rootScope.panitiaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = true;	
				break;	
			default:
				$rootScope.kegiatanColor = false;
				$rootScope.panitiaColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;
				break;
		}
	})
})


.controller('BalmaCtrl', function($scope,$rootScope,$state, $stateParams,$log,userService,$window,Poller,ionicToast,$ionicHistory,PUSH_NOTIFICATIONS) {
	// nav colori
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};
	$scope.user = null;
	$scope.$on( "$ionicView.enter", function(event) {
		if($scope.user === null){
		userService.GetBoxById($window.localStorage['session']).then(getBox,handleError);
		}
		Poller.poll('http://192.168.43.24/reminder/model/notif/longPolling/'+$window.localStorage['session']).then(handleNotif,handleError);
	});

	$scope.logout = function(){
    PUSH_NOTIFICATIONS.unregister();
    $window.localStorage.clear();
    $state.go('login');
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
 	};

	function handleNotif(response){
		$log.log(response);
		$scope.dataNotif = response;
	}

	function handleError(response){
		//$log.log(response);
		$scope.showToast("koneksi internet terputus..");
	}
	function getBox(response){
		$log.log("getBox");
		$scope.user = response.data;
	}

	$rootScope.$on('$stateChangeSuccess', 
	function(event, toState){
		switch(toState.url){
			case '/kegiatan':
				$rootScope.kegiatanColor = true;	
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/notifikasi':
				$rootScope.kegiatanColor = false;
				$rootScope.notifikasiColor = true;
				$rootScope.pengaturanColor = false;	
				break;			
			case '/pengaturan':
				$rootScope.kegiatanColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = true;	
				break;	
			default:
				$rootScope.kegiatanColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;
				break;
		}
	})
})

.controller('PanitiaCtrl', function($scope,$state,$ionicHistory,$rootScope, $stateParams,$log,userService,$window,Poller,ionicToast,PUSH_NOTIFICATIONS) {
	// nav colori
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};
	$scope.user = null;
	$scope.$on( "$ionicView.enter", function(event) {
		if($scope.user === null){
		userService.GetBoxById($window.localStorage['session']).then(getBox,handleError);
		}
		Poller.poll('http://192.168.43.24/reminder/model/notif/longPolling/'+$window.localStorage['session']).then(handleNotif,handleError);
	});

	$scope.logout = function(){
    PUSH_NOTIFICATIONS.unregister();
    $window.localStorage.clear();
    $state.go('login');
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
 	};

	function handleNotif(response){
		$log.log(response);
		$scope.dataNotif = response;
	}

	function handleError(response){
		//$log.log(response);
		$scope.showToast("koneksi internet terputus..");
	}
	function getBox(response){
		$log.log("getBox");
		$scope.user = response.data;
	}

	$rootScope.$on('$stateChangeSuccess', 
	function(event, toState){
		switch(toState.url){
			case '/kegiatan':
				$rootScope.kegiatanColor = true;	
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;	
				break;
			case '/notifikasi':
				$rootScope.kegiatanColor = false;
				$rootScope.notifikasiColor = true;
				$rootScope.pengaturanColor = false;	
				break;			
			case '/pengaturan':
				$rootScope.kegiatanColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = true;	
				break;	
			default:
				$rootScope.kegiatanColor = false;
				$rootScope.notifikasiColor = false;
				$rootScope.pengaturanColor = false;
				break;
		}
	})
})

.controller('kegiatanListCtrl', function($scope,$state, $stateParams,kegiatanService,$window,ionicToast,$log,$ionicPopup) {
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.kegiatanList = null;
	$scope.pull = pull;
	$scope.deleteKegiatan = deleteKegiatan;
	$scope.cari = cari;

	$scope.changeLocation = changeLocation;

	$scope.$on( "$ionicView.enter", function(event) {
		$scope.pull();
	});

	function pull(){
		//$log.log($window.localStorage['hak_akses'])
		if($window.localStorage['hak_akses'] === '4'){
			kegiatanService.GetAllKegiatanPanitia($window.localStorage['session']).then(GetAll,handleError);
		}else{
			kegiatanService.GetAll().then(GetAll);
		}
		
	}

	function cari(search){
		$log.log(search);
		if(search !== undefined){
			kegiatanService.Search(search).then(GetAll,handleError);
		}
	}

	function GetAll(response){
		$log.log(response.data);
		$scope.kegiatanList = response.data;
	};

	function changeLocation(url){
		$state.go(url);
	}

	function deleteKegiatan(id,nama){
		$scope.id_delete = id;
		var popup = $ionicPopup.confirm({
    	title: 'Apakah anda yakin ingin menghapus kegiatan '+ nama,
     	template: 'Kegiatan '+ nama + ' yang akan di hapus tidak dapat dikembalikan',
     	buttons:[{text:"batal"},{text:"Hapus",type:"button-assertive",onTap:function(e){return true;}}]
   		});

		popup.then(function(res) {
		     if(res) {
		     kegiatanService.Delete({'id_kegiatan':$scope.id_delete}).then(handleSuccess,handleError);
		     } else {
		       $scope.showToast('Delete kegiatan di batalkan');
		     }
		});
	}

	function handleSuccess(response){
	   	$log.log(response.data);
	    $scope.showToast(response.data.success);
	    $scope.pull();
	}
	
	function handleError(response){
	    $log.log(response);
	    $scope.showToast(response.data.error);
	}
})

.controller('kegiatanCtrl', function($scope, $stateParams) {
	$scope.loading = false;
	$scope.showDes = false;
	$scope.toogleLoading = toogleLoading;
	$scope.toogleShow = toogleShow;

	function toogleShow(){
		$scope.showDes = !$scope.showDes;
	}

	function toogleLoading(condition){
		$scope.loading = condition;
	}

})

.controller('infoPanitiaCtrl', function($scope, $stateParams,panitiaService,$log,ionicMaterialInk) {
	ionicMaterialInk.displayEffect();
	$scope.showPanitia = false;
	$scope.getpanitia = getpanitia;
	$scope.panitia = null;
	$scope.loading = false;

	function getpanitia(id){
		if(!$scope.panitia){
			$scope.$parent.toogleLoading(true);
		    panitiaService.GetById(id).then(fillPanitia);
		}else{
			$scope.showPanitia = !$scope.showPanitia;
		}
	}

	function fillPanitia(response){
			$scope.$parent.toogleLoading(false);
	        $log.log(response.data);
			$scope.panitia = response.data;
			$scope.showPanitia = !$scope.showPanitia;
	}
})

.controller('infoEvaluasiCtrl', function($scope, $stateParams,evaluasiService,$log) {
	$scope.showEval = false;
	$scope.getEvaluasi = getEvaluasi;
	$scope.childUpdate = childUpdate; // used by form child
	$scope.evaluasiList = null;
	$scope.kegiatanID = null;

	function getEvaluasi(id){
		$scope.kegiatanID = id;
		if(!$scope.evaluasiList){
			$scope.$parent.toogleLoading(true);
			evaluasiService.GetAll(id).then(fillEvaluasi);
		}else{
			$scope.showEval = !$scope.showEval;
		}
	}

	function childUpdate(id){
		$log.log("evaluasi update child submit")
	 	evaluasiService.GetLast(id).then(pushEvaluasi);
	}

	function fillEvaluasi(response){
		$log.log(response.data);
		$scope.evaluasiList = response.data;
		$scope.showEval = !$scope.showEval;
		$scope.$parent.toogleLoading(false);
	}

	function pushEvaluasi(response){
		$log.log(response.data);
		$scope.evaluasiList.push(response.data);
	}
})

.controller('kirimEvaluasiCtrl', function($scope, $stateParams, $cordovaImagePicker,$log,$cordovaFileTransfer,
	$http,$ionicPlatform,$cordovaCamera,$window) {
	$scope.evaluasi = null;
	$scope.url = 'http://192.168.43.24/reminder/model/kegiatan/newEvaluasi';

	$scope.cameraPicture = function(){
		$ionicPlatform.ready(function() {
			var options = {
	        quality: 100,
	        destinationType: Camera.DestinationType.FILE_URL,
	        sourceType: Camera.PictureSourceType.CAMERA,
	        encodingType: Camera.EncodingType.JPEG,
	        allowEdit: true,
	        targetWidth: 1080,
      		targetHeight: 720
	      	};

	      	$cordovaCamera.getPicture(options).then(function(imageData) {
		      $scope.targetPath = imageData;
	          $scope.filename = $scope.targetPath.split("/").pop();
		    }, function(err) {
		      // error
		      $scope.$parent.showToast("kamera error");
		    });

		});
	}

	$scope.addPicture = function(){
		$ionicPlatform.ready(function() {
			$log.log("add Picture");
			var options = {
			   maximumImagesCount: 1,
			   width: 1080,
			   height: 720,
			   quality: 100
		  	};

		  	$cordovaImagePicker.getPictures(options)
		    .then(function (results) {
		      for (var i = 0; i < results.length; i++) {
		        console.log('Image URI: ' + results[i]);
		        $scope.targetPath = results[i];
	            $scope.filename = $scope.targetPath.split("/").pop();
		      }
		    }, function(error) {
		      	$scope.$parent.showToast("error memilih gambar dari gallery");
		    });
		});
	}

	$scope.kirimEvaluasi = function(){
		if($scope.evaluasi!==null || $scope.filename!== undefined){
			$scope.$parent.toogleLoading(true);
			if($scope.targetPath !== undefined && $scope.filename!== undefined){
				// with image
				$ionicPlatform.ready(function() {
					$log.log("kirim Evaluasi")
					var options_tosend = {
			            fileKey: "file",
			            fileName: $scope.filename,
			            chunkedMode: false,
			            mimeType: "image/jpg",
			            params: {'id_kegiatan': $scope.$parent.kegiatanID, 'id_panitia' : $window.localStorage['session'],'evaluasi':$scope.evaluasi}
			            };
		            $cordovaFileTransfer.upload($scope.url, $scope.targetPath, options_tosend).then(function (result) {
		                $log.log(result);
		                $scope.evaluasi = null;
		               	$scope.targetPath = undefined;
		            	$scope.filename = undefined;
		            	$scope.$parent.toogleLoading(false);
		                $scope.$parent.showToast("Data evaluasi berhasil dimasukan");
		                $scope.$parent.childUpdate($scope.$parent.kegiatanID);
		            }, function(err) {
		            	$scope.$parent.toogleLoading(false);
				        $scope.$parent.showToast("Evaluasi gagal di kirim");
				    }, function (progress) {
				        // constant progress updates
				    });	
				});
			}else{
			// post evaluasi
			var params = {'id_kegiatan': $scope.$parent.kegiatanID,'id_panitia' : $window.localStorage['session'], 'evaluasi':$scope.evaluasi};
			$http.post($scope.url,params)
				.then(function(result){
					$log.log(result)
					$scope.evaluasi = null;
					$scope.targetPath = undefined;
	            	$scope.filename = undefined;
	            	$scope.$parent.toogleLoading(false);
					$scope.$parent.showToast(result.data.success);
					$scope.$parent.childUpdate($scope.$parent.kegiatanID);
				},function(error){
					$log.log(error)
					$scope.$parent.toogleLoading(false);
					$scope.$parent.showToast(error.data.error);
				});
			}
		}else{
			$scope.$parent.showToast("Evaluasi masih kosong");
		}

	}
})

.controller('userListCtrl', function($scope,$state, $stateParams,ionicToast,$log,userService,$ionicPopup) {
	$scope.pull = pull;
	$scope.adminList = null;
	$scope.changeLocation =changeLocation;
	$scope.$on( "$ionicView.enter", function(event) {
		$scope.pull();
	});
	$scope.cari = cari;
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.deleteUser = deleteUser;


	function cari(search){
		$log.log(search);
		if(search !== undefined){
			userService.CariAdmin(search).then(fillAdminList,handleError);
		}
	}

	function changeLocation(url,kategori){
		var params = {'kategori':kategori};
		$state.go(url,params);
	}

	function pull(){
		userService.GetAdmin().then(fillAdminList,handleError);
	}

	function fillAdminList(response){
		$log.log(response.data);
		if(response.status>400){
			$scope.showToast(response.data.error);
		}else{
			$scope.adminList = response.data;
		}
	}

	function handleSuccess(response){
		$scope.showToast(response.data.success);
		$scope.pull();
	}

	function handleError(response){
		$scope.showToast(response.data.error);
	}

	function deleteUser(id,nama){
		$scope.id_delete = id;
		var popup = $ionicPopup.confirm({
    	title: 'Apakah anda yakin ingin menghapus (Admin) '+ nama + '?',
     	template: 'Menghapus (Admin) '+ nama + ' akan menghapus seluruh evaluasi yang diberikan oleh '+ nama,
     	buttons:[{text:"batal"},{text:"Hapus",type:"button-assertive",onTap:function(e){return true;}}]
   		});

		popup.then(function(res) {
		     if(res) {
		     userService.Delete({id:$scope.id_delete}).then(handleSuccess,handleError);
		     } else {
		       $scope.showToast('Delete user di batalkan');
		     }
		});
	}
})

.controller('userListCtrl2', function($scope,$state, $stateParams,ionicToast,$log,userService,$ionicPopup) {
	$scope.pull = pull;
	$scope.senatList = null;
	$scope.changeLocation =changeLocation;
	$scope.$on( "$ionicView.enter", function(event) {
		$scope.pull();
	});
	$scope.cari = cari;
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.deleteUser = deleteUser;
	
	function cari(search){
		$log.log(search);
		if(search !== undefined){
			userService.CariSenat(search).then(fillSenatList,handleError);
		}
	}


	function changeLocation(url,kategori){
		var params = {'kategori':kategori};
		$state.go(url,params);
	}

	function pull(){
		userService.GetSenat().then(fillSenatList,handleError);
	}

	function fillSenatList(response){
		$log.log(response.data);
		if(response.status>400){
			$scope.showToast(response.data.error);
		}else{
			$scope.senatList = response.data;
		}
	}


	function handleSuccess(response){
		$scope.showToast(response.data.success);
		$scope.pull();
	}

	function handleError(response){
		$scope.showToast(response.data.error);
	}

	function deleteUser(id,nama){
		$scope.id_delete = id;
		var popup = $ionicPopup.confirm({
    	title: 'Apakah anda yakin ingin menghapus (Senat) '+ nama + '?',
     	template: 'Menghapus (Senat) '+ nama + ' akan menghapus seluruh evaluasi yang diberikan oleh '+ nama,
     	buttons:[{text:"batal"},{text:"Hapus",type:"button-assertive",onTap:function(e){return true;}}]
   		});

		popup.then(function(res) {
		     if(res) {
		     userService.Delete({id:$scope.id_delete}).then(handleSuccess,handleError);
		     } else {
		       $scope.showToast('Delete user di batalkan');
		     }
		});
	}

})

.controller('userListCtrl3', function($scope,$state, $stateParams,ionicToast,$log,userService,$ionicPopup) {
	$scope.pull = pull;
	$scope.balmaList = null;
	$scope.changeLocation =changeLocation;
	$scope.$on( "$ionicView.enter", function(event) {
		$scope.pull();
	});
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.cari = cari;

	$scope.deleteUser = deleteUser;
	function cari(search){
		$log.log(search);
		if(search !== undefined){
			userService.CariBalma(search).then(fillBalmaList,handleError);
		}
	}

	function changeLocation(url,kategori){
		var params = {'kategori':kategori};
		$state.go(url,params);
	}

	function pull(){
		userService.GetBalma().then(fillBalmaList,handleError);
	}

	function fillBalmaList(response){
		$log.log(response.data);
		if(response.status>400){
			$scope.showToast(response.data.error);
		}else{
			$scope.balmaList = response.data;
		}
	}

	function handleSuccess(response){
		$scope.showToast(response.data.success);
		$scope.pull();
	}

	function handleError(response){
		$scope.showToast(response.data.error);
	}

	function deleteUser(id,nama){
		$scope.id_delete = id;
		var popup = $ionicPopup.confirm({
    	title: 'Apakah anda yakin ingin menghapus (Balma) '+ nama + '?',
     	template: 'Menghapus (Balma) '+ nama + ' akan menghapus seluruh evaluasi yang diberikan oleh '+ nama,
     	buttons:[{text:"batal"},{text:"Hapus",type:"button-assertive",onTap:function(e){return true;}}]
   		});

		popup.then(function(res) {
		     if(res) {
		     userService.Delete({id:$scope.id_delete}).then(handleSuccess,handleError);
		     } else {
		       $scope.showToast('Delete user di batalkan');
		     }
		});
	}
})

.controller('panitiaListCtrl', function($scope, $stateParams,panitiaService,ionicToast,$log,$state,$ionicPopup) {
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.pull = pull;
	$scope.panitiaAktif = null
	$scope.$on( "$ionicView.enter", function(event) {
		$scope.pull();
	});
	$scope.changeLocation = changeLocation;
	$scope.cari =cari;

	function cari(search){
		$log.log(search);
		if(search !== undefined){
			panitiaService.CariAktif(search).then(fillPanitiaAktif,handleError);
		}
	}

	$scope.deleteUser = deleteUser;
	function pull(){
		panitiaService.GetAktif().then(fillPanitiaAktif,handleError);
	}

	function fillPanitiaAktif(response){
		$log.log(response.data)
		if(response.status>400){
			$scope.showSimpleToast(response.data.error);
		}else{
			$scope.panitiaAktif = response.data;
		}
	}

	function changeLocation(url){
		$state.go(url);
	}


	function handleSuccess(response){
		$scope.showToast(response.data.success);
		$scope.pull();
	}

	function handleError(response){
		$scope.showToast(response.data.error);
	}

	function deleteUser(id,nama){
		$scope.id_delete = id;
		var popup = $ionicPopup.confirm({
    	title: 'Apakah anda yakin ingin menghapus '+ nama + '?',
     	template: 'Menghapus '+ nama + ' akan menghapus seluruh evaluasi yang diberikan oleh Yudi Krisnawan, dan seluruh kegiatan yang di kelola  '+ nama,
     	buttons:[{text:"batal"},{text:"Hapus",type:"button-assertive",onTap:function(e){return true;}}]
   		});

		popup.then(function(res) {
		     if(res) {
		     panitiaService.Delete({id:$scope.id_delete}).then(handleSuccess,handleError);
		     } else {
		       $scope.showToast('Delete panitia di batalkan');
		     }
		});
	}
})

.controller('panitiaListCtrl2', function($scope, $stateParams,panitiaService,ionicToast,$log,$state,$ionicPopup) {
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.pull = pull;
	$scope.panitiaTidakAktif = null;
	$scope.$on( "$ionicView.enter", function(event) {
		$scope.pull();
	});
	$scope.changeLocation = changeLocation;
	$scope.deleteUser = deleteUser;
	$scope.cari = cari;

	function cari(search){
		$log.log(search);
		if(search !== undefined){
			panitiaService.CariTidakAktif(search).then(fillPanitiaTidakAktif,handleError);
		}
	}

	function pull(){
		panitiaService.GetTidakAktif().then(fillPanitiaTidakAktif);
	}

	function fillPanitiaTidakAktif(response){
		$log.log(response.data)
		if(response.status>400){
			$scope.showSimpleToast(response.data.error);
		}else{
			$scope.panitiaTidakAktif = response.data;
		}
	}

	function changeLocation(url){
		$state.go(url);
	}


	function handleSuccess(response){
		$scope.showToast(response.data.success);
		$scope.pull();
	}

	function handleError(response){
		$scope.showToast(response.data.error);
	}

	function deleteUser(id,nama){
		$scope.id_delete = id;
		var popup = $ionicPopup.confirm({
    	title: 'Apakah anda yakin ingin menghapus '+ nama + '?',
     	template: 'Menghapus '+ nama + ' akan menghapus seluruh evaluasi yang diberikan oleh Yudi Krisnawan, dan seluruh kegiatan yang di kelola  '+ nama,
     	buttons:[{text:"batal"},{text:"Hapus",type:"button-assertive",onTap:function(e){return true;}}]
   		});

		popup.then(function(res) {
		     if(res) {
		     panitiaService.Delete({id:$scope.id_delete}).then(handleSuccess,handleError);
		     } else {
		       $scope.showToast('Delete panitia di batalkan');
		     }
		});
	}
})


.controller('ormawaListCtrl', function($scope, $stateParams,ionicToast,$log,ukmService,$state,$ionicPopup) {
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.pull = pull;
	$scope.ukmList = null;
	$scope.$on( "$ionicView.enter", function(event) {
		$scope.pull();
	});
	$scope.changeLocation = changeLocation;
	$scope.deleteOrmawa = deleteOrmawa;
	$scope.cari = cari;

	function cari(search){
		$log.log(search);
		if(search !== undefined){
			ukmService.Cari(search).then(fillUkm,handleError);
		}
	}

	function pull(){
		ukmService.GetAll().then(fillUkm,handleError);
	};

	function fillUkm(data){
		$log.log(data);
		if(data.hasOwnProperty('error')){
			$scope.showToast(data.error);
		}else{
			$scope.ukmList = data;
		}
	};

	function handleSuccess(data){
	    $scope.showToast(data.success);
	    $scope.pull();
	};
	
	function handleError(error){
		$scope.showToast(error.data.error);
	};

	function changeLocation(url){
		$state.go(url);
	};

	function deleteOrmawa(id,nama){
		$scope.id_delete = id;
		var popup = $ionicPopup.confirm({
    	title: 'Apakah anda yakin ingin menghapus organisasi mahasiswa  '+ nama + '?',
     	template: 'Seluruh Kegiatan yang dikelola oleh organisasi mahasiswa '+ nama + ' akan ikut terhapus',
     	buttons:[{text:"batal"},{text:"Hapus",type:"button-assertive",onTap:function(e){return true;}}]
   		});

		popup.then(function(res) {
		     if(res) {
		     ukmService.Delete({id_ukm:$scope.id_delete}).then(handleSuccess,handleError);
		     } else {
		       $scope.showToast('Delete ormawa di batalkan');
		     }
		});
	}
})

.controller('notifikasiListCtrl', function($scope, $stateParams,notifikasiService,$window,$log,ionicToast) {
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.notifikasiList = null;
	$scope.pull = pull;
	$scope.$on( "$ionicView.enter", function(event) {
		$scope.pull();
	});

	function pull(){
		notifikasiService.GetAll($window.localStorage['session'],0,25).then(fillNotif,handleError);
	}

	function fillNotif(response){
		$log.log(response.data);
		$scope.notifikasiList= response.data;
	}

	function handleError(response){
		showToast(response.data);
	}
})

.controller('addKegiatanCtrl', function($scope,$filter,$state, $stateParams,ionicMaterialInk,
	panitiaService,ukmService,$log,kegiatanService,ionicToast,$ionicHistory) {
	ionicMaterialInk.displayEffect();
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};


	$scope.goBack = goBack;
	$scope.tambah = tambah;


	$scope.$on( "$ionicView.enter", function(event) {
		$scope.data = {};
		$scope.kirim = {};
		panitiaService.SelectAll().then(selectPanitia);
		ukmService.SelectAll().then(selectUkm);
		kegiatanService.SelectAll().then(selectRefrensi);
	});

	//todo cek akses
	function goBack(){	
    	$ionicHistory.goBack();
	} 

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

	function tambah(){
		//$log.log($scope.data);
		if($scope.data.panitia=== undefined || $scope.data.ukm=== undefined
			|| $scope.data.tanggal_kegiatan === undefined || $scope.data.time_kegiatan === undefined ||
			$scope.data.tanggal_audiensi === undefined || $scope.data.time_audiensi === undefined ||
			$scope.data.nama_kegiatan === undefined || $scope.data.lokasi_kegiatan === undefined ||
			$scope.data.deskripsi_kegiatan === undefined
			){
			$scope.showToast("Data kegiatan tidak lengkap");
		}else{
			$scope.tanggal_kegiatan = $filter('date')($scope.data.tanggal_kegiatan, "yyyy-MM-dd");
			$scope.jam_kegiatan = $filter('date')($scope.data.time_kegiatan,"HH:mm:ss");
			$scope.tanggal_audiensi = $filter('date')($scope.data.tanggal_audiensi, "yyyy-MM-dd");
			$scope.jam_audiensi = $filter('date')($scope.data.time_audiensi,"HH:mm:ss");
			$scope.kirim.id_panitia = $scope.data.panitia.id_user;
			$scope.kirim.id_ukm = $scope.data.ukm.id_ukm;
			if($scope.data.refrensi!== undefined){
				$scope.kirim.id_refrensi = $scope.data.refrensi.id_kegiatan;
			}else{
				$scope.kirim.id_refrensi = "NULL";
			}
			$scope.kirim.nama_kegiatan = $scope.data.nama_kegiatan;
			$scope.kirim.lokasi_kegiatan = $scope.data.lokasi_kegiatan;
			$scope.kirim.deskripsi_kegiatan = $scope.data.deskripsi_kegiatan;
			$scope.kirim.tanggal_kegiatan = $scope.tanggal_kegiatan +' '+ $scope.jam_kegiatan;
			$scope.kirim.tanggal_audiensi = $scope.tanggal_audiensi +' '+ $scope.jam_audiensi;
			$log.log($scope.kirim);
			kegiatanService.Create($scope.kirim).then(handleSuccess,handleError);
		}
	}

	function handleSuccess(response){
	    $log.log(response);
	    $scope.data = {};
	    $scope.goBack();
	    $scope.showToast(response.data.success);
	}
	
	function handleError(response){
	    $log.log(response);
	    $scope.showToast(response.data.error);
	}
})

.controller('refrensiKegiatanCtrl', function($scope,$state, $stateParams,$log,kegiatanService,$ionicHistory) {
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.goBack = goBack;
	$scope.kegiatan = null;
	$scope.$on( "$ionicView.enter", function(event) {
		kegiatanService.GetById($stateParams.id_kegiatan).then(handleSuccess);
	});

	function handleSuccess(response){
		if(response.status>400){
			$scope.showToast(response.data.error);
		}else{
			$scope.kegiatan = response.data;
			$log.log(response.data);
		}
	}
	//todo cek akses
	function goBack(){
	$ionicHistory.goBack()	
	} 
})

.controller('notifikasiKegiatanCtrl', function($scope,$state, $stateParams,$log,kegiatanService,$ionicHistory,evaluasiService) {
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.goBack = goBack;
	$scope.kegiatan = null;
	$scope.showEval = false;
	$scope.getEvaluasi = getEvaluasi;
	$scope.kegiatanID = null;
	$scope.$on( "$ionicView.enter", function(event) {
		kegiatanService.GetById($stateParams.id_kegiatan).then(handleSuccess);
	});
	$scope.loading = false;
	$scope.showDes = false;
	$scope.toogleLoading = toogleLoading;
	$scope.toogleShow = toogleShow;

	function toogleShow(){
		$scope.showDes = !$scope.showDes;
	}

	function toogleLoading(condition){
		$scope.loading = condition;
	}

	function handleSuccess(response){
		if(response.status>400){
			$scope.showToast(response.data.error);
		}else{
			$scope.kegiatan = response.data;
			$scope.evaluasiList = null;
			$scope.getEvaluasi($stateParams.id_kegiatan);
			$log.log(response.data);
		}
	}
	//todo cek akses
	function goBack(){
	$ionicHistory.goBack()	
	}

	function getEvaluasi(id){
		$scope.kegiatanID = id;
		if(!$scope.evaluasiList){
			evaluasiService.GetAll(id).then(fillEvaluasi);
		}else{
			$scope.showEval = !$scope.showEval;
		}
	}

	function fillEvaluasi(response){
		$log.log(response.data);
		$scope.evaluasiList = response.data;
		$scope.showEval = !$scope.showEval;
	}
})


.controller('editKegiatanCtrl', function($scope,$filter,$state, $stateParams,ionicMaterialInk,
	panitiaService,ukmService,$log,kegiatanService,ionicToast,$ionicHistory) {
	ionicMaterialInk.displayEffect();
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};
	$scope.goBack = goBack;
	$scope.edit = edit;

	$scope.$on( "$ionicView.enter", function(event) {
		$scope.data = {};
		$scope.kirim = {};
		panitiaService.SelectAll().then(selectPanitia);
		ukmService.SelectAll().then(selectUkm);
		kegiatanService.SelectEditAll($stateParams.id_kegiatan).then(selectRefrensi);
		kegiatanService.SelectOne($stateParams.id_kegiatan).then(fillData,handleError);
	});

	//todo cek akses
	function goBack(){	
    	$ionicHistory.goBack()	
	} 

	function selectPanitia(response){
		//$log.log(response.data);
		$scope.panitia = response.data;
	}

	function selectUkm(data){
		//$log.log(data);
		$scope.ukm = data;
	}

	function selectRefrensi(response){
		//$log.log(response.data);
		$scope.refrensi = response.data;
	}

	function edit(){
		//$log.log($scope.data);
		if($scope.data.panitia=== undefined || $scope.data.ukm=== undefined
			|| $scope.data.tanggal_kegiatan === undefined || $scope.data.time_kegiatan === undefined ||
			$scope.data.tanggal_audiensi === undefined || $scope.data.time_audiensi === undefined ||
			$scope.data.nama_kegiatan === undefined || $scope.data.lokasi_kegiatan === undefined ||
			$scope.data.deskripsi_kegiatan === undefined
			){
			$scope.showToast("Data kegiatan tidak lengkap");
		}else{
			$scope.tanggal_kegiatan = $filter('date')($scope.data.tanggal_kegiatan, "yyyy-MM-dd");
			$scope.jam_kegiatan = $filter('date')($scope.data.time_kegiatan,"HH:mm:ss");
			$scope.tanggal_audiensi = $filter('date')($scope.data.tanggal_audiensi, "yyyy-MM-dd");
			$scope.jam_audiensi = $filter('date')($scope.data.time_audiensi,"HH:mm:ss");
			$scope.kirim.id_panitia = $scope.data.panitia.id_user;
			$scope.kirim.id_ukm = $scope.data.ukm.id_ukm;
			if($scope.data.refrensi!== undefined){
				$scope.kirim.id_refrensi = $scope.data.refrensi.id_kegiatan;
			}else{
				$scope.kirim.id_refrensi = "NULL";
			}
			$scope.kirim.nama_kegiatan = $scope.data.nama_kegiatan;
			$scope.kirim.lokasi_kegiatan = $scope.data.lokasi_kegiatan;
			$scope.kirim.deskripsi_kegiatan = $scope.data.deskripsi_kegiatan;
			$scope.kirim.tanggal_kegiatan = $scope.tanggal_kegiatan +' '+ $scope.jam_kegiatan;
			$scope.kirim.tanggal_audiensi = $scope.tanggal_audiensi +' '+ $scope.jam_audiensi;
			$log.log($scope.kirim);
			kegiatanService.Update($scope.kirim).then(handleSuccess,handleError);
		}
	}

	function fillData(response){
		$log.log(response);
		$scope.dataKegiatan = response.data;
		$scope.kirim.id_kegiatan = $scope.dataKegiatan.id_kegiatan;
		//tanggal kegiatan
		var tglK = $scope.dataKegiatan.tanggal_kegiatan;
		//tanggal audiensi
		var tglA = $scope.dataKegiatan.tanggal_audiensi;
		$scope.data.tanggal_kegiatan = new Date(tglK.substring(0,10));
		$scope.data.tanggal_audiensi = new Date(tglA.substring(0,10));
		$scope.data.time_kegiatan = new Date(tglK);
		$scope.data.time_audiensi = new Date(tglA);
		$scope.data.nama_kegiatan = $scope.dataKegiatan.nama_kegiatan;
		$scope.data.lokasi_kegiatan = $scope.dataKegiatan.lokasi_kegiatan;
		$scope.data.deskripsi_kegiatan = $scope.dataKegiatan.deskripsi_kegiatan;
		panitiaService.SelectOne($scope.dataKegiatan.id_panitia).then(function(response){
			//$log.log(response);
			$scope.data.panitia = response.data;
		});
		ukmService.SelectOne($scope.dataKegiatan.id_ukm).then(function(response){
			$scope.data.ukm = response;
		});

		if($scope.dataKegiatan.id_refrensi!=="0"){
			kegiatanService.SelectEditOne($scope.dataKegiatan.id_refrensi).then(function(response){
			$log.log(response.data);
			$scope.data.refrensi = response.data;
			});
		}
	}

	function handleSuccess(response){
	    $log.log(response);
	    $scope.goBack()
	    $scope.showToast(response.data.success);
	}
	
	function handleError(response){
	    $log.log(response);
	    $scope.showToast(response.data.error);
	}
})

.controller('notifikasiCtrl', function($scope,$state, $stateParams,$log,ionicMaterialInk,notifikasiService) {
	ionicMaterialInk.displayEffect();

	$scope.viewKegiatan = viewKegiatan;

	function viewKegiatan(notifikasi){
		$log.log(notifikasi);
		$scope.notifikasi = notifikasi;
		if(notifikasi.status_dibaca === "0") {
			var formData = {id_notif : $scope.notifikasi.id_notif};
			notifikasiService.Update(formData).then(handleSuccess);
		}else{
			var params = {'id_kegiatan':$scope.notifikasi.id_kegiatan};
			$state.go("notifikasiKegiatan",params);
		}
	}

	function handleSuccess(response){
		$log.log(response);
		var params = {'id_kegiatan':$scope.notifikasi.id_kegiatan};
		$state.go("notifikasiKegiatan",params);
	}
})

.controller('pengaturanListCtrl', function($scope, $stateParams,ionicMaterialInk,$window,$ionicHistory,
	$cordovaImagePicker,$log,$cordovaFileTransfer,$http,$ionicPlatform,$cordovaCamera,ionicToast,userService) {
	ionicMaterialInk.displayEffect();
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

  	$scope.goBack= goBack;
  	$scope.edit = edit;
  	$scope.dataUser = undefined;

	$scope.$on( "$ionicView.enter", function(event) {
		$scope.data = {};
		if($window.localStorage['hak_akses'] === '4'){
			$scope.url = 'http://192.168.43.24/reminder/model/user/editPanitia';
		}else{
			$scope.url = 'http://192.168.43.24/reminder/model/user/editUser';
		}
		userService.GetEditForm($window.localStorage['session']).then(fillData,handleError);
		$scope.targetPath = undefined;
		$scope.filename = undefined;
	});

  	$scope.cameraPicture = function(){
		$ionicPlatform.ready(function() {
			var options = {
	        quality: 100,
	        destinationType: Camera.DestinationType.FILE_URL,
	        sourceType: Camera.PictureSourceType.CAMERA,
	        encodingType: Camera.EncodingType.JPEG,
	        allowEdit: true,
	        targetWidth: 810,
      		targetHeight: 1080
	      	};

	      	$cordovaCamera.getPicture(options).then(function(imageData) {
		      $scope.targetPath = imageData;
	          $scope.filename = $scope.targetPath.split("/").pop();
		    }, function(err) {
		      // error
		      $scope.showToast("kamera error");
		    });

		});
	}

	$scope.addPicture = function(){
		$ionicPlatform.ready(function() {
			$log.log("add Picture");
			var options = {
			   maximumImagesCount: 1,
			   width: 810,
			   height: 1080,
			   quality: 100
		  	};

		  	$cordovaImagePicker.getPictures(options)
		    .then(function (results) {
		      for (var i = 0; i < results.length; i++) {
		        console.log('Image URI: ' + results[i]);
		        $scope.targetPath = results[i];
	            $scope.filename = $scope.targetPath.split("/").pop();
		      }
		    }, function(error) {
		      	$scope.showToast("error memilih gambar dari gallery");
		    });
		});
	}

	//todo cek akses
	function goBack(){	
    	$ionicHistory.goBack()	
	} 

  	function edit(){
  		$log.log($scope.data);
  		if($scope.targetPath !== undefined && $scope.filename!== undefined){
			// with image
			$ionicPlatform.ready(function() {
				$log.log("kirim Evaluasi")
				var options_tosend = {
			           fileKey: "file",
			           fileName: $scope.filename,
			           chunkedMode: false,
			           mimeType: "image/jpg",
			           params: {
			           		'id' : $window.localStorage['session'],
			    			'email' : $scope.data.email,
			        		'password' : $scope.data.password,
			        		'nama' : $scope.data.nama,
			        		'handphone': $scope.data.handphone
			    		}
			        };
		           $cordovaFileTransfer.upload($scope.url, $scope.targetPath, options_tosend).then(function (result) {
		                var obj = JSON.parse(result.response);
		    	    	$scope.targetPath = undefined;
		           		$scope.filename = undefined;
		           		$scope.data = {};
	    				$scope.goBack();
		                $scope.showToast(obj.success);
		            }, function(err) {
		            	var obj = JSON.parse(result.response);
				        $scope.showToast(obj.error);
				    }, function (progress) {
				        // constant progress updates
				    });	
				});
		}else{
			// post evaluasi
			var params = {
							'id' : $window.localStorage['session'],
			    			'email' : $scope.data.email,
			        		'password' : $scope.data.password,
			        		'nama' : $scope.data.nama,
			        		'handphone' : $scope.data.handphone
			    		};
			$http.post($scope.url,params)
			.then(function(result){
					$log.log(result)
					$scope.data = {};
	   				$scope.goBack();
					$scope.showToast(result.data.success);
				},function(result){
					$log.log(result)
					$scope.showToast(result.data.error);
			});
		}
  	}

  	function handleError(response){
  		$scope.showToast(response.data.error);
  	}

  	function fillData(response){
  		$log.log(response.data);
  		$scope.dataUser = response.data;
		$scope.data.email = $scope.dataUser.email_user;
		$scope.data.password = null;
		$scope.data.nama = $scope.dataUser.nama_user;
		$scope.data.handphone = $scope.dataUser.no_handphone;
  	}
})

.controller('addUserCtrl', function($scope, $stateParams,ionicMaterialInk,$window,$ionicHistory,
	$cordovaImagePicker,$log,$cordovaFileTransfer,$http,$ionicPlatform,$cordovaCamera,ionicToast) {
	ionicMaterialInk.displayEffect();
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};
	$scope.url = 'http://192.168.43.24/reminder/model/user/newuser';
  	$scope.listAkses = listAkses;
  	$scope.goBack= goBack;
  	$scope.tambah = tambah;

	$scope.$on( "$ionicView.enter", function(event) {
		$scope.data = {};
		$scope.akses = undefined;
		$scope.listAkses();
		$scope.targetPath = undefined;
		$scope.filename = undefined;
	});

  	$scope.cameraPicture = function(){
		$ionicPlatform.ready(function() {
			var options = {
	        quality: 100,
	        destinationType: Camera.DestinationType.FILE_URL,
	        sourceType: Camera.PictureSourceType.CAMERA,
	        encodingType: Camera.EncodingType.JPEG,
	        allowEdit: true,
	        targetWidth: 810,
      		targetHeight: 1080
	      	};

	      	$cordovaCamera.getPicture(options).then(function(imageData) {
		      $scope.targetPath = imageData;
	          $scope.filename = $scope.targetPath.split("/").pop();
		    }, function(err) {
		      // error
		      $scope.showToast("kamera error");
		    });

		});
	}

	$scope.addPicture = function(){
		$ionicPlatform.ready(function() {
			$log.log("add Picture");
			var options = {
			   maximumImagesCount: 1,
			   width: 810,
			   height: 1080,
			   quality: 100
		  	};

		  	$cordovaImagePicker.getPictures(options)
		    .then(function (results) {
		      for (var i = 0; i < results.length; i++) {
		        console.log('Image URI: ' + results[i]);
		        $scope.targetPath = results[i];
	            $scope.filename = $scope.targetPath.split("/").pop();
		      }
		    }, function(error) {
		      	$scope.showToast("error memilih gambar dari gallery");
		    });
		});
	}

	//todo cek akses
	function goBack(){	
    	$ionicHistory.goBack()	
	} 

  	function listAkses(){
  		switch($window.localStorage['hak_akses']){
  			case '0':
  			$scope.akses = [
  				{akses: 'Admin',value:'1'},
  				{akses: 'Senat',value:'2'},
  				{akses: 'Balma',value:'3'}
  			];
  			break;
  			case '1':
  			$scope.akses = [
				{akses: 'Senat',value:'2'},
  				{akses: 'Balma',value:'3'}
  			];
  			break;
  		}

  		switch($stateParams.kategori){
  			case 'admin':
  			  	$scope.data.kategori = {akses: 'Admin',value:'1'};
  			break;
  			case 'senat':
  				$scope.data.kategori = {akses: 'Senat',value:'2'};
  			break;
  			case 'balma':
 	 			$scope.data.kategori = {akses: 'Balma',value:'3'};
  			break;
  		}  		
  	}

  	function tambah(){
  		$log.log($scope.data);
  		if($scope.targetPath !== undefined && $scope.filename!== undefined){
			// with image
			$ionicPlatform.ready(function() {
				$log.log("kirim Evaluasi")
				var options_tosend = {
			           fileKey: "file",
			           fileName: $scope.filename,
			           chunkedMode: false,
			           mimeType: "image/jpg",
			           params: {
			    			'email' : $scope.data.email,
			        		'password' : $scope.data.password,
			        		'nama' : $scope.data.nama,
			        		'handphone': $scope.data.handphone,
			        		'hakakses' : $scope.data.kategori.value
			    		}
			        };
		           $cordovaFileTransfer.upload($scope.url, $scope.targetPath, options_tosend).then(function (result) {
		                $log.log(result);
		    	    	$scope.targetPath = undefined;
		           		$scope.filename = undefined;
		           		var obj = JSON.parse(result.response);
		           		$scope.data = {};
	   					$scope.goBack();
		                $scope.showToast(obj.success);
		            }, function(err) {
		            	var obj = JSON.parse(result.response);
				        $scope.showToast(obj.error);
				    }, function (progress) {
				        // constant progress updates
				    });	
				});
		}else{
			// post evaluasi
			var params = {
			    			'email' : $scope.data.email,
			        		'password' : $scope.data.password,
			        		'nama' : $scope.data.nama,
			        		'handphone' : $scope.data.handphone,
			        		'hakakses' : $scope.data.kategori.value
			    		};
			$http.post($scope.url,params)
			.then(function(result){
					$log.log(result)
					$scope.data = {};
	    			$scope.goBack();
					$scope.showToast(result.data.success);
				},function(result){
					$log.log(result)
					$scope.showToast(result.data.error);
			});
		}
  	}
})

.controller('editUserCtrl', function($scope, $stateParams,ionicMaterialInk,$window,$ionicHistory,
	$cordovaImagePicker,$log,$cordovaFileTransfer,$http,$ionicPlatform,$cordovaCamera,ionicToast,userService) {
	ionicMaterialInk.displayEffect();
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.url = 'http://192.168.43.24/reminder/model/user/editUser';
  	$scope.listAkses = listAkses;
  	$scope.goBack= goBack;
  	$scope.edit = edit;
  	$scope.dataUser = undefined;

	$scope.$on( "$ionicView.enter", function(event) {
		$scope.data = {};
		$scope.akses = undefined;
		userService.GetEditForm($stateParams.id).then(fillData,handleError);
		$scope.listAkses();
		$scope.targetPath = undefined;
		$scope.filename = undefined;

	});

  	$scope.cameraPicture = function(){
		$ionicPlatform.ready(function() {
			var options = {
	        quality: 100,
	        destinationType: Camera.DestinationType.FILE_URL,
	        sourceType: Camera.PictureSourceType.CAMERA,
	        encodingType: Camera.EncodingType.JPEG,
	        allowEdit: true,
	        targetWidth: 810,
      		targetHeight: 1080
	      	};

	      	$cordovaCamera.getPicture(options).then(function(imageData) {
		      $scope.targetPath = imageData;
	          $scope.filename = $scope.targetPath.split("/").pop();
		    }, function(err) {
		      // error
		      $scope.showToast("kamera error");
		    });

		});
	}

	$scope.addPicture = function(){
		$ionicPlatform.ready(function() {
			$log.log("add Picture");
			var options = {
			   maximumImagesCount: 1,
			   width: 810,
			   height: 1080,
			   quality: 100
		  	};

		  	$cordovaImagePicker.getPictures(options)
		    .then(function (results) {
		      for (var i = 0; i < results.length; i++) {
		        console.log('Image URI: ' + results[i]);
		        $scope.targetPath = results[i];
	            $scope.filename = $scope.targetPath.split("/").pop();
		      }
		    }, function(error) {
		      	$scope.showToast("error memilih gambar dari gallery");
		    });
		});
	}

	//todo cek akses
	function goBack(){	
    	$ionicHistory.goBack()	
	} 

  	function listAkses(){
  		switch($window.localStorage['hak_akses']){
  			case '0':
  			$scope.akses = [
  				{akses: 'Admin',value:'1'},
  				{akses: 'Senat',value:'2'},
  				{akses: 'Balma',value:'3'}
  			];
  			break;
  			case '1':
  			$scope.akses = [
				{akses: 'Senat',value:'2'},
  				{akses: 'Balma',value:'3'}
  			];
  			break;
  		}
  	}

  	function edit(){
  		$log.log($scope.data);
  		if($scope.targetPath !== undefined && $scope.filename!== undefined){
			// with image
			$ionicPlatform.ready(function() {
				$log.log("kirim Evaluasi")
				var options_tosend = {
			           fileKey: "file",
			           fileName: $scope.filename,
			           chunkedMode: false,
			           mimeType: "image/jpg",
			           params: {
			           		'id' : $stateParams.id,
			    			'email' : $scope.data.email,
			        		'password' : $scope.data.password,
			        		'nama' : $scope.data.nama,
			        		'handphone': $scope.data.handphone,
			        		'hakakses' : $scope.data.kategori.value
			    		}
			        };
		           $cordovaFileTransfer.upload($scope.url, $scope.targetPath, options_tosend).then(function (result) {
		                var obj = JSON.parse(result.response);
		    	    	$scope.targetPath = undefined;
		           		$scope.filename = undefined;
		           		$scope.data = {};
	    				$scope.goBack();
		                $scope.showToast(obj.success);
		            }, function(err) {
		            	var obj = JSON.parse(result.response);
				        $scope.showToast(obj.error);
				    }, function (progress) {
				        // constant progress updates
				    });	
				});
		}else{
			// post evaluasi
			var params = {
							'id' : $stateParams.id,
			    			'email' : $scope.data.email,
			        		'password' : $scope.data.password,
			        		'nama' : $scope.data.nama,
			        		'handphone' : $scope.data.handphone,
			        		'hakakses' : $scope.data.kategori.value
			    		};
			$http.post($scope.url,params)
			.then(function(result){
					$log.log(result)
					$scope.data = {};
	   				$scope.goBack();
					$scope.showToast(result.data.success);
				},function(result){
					$log.log(result)
					$scope.showToast(result.data.error);
			});
		}
  	}

  	function handleError(response){
  		$scope.showToast(response.data.error);
  	}

  	function fillData(response){
  		$log.log(response.data);
  		$scope.dataUser = response.data;
		$scope.data.email = $scope.dataUser.email_user;
		$scope.data.password = null;
		$scope.data.nama = $scope.dataUser.nama_user;
		$scope.data.handphone = $scope.dataUser.no_handphone;
  		switch($scope.dataUser.hak_akses){
  			case '1':
  			  	$scope.data.kategori = {akses: 'Admin',value:'1'};
  			break;
  			case '2':
  				$scope.data.kategori = {akses: 'Senat',value:'2'};
  			break;
  			case '3':
 	 			$scope.data.kategori = {akses: 'Balma',value:'3'};
  			break;
  		}
  	}
})

.controller('addPanitiaCtrl', function($scope, $stateParams,ionicMaterialInk,$window,$ionicHistory,
	$cordovaImagePicker,$log,$cordovaFileTransfer,$http,$ionicPlatform,$cordovaCamera,ionicToast) {
	ionicMaterialInk.displayEffect();
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};
	$scope.url = 'http://192.168.43.24/reminder/model/user/newuser';
  	$scope.goBack= goBack;
  	$scope.tambah = tambah;

	$scope.$on( "$ionicView.enter", function(event) {
		$scope.data = {};
		$scope.targetPath = undefined;
		$scope.filename = undefined;
	});

  	$scope.cameraPicture = function(){
		$ionicPlatform.ready(function() {
			var options = {
	        quality: 100,
	        destinationType: Camera.DestinationType.FILE_URL,
	        sourceType: Camera.PictureSourceType.CAMERA,
	        encodingType: Camera.EncodingType.JPEG,
	        allowEdit: true,
	        targetWidth: 810,
      		targetHeight: 1080
	      	};

	      	$cordovaCamera.getPicture(options).then(function(imageData) {
		      $scope.targetPath = imageData;
	          $scope.filename = $scope.targetPath.split("/").pop();
		    }, function(err) {
		      // error
		      $scope.showToast("kamera error");
		    });

		});
	}

	$scope.addPicture = function(){
		$ionicPlatform.ready(function() {
			$log.log("add Picture");
			var options = {
			   maximumImagesCount: 1,
			   width: 810,
			   height: 1080,
			   quality: 100
		  	};

		  	$cordovaImagePicker.getPictures(options)
		    .then(function (results) {
		      for (var i = 0; i < results.length; i++) {
		        console.log('Image URI: ' + results[i]);
		        $scope.targetPath = results[i];
	            $scope.filename = $scope.targetPath.split("/").pop();
		      }
		    }, function(error) {
		      	$scope.showToast("error memilih gambar dari gallery");
		    });
		});
	}

	//todo cek akses
	function goBack(){	
    	$ionicHistory.goBack()	
	} 

  	function tambah(){
  		$log.log($scope.data);
  		if($scope.targetPath !== undefined && $scope.filename!== undefined){
			// with image
			$ionicPlatform.ready(function() {
				$log.log("kirim Evaluasi")
				var options_tosend = {
			           fileKey: "file",
			           fileName: $scope.filename,
			           chunkedMode: false,
			           mimeType: "image/jpg",
			           params: {
			    			'email' : $scope.data.email,
			        		'password' : $scope.data.password,
			        		'nama' : $scope.data.nama,
			        		'handphone': $scope.data.handphone,
			        		'hakakses' : '4',
			        		'nim' : $scope.data.nim
			    		}
			        };
		           $cordovaFileTransfer.upload($scope.url, $scope.targetPath, options_tosend).then(function (result) {
		                $log.log(result);
		    	    	$scope.targetPath = undefined;
		           		$scope.filename = undefined;
		           		var obj = JSON.parse(result.response);
		           		$scope.data = {};
	   					$scope.goBack();
		                $scope.showToast(obj.success);
		            }, function(err) {
		            	var obj = JSON.parse(result.response);
				        $scope.showToast(obj.error);
				    }, function (progress) {
				        // constant progress updates
				    });	
				});
		}else{
			// post evaluasi
			var params = {
			    			'email' : $scope.data.email,
			        		'password' : $scope.data.password,
			        		'nama' : $scope.data.nama,
			        		'handphone' : $scope.data.handphone,
			        		'hakakses' : '4',
			        		'nim' : $scope.data.nim
			    		};
			$http.post($scope.url,params)
			.then(function(result){
					$log.log(result)
					$scope.data = {};
	    			$scope.goBack();
					$scope.showToast(result.data.success);
				},function(result){
					$log.log(result)
					$scope.showToast(result.data.error);
			});
		}
  	}
})


.controller('editPanitiaCtrl', function($scope, $stateParams,ionicMaterialInk,$window,$ionicHistory,
	$cordovaImagePicker,$log,$cordovaFileTransfer,$http,$ionicPlatform,$cordovaCamera,ionicToast,panitiaService) {
	ionicMaterialInk.displayEffect();
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};

	$scope.url = 'http://192.168.43.24/reminder/model/panitia/editPanitia';
  	$scope.goBack= goBack;
  	$scope.edit = edit;
  	$scope.dataUser = undefined;

	$scope.$on( "$ionicView.enter", function(event) {
		$scope.data = {};
		panitiaService.GetEditForm($stateParams.id).then(fillData,handleError);
		$scope.targetPath = undefined;
		$scope.filename = undefined;
		$scope.akses = true;

	});

  	$scope.cameraPicture = function(){
		$ionicPlatform.ready(function() {
			var options = {
	        quality: 100,
	        destinationType: Camera.DestinationType.FILE_URL,
	        sourceType: Camera.PictureSourceType.CAMERA,
	        encodingType: Camera.EncodingType.JPEG,
	        allowEdit: true,
	        targetWidth: 810,
      		targetHeight: 1080
	      	};

	      	$cordovaCamera.getPicture(options).then(function(imageData) {
		      $scope.targetPath = imageData;
	          $scope.filename = $scope.targetPath.split("/").pop();
		    }, function(err) {
		      // error
		      $scope.showToast("kamera error");
		    });

		});
	}

	$scope.addPicture = function(){
		$ionicPlatform.ready(function() {
			$log.log("add Picture");
			var options = {
			   maximumImagesCount: 1,
			   width: 810,
			   height: 1080,
			   quality: 100
		  	};

		  	$cordovaImagePicker.getPictures(options)
		    .then(function (results) {
		      for (var i = 0; i < results.length; i++) {
		        console.log('Image URI: ' + results[i]);
		        $scope.targetPath = results[i];
	            $scope.filename = $scope.targetPath.split("/").pop();
		      }
		    }, function(error) {
		      	$scope.showToast("error memilih gambar dari gallery");
		    });
		});
	}

	//todo cek akses
	function goBack(){	
    	$ionicHistory.goBack()	
	} 

  	function edit(akses){
  		$log.log($scope.data);
  		$scope.data.hak_akses = akses ? '4' : '5';
  		if($scope.targetPath !== undefined && $scope.filename!== undefined){
			// with image
			$ionicPlatform.ready(function() {
				$log.log("kirim Evaluasi")
				var options_tosend = {
			           fileKey: "file",
			           fileName: $scope.filename,
			           chunkedMode: false,
			           mimeType: "image/jpg",
			           params: {
			           		'id' : $stateParams.id,
			    			'email' : $scope.data.email,
			        		'password' : $scope.data.password,
			        		'nama' : $scope.data.nama,
			        		'handphone': $scope.data.handphone,
			        		'hakakses' : $scope.data.hak_akses,
			        		'nim' : $scope.data.nim
			    		}
			        };
		           $cordovaFileTransfer.upload($scope.url, $scope.targetPath, options_tosend).then(function (result) {
		                var obj = JSON.parse(result.response);
		    	    	$scope.targetPath = undefined;
		           		$scope.filename = undefined;
		           		$scope.data = {};
	    				$scope.goBack();
		                $scope.showToast(obj.success);
		            }, function(err) {
		            	var obj = JSON.parse(result.response);
				        $scope.showToast(obj.error);
				    }, function (progress) {
				        // constant progress updates
				    });	
				});
		}else{
			// post evaluasi
			var params = {
							'id' : $stateParams.id,
			    			'email' : $scope.data.email,
			        		'password' : $scope.data.password,
			        		'nama' : $scope.data.nama,
			        		'handphone' : $scope.data.handphone,
			        		'hakakses' : $scope.data.hak_akses,
			        		'nim' : $scope.data.nim
			    		};
			$http.post($scope.url,params)
			.then(function(result){
					$log.log(result)
					$scope.data = {};
	   				$scope.goBack();
					$scope.showToast(result.data.success);
				},function(result){
					$log.log(result)
					$scope.showToast(result.data.error);
			});
		}
  	}

  	function handleError(response){
  		$scope.showToast(response.data.error);
  	}

  	function fillData(response){
  		$log.log(response.data);
  		$scope.dataUser = response.data;
		$scope.data.email = $scope.dataUser.email_user;
		$scope.data.password = null;
		$scope.data.nama = $scope.dataUser.nama_user;
		$scope.data.handphone = $scope.dataUser.no_handphone;
		$scope.data.nim = $scope.dataUser.nim;
  		switch($scope.dataUser.hak_akses){
  			case '4':
  			  	$scope.akses = true;
  			  	$scope.data.hak_akses = $scope.dataUser.hak_akses;
  			break;
  			case '5':
  			  	$scope.akses = false;
  			  	$scope.data.hak_akses = $scope.dataUser.hak_akses;
  			break;
  		}
  	}
})

.controller('addOrmawaCtrl', function($scope, $stateParams,ionicMaterialInk,$window,$ionicHistory,
	$cordovaImagePicker,$log,$cordovaFileTransfer,$http,$ionicPlatform,ionicToast) {
	ionicMaterialInk.displayEffect();
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};
	$scope.url = 'http://192.168.43.24/reminder/model/ukm/newukm';
  	$scope.goBack= goBack;
  	$scope.tambah = tambah;

	$scope.$on( "$ionicView.enter", function(event) {
		$scope.data = {};
		$scope.targetPath = undefined;
		$scope.filename = undefined;
	});


	$scope.addPicture = function(){
		$ionicPlatform.ready(function() {
			$log.log("add Picture");
			var options = {
			   maximumImagesCount: 1,
			   width: 810,
			   height: 1080,
			   quality: 100
		  	};

		  	$cordovaImagePicker.getPictures(options)
		    .then(function (results) {
		      for (var i = 0; i < results.length; i++) {
		        console.log('Image URI: ' + results[i]);
		        $scope.targetPath = results[i];
	            $scope.filename = $scope.targetPath.split("/").pop();
		      }
		    }, function(error) {
		      	$scope.showToast("error memilih gambar dari gallery");
		    });
		});
	}

	//todo cek akses
	function goBack(){	
    	$ionicHistory.goBack()	
	} 

  	function tambah(){
  		$log.log($scope.data);
  		if($scope.targetPath !== undefined && $scope.filename!== undefined){
			// with image
			$ionicPlatform.ready(function() {
				var options_tosend = {
			           fileKey: "file",
			           fileName: $scope.filename,
			           chunkedMode: false,
			           mimeType: "image/jpg",
			           params: {
			           		'nama_ukm' : $scope.data.nama
			    		}
			        };
		           $cordovaFileTransfer.upload($scope.url, $scope.targetPath, options_tosend).then(function (result) {
		                $log.log(result);
		    	    	$scope.targetPath = undefined;
		           		$scope.filename = undefined;
		           		var obj = JSON.parse(result.response);
		           		$scope.data = {};
	   					$scope.goBack();
		                $scope.showToast(obj.success);
		            }, function(err) {
		            	var obj = JSON.parse(result.response);
				        $scope.showToast(obj.error);
				    }, function (progress) {
				        // constant progress updates
				    });	
				});
		}else{
			// post evaluasi
			var params = {
							'nama_ukm' : $scope.data.nama
			    		};
			$http.post($scope.url,params)
			.then(function(result){
					$log.log(result)
					$scope.data = {};
	    			$scope.goBack();
					$scope.showToast(result.data.success);
				},function(result){
					$log.log(result)
					$scope.showToast(result.data.error);
			});
		}
  	}
})

.controller('editOrmawaCtrl', function($scope, $stateParams,ionicMaterialInk,$window,$ionicHistory,
	$cordovaImagePicker,$log,$cordovaFileTransfer,$http,$ionicPlatform,$cordovaCamera,ionicToast,ukmService) {
	ionicMaterialInk.displayEffect();
	$scope.showToast = function(message){
  	ionicToast.show(message, 'bottom', false, 2000);
	};
	$scope.url = 'http://192.168.43.24/reminder/model/ukm/editUkm';
  	$scope.goBack= goBack;
  	$scope.edit = edit;
  	$scope.dataUkm = {};

	$scope.$on( "$ionicView.enter", function(event) {
		$scope.data = {};
		$scope.targetPath = undefined;
		$scope.filename = undefined;
		ukmService.SelectOne($stateParams.id).then(fillData,handleError);
	});

	$scope.addPicture = function(){
		$ionicPlatform.ready(function() {
			$log.log("add Picture");
			var options = {
			   maximumImagesCount: 1,
			   width: 810,
			   height: 1080,
			   quality: 100
		  	};

		  	$cordovaImagePicker.getPictures(options)
		    .then(function (results) {
		      for (var i = 0; i < results.length; i++) {
		        console.log('Image URI: ' + results[i]);
		        $scope.targetPath = results[i];
	            $scope.filename = $scope.targetPath.split("/").pop();
		      }
		    }, function(error) {
		      	$scope.showToast("error memilih gambar dari gallery");
		    });
		});
	}

	//todo cek akses
	function goBack(){	
    	$ionicHistory.goBack()	
	} 

  	function edit(){
  		$log.log($scope.data);
  		if($scope.targetPath !== undefined && $scope.filename!== undefined){
			// with image
			$ionicPlatform.ready(function() {
				var options_tosend = {
			           fileKey: "file",
			           fileName: $scope.filename,
			           chunkedMode: false,
			           mimeType: "image/jpg",
			           params: {
			           		'id_ukm' : $stateParams.id,
							'nama_ukm' : $scope.data.nama
			    		}
			        };
		           $cordovaFileTransfer.upload($scope.url, $scope.targetPath, options_tosend).then(function (result) {
		                $log.log(result);
		    	    	$scope.targetPath = undefined;
		           		$scope.filename = undefined;
		           		var obj = JSON.parse(result.response);
		           		$scope.data = {};
	   					$scope.goBack();
		                $scope.showToast(obj.success);
		            }, function(err) {
		            	var obj = JSON.parse(result.response);
				        $scope.showToast(obj.error);
				    }, function (progress) {
				        // constant progress updates
				    });	
				});
		}else{
			// post evaluasi
			var params = {
							'id_ukm' : $stateParams.id,
							'nama_ukm' : $scope.data.nama
			    		};
			$http.post($scope.url,params)
			.then(function(result){
					$log.log(result)
					$scope.data = {};
	    			$scope.goBack();
					$scope.showToast(result.data.success);
				},function(result){
					$log.log(result)
					$scope.showToast(result.data.error);
			});
		}
  	}

  	function handleError(response){
  		$scope.showToast(response.data.error);
  	}

  	function fillData(response){
  		$log.log(response);
  		$scope.dataUkm = response;
  		$scope.data.nama = $scope.dataUkm.nama_ukm;
  	}
})

.controller('inkCtrl', function($scope, $stateParams,ionicMaterialInk) {
	ionicMaterialInk.displayEffect();

})