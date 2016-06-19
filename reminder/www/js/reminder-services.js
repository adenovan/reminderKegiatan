angular
	.module('reminder.services',[]);

angular.module('reminder.services').factory('loginService', ['$http','$log',
	function($http,$log){
		var service = {};
		service.login = login;
		return service;

		function login(formdata){
			return $http.post('http://192.168.43.24/reminder/model/user/login',formdata).then(handleSuccess);
		}

		function handleSuccess(response){
			$log.log(response);
			return response;
		}
	}
]);

angular.module('reminder.services').factory('userService', ['$http', 
	function($http){
	var service = {};

	service.GetBoxById = GetBoxById;
	service.GetById = GetById;
	service.GetAdmin = GetAdmin;
	service.GetSenat = GetSenat;
	service.GetBalma = GetBalma;
	service.CariAdmin = CariAdmin;
	service.CariSenat = CariSenat;
	service.CariBalma = CariBalma;
	service.GetEditForm = GetEditForm;
	service.Create = Create;
	service.Update = Update;
	service.Delete = Delete;
	service.Logout = Logout;

	return service;

	function GetBoxById(id){
		return $http.get('http://192.168.43.24/reminder/model/user/getBoxInfo/'+id).then(handleSuccess,handleError);
	}

	function GetById(id){
		return $http.get('http://192.168.43.24/reminder/model/user/index/'+id).then(handleSuccess,handleError);
	}

	function GetEditForm(id){
		return $http.get('http://192.168.43.24/reminder/model/user/index/'+id+'/id_user,email_user,nama_user,no_handphone,hak_akses')
		.then(handleSuccess,handleError);
	}

	function GetAdmin(){
		return $http.get('http://192.168.43.24/reminder/model/user/indexAdmin').then(handleSuccess,handleError);
	}

	function GetSenat(){
		return $http.get('http://192.168.43.24/reminder/model/user/indexSenat').then(handleSuccess,handleError);
	}

	function GetBalma(){
		return $http.get('http://192.168.43.24/reminder/model/user/indexBalma').then(handleSuccess,handleError);
	}

	function CariAdmin(search){
		return $http.get('http://192.168.43.24/reminder/model/user/cariAdmin/'+search).then(handleSuccess);
	}

	function CariSenat(search){
		return $http.get('http://192.168.43.24/reminder/model/user/cariSenat/'+search).then(handleSuccess);
	}

	function CariBalma(search){
		return $http.get('http://192.168.43.24/reminder/model/user/cariBalma/'+search).then(handleSuccess);
	}

	function Create(formdata){
		return $http.post('http://192.168.43.24/reminder/model/user/newuser',formdata).then(handleSuccess);
	}

	function Update(formdata){
		return $http.post('http://192.168.43.24/reminder/model/user/edituser',formdata).then(handleSuccess);
	}

	function Delete(formdata){
		return $http.post('http://192.168.43.24/reminder/model/user/deleteuser',formdata).then(handleSuccess);
	}

	function Logout(){
		return $http.get('http://192.168.43.24/reminder/model/user/logout').then(handleSuccess,handleError);
	}

	function handleSuccess(response){
		return response;
	}

	function handleError(response){
		return response;
	}
}]);

angular.module('reminder.services').factory('kegiatanService', ['$http', 
	function($http){

	var service ={};
	service.SelectOne = SelectOne;
	service.SelectAll = SelectAll;
	service.SelectEditAll = SelectEditAll;
	service.SelectEditOne = SelectEditOne;
	service.GetAll = GetAll;
	service.GetAllOffset = GetAllOffset;
	service.GetAllLimit = GetAllLimit;
	service.GetAllKegiatanPanitia = GetAllKegiatanPanitia;
	service.GetAllOffsetKegiatanPanitia = GetAllOffsetKegiatanPanitia;
	service.GetById = GetById;
	service.Search = Search;
	service.Create = Create;
	service.Update = Update;
	service.Delete = Delete;

	return service;

	function SelectOne(id){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/selectOne/'+id).then(handleSuccess,handleError);
	}

	function SelectAll(){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/selectAll').then(handleSuccess);
	}

	function SelectEditAll(id){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/selectEditAll/'+id).then(handleSuccess);
	}


	function SelectEditOne(id){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/selectEditOne/'+id).then(handleSuccess);
	}

	function GetById(id){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/index/'+id).then(handleSuccess,handleError);
	}

	function GetAll(){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/indexAll').then(handleSuccess,handleError);
	}

	function GetAllLimit(limit){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/indexAll/'+limit).then(handleSuccess,handleError);
	}

	function GetAllOffset(limit,offset){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/indexAll/'+limit+'/'+offset).then(handleSuccess,handleError);
	}

	function GetAllKegiatanPanitia(id){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/kegiatanPanitia/'+id).then(handleSuccess);
	}

	function GetAllOffsetKegiatanPanitia(offset){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/kegiatanPanitia/'+offset).then(handleSuccess,handleError);
	}

	function Search(question){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/cariKegiatan/'+question).then(handleSuccess);
	}

	function Create(formdata){
		return $http.post('http://192.168.43.24/reminder/model/kegiatan/newKegiatan',formdata).then(handleSuccess);
	}

	function Update(formdata){
		return $http.post('http://192.168.43.24/reminder/model/kegiatan/editKegiatan',formdata).then(handleSuccess);
	}

	function Delete(formdata){
		return $http.post('http://192.168.43.24/reminder/model/kegiatan/deleteKegiatan',formdata).then(handleSuccess);
	}

	function handleSuccess(response){
		return response;
	}

	function handleError(response){
		return response;
	}
}]);

angular.module('reminder.services').factory('panitiaService', ['$http', 
	function($http){
	var service ={};
	service.SelectAll = SelectAll;
	service.SelectOne = SelectOne;
	service.GetAll = GetAll;
	service.GetAktif = GetAktif;
	service.GetTidakAktif = GetTidakAktif;
	service.CariAktif = CariAktif;
	service.CariTidakAktif = CariTidakAktif;
	service.GetById = GetById;
	service.Create = Create;
	service.Update = Update;
	service.Delete = Delete;
	service.GetEditForm = GetEditForm;

	return service;

	function SelectAll(){
		return $http.get('http://192.168.43.24/reminder/model/panitia/indexAllAktif/id_user,nama_user').then(handleSuccess);
	}

	function SelectOne(id){
		return $http.get('http://192.168.43.24/reminder/model/panitia/index/'+id+'/id_user,nama_user').then(handleSuccess);
	}

	function GetById(id){
		return $http.get('http://192.168.43.24/reminder/model/panitia/index/'+id+'/nama_user,email_user,no_handphone,nim,foto_user').then(handleSuccess);
	}

	function GetEditForm(id){
		return $http.get('http://192.168.43.24/reminder/model/panitia/index/'+id+'/nama_user,email_user,no_handphone,nim,hak_akses').then(handleSuccess,handleError);
	}

	function GetAll(){
		return $http.get('http://192.168.43.24/reminder/model/panitia/indexAll').then(handleSuccess,handleError);
	}

	function GetAktif(){
		return $http.get('http://192.168.43.24/reminder/model/panitia/indexAllAktif').then(handleSuccess);
	}

	function GetTidakAktif(){
		return $http.get('http://192.168.43.24/reminder/model/panitia/indexAllTidakAktif').then(handleSuccess);
	}

	function CariAktif(search){
		return $http.get('http://192.168.43.24/reminder/model/panitia/cariPanitiaAktif/'+search)
		.then(handleSuccess);
	}

	function CariTidakAktif(search){
		return $http.get('http://192.168.43.24/reminder/model/panitia/cariPanitiaTidakAktif/'+search)
		.then(handleSuccess);
	}

	function Create(formdata){
		return $http.post('http://192.168.43.24/reminder/model/panitia/newPanitia',formdata).then(handleSuccess,handleError);
	}

	function Update(formdata){
		return $http.post('http://192.168.43.24/reminder/model/panitia/editPanitia',formdata).then(handleSuccess,handleError);
	}

	function Delete(formdata){
		return $http.post('http://192.168.43.24/reminder/model/panitia/deletepanitia',formdata).then(handleSuccess,handleError);
	}

	function handleSuccess(response){
		return response;
	}

	function handleError(response){
		return response;
	}
}]);

angular.module('reminder.services').factory('evaluasiService', ['$http', 
	function($http){
	var service = {};

	service.GetAll = GetAll;
	service.GetLast = GetLast;
	service.Create = Create;
	service.Delete = Delete;

	return service;

	function GetAll(id){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/indexEvaluasi/'+id).then(handleSuccess);
	}

	function GetLast(id){
		return $http.get('http://192.168.43.24/reminder/model/kegiatan/indexLastEvaluasi/'+id).then(handleSuccess);
	}
	function Create(formdata){
		return $http.post('http://192.168.43.24/reminder/model/kegiatan/newEvaluasi',formdata).then(handleSuccess);
	}

	function Delete(formdata){
		return $http.post('http://192.168.43.24/reminder/model/kegiatan/deleteEvaluasi',formdata).then(handleSuccess);
	}

	function handleSuccess(response){
		return response;
	}
}]);

angular.module('reminder.services').factory('ukmService', ['$http', 
	function($http){
	var service ={};
	service.SelectAll = SelectAll;
	service.SelectOne = SelectOne;
	service.GetAll = GetAll;
	service.GetById = GetById;
	service.Create = Create;
	service.Update = Update;
	service.Delete = Delete;
	service.Cari = Cari;

	return service;

	function SelectAll(){
		return $http.get('http://192.168.43.24/reminder/model/ukm/indexAll/nama_ukm,id_ukm').then(handleSuccess,handleError);
	}

	function SelectOne(id){
		return $http.get('http://192.168.43.24/reminder/model/ukm/index/'+id+'/id_ukm,nama_ukm').then(handleSuccess,handleError);
	}

	function Cari(search){
		return $http.get('http://192.168.43.24/reminder/model/ukm/cariUkm/'+search).then(handleSuccess);
	}

	function GetById(id){
		return $http.get('http://192.168.43.24/reminder/model/ukm/index/'+id).then(handleSuccess,handleError);
	}

	function GetAll(){
		return $http.get('http://192.168.43.24/reminder/model/ukm/indexAll/').then(handleSuccess);
	}

	function Create(formdata){
		return $http.post('http://192.168.43.24/reminder/model/ukm/newukm',formdata).then(handleSuccess,handleError);
	}

	function Update(formdata){
		return $http.post('http://192.168.43.24/reminder/model/ukm/editUkm',formdata).then(handleSuccess,handleError);
	}

	function Delete(formdata){
		return $http.post('http://192.168.43.24/reminder/model/ukm/deleteUkm',formdata).then(handleSuccess,handleError);
	}

	function handleSuccess(response){
		return response.data;
	}

	function handleError(response){
		return response.data;
	}

}]);

angular.module('reminder.services').factory('notifikasiService', ['$http', 
	function($http){
	var service ={};
	service.GetAll = GetAll;
	service.Update = Update;
	return service;

	function GetAll(id,offset,limit){
		return $http.get('http://192.168.43.24/reminder/model/notif/indexAll/'+id+'/'+offset+'/'+limit).then(handleSuccess,handleError);
	}

	function Update(formdata){
		return $http.post('http://192.168.43.24/reminder/model/notif/updateNotif',formdata).then(handleSuccess,handleError);
	}

	function handleSuccess(response){
		return response;
	}

	function handleError(response){
		return response;
	}

}]);

angular.module('reminder.services').factory('Poller', function($http){
	var service ={};
    service.poll = poll;
    return service;

    function poll(api){
    	return  $http.get(api).then(handleSuccess);
    }
    
    function handleSuccess(response){
    	return response.data;
    }

});