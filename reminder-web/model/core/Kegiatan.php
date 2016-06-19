<?php

class Kegiatan extends Model {

	public function __construct(){
		$this->auditLogin();
		parent::__construct();
	}

	public function indexLaporan(){
		$this->select("MONTH( tanggal_kegiatan) as 'group'","kegiatan",
			"YEAR( tanggal_kegiatan ) = '2016' GROUP BY MONTH(tanggal_kegiatan)");
		$result = $this->result('all');
		foreach ($result as $key => $value) {
			$this->select("nama_kegiatan,id_kegiatan",'kegiatan',"YEAR(tanggal_kegiatan) ='2016' AND 
				MONTH(tanggal_kegiatan) = ".$value['group']);
			$result[$key]['kegiatan'] = $this->result('all');
		}
		echo json_encode($result);
	}

	public function poll(){
		$this->auditAksesBalma();
		$this->select("id_kegiatan","kegiatan","1");
		echo json_encode(array('total_kegiatan'=>$this->result('count')));
	}
	public function selectOne($params =array()){
		$this->auditAksesSenat();
		$id_kegiatan= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		if(!empty($id_kegiatan)){
			$this->select("*","kegiatan", "id_kegiatan ='".$id_kegiatan."'");
			if($this->result('count')>0){
				$result = array_change_key_case($this->result("one"), CASE_LOWER);
				echo json_encode($result);
			}else{
				$this->error404('kegiatan tidak ditemukan');
			}
		}else{
			$this->error422("parameter kegiatan tidak ditemukan");
		}
	}

	public function selectAll(){
		$this->auditAksesSenat();
		$this->select("id_kegiatan,nama_kegiatan,tanggal_kegiatan","kegiatan",
		"id_kegiatan NOT IN (SELECT id_refrensi FROM  `kegiatan` WHERE id_refrensi >0)");
		$result= $this->result("all");
		foreach ($result as $key => $value) {
			$result[$key]['nama_kegiatan'] .= " ";
			$result[$key]['nama_kegiatan'] .= date("(M Y)", strtotime($result[$key]["tanggal_kegiatan"]));
			unset($result[$key]['tanggal_kegiatan']);
		}
		echo json_encode($result);
	}

	public function selectEditAll($params=array()){
		$this->auditAksesSenat();
		$id_kegiatan= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		if(!empty($id_kegiatan)){
			$this->select("id_kegiatan,nama_kegiatan,tanggal_kegiatan","kegiatan",
			"id_kegiatan != '".$id_kegiatan."'");
			$result= $this->result("all");
			foreach ($result as $key => $value) {
				$result[$key]['nama_kegiatan'] .= " ";
				$result[$key]['nama_kegiatan'] .= date("(M Y)", strtotime($result[$key]["tanggal_kegiatan"]));
				unset($result[$key]['tanggal_kegiatan']);
			}
			echo json_encode($result);
		}else{
			$this->error422('id_kegiatan not found');
		}
	}

	public function selectEditOne($params=array()){
		$this->auditAksesSenat();
		$id_kegiatan= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		if(!empty($id_kegiatan)){
			$this->select("id_kegiatan,nama_kegiatan,tanggal_kegiatan","kegiatan",
			"id_kegiatan = '".$id_kegiatan."'");
			$result= $this->result("one");
			if($result!== false){
			//foreach ($result as $key => $value) {
				$result['nama_kegiatan'] .= " ";
				$result['nama_kegiatan'] .= date("(M Y)", strtotime($result["tanggal_kegiatan"]));
				unset($result['tanggal_kegiatan']);
			//}
			echo json_encode($result);
			}else{
				$this->error422('id_kegiatan not found');
			}
		}else{
			$this->error422('id_kegiatan not found');
		}
	}

	public function index($params=array()){
		$this->auditAksesPanitia();
		$id_kegiatan= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		if(!empty($id_kegiatan)){
		//first table
		$this->preparejoin(array("id_kegiatan","id_refrensi","id_panitia",
			"nama_kegiatan","lokasi_kegiatan","tanggal_audiensi","tanggal_kegiatan","deskripsi_kegiatan")
			, "kegiatan");
		//second table
		$this->leftjoin(array("nama_ukm","logo_ukm"),"ukm",array("id_ukm","id_ukm"));
		//order by used index of table joined preparejoin also counted total table is 2 (array)
		$this->joinwhere(array(0,"id_kegiatan ='".$id_kegiatan."'"));
		$this->joingroupby(array(0,"id_kegiatan"));
		$this->joinorderby(array(0,"id_kegiatan"));
		$this->joinlimit(1);
		//$this->joinorderby("string");
		//joining all
		$this->joinsql();
			if($this->result("count")>0){
				$result = $this->result("one");
				$result['tanggal_kegiatan'] = date("j F Y, H:i ", strtotime($result["tanggal_kegiatan"]));
        		$result['tanggal_audiensi'] = date("j F Y, H:i ", strtotime($result["tanggal_audiensi"]));
        		if($result['logo_ukm'] != "NULL"){
        			$base64foto = file_get_contents("../image/ukm/".$result['logo_ukm']);
        			$type = explode('.', $result['logo_ukm']);
					$result['logo_ukm'] = base64_encode($base64foto);
					$result['type'] = 'data:image/' . $type[1] . ';base64,';
        		}else{
       				$base64foto = file_get_contents("../image/ukm/default.png");
					$result['logo_ukm'] = base64_encode($base64foto);
					$result['type'] = 'data:image/png;base64,';
        		}
        		echo json_encode($result);
			}else{
				$this->error422("kegiatan tidak ditemukan");
			}
		}else{
			$this->error422("no id kegiatan found");
		}
	}

	//todo index kegiatan > tanggal_kegiatan now selain itu kegiatan tidak aktif
	public function indexAll($params= array()){
		//$this->auditAksesBalma();
		$limit  = (!empty($params[0])) ? preg_replace('/\D/', '', $params[0]) : 10;
		$offset = (!empty($params[1])) ? preg_replace('/\D/', '', $params[1]) : 0;
		//use of join , 1st param is select , second param is table,3rd param is matching field;
		//first table
		$this->preparejoin(array("id_kegiatan","id_refrensi","id_panitia",
			"nama_kegiatan","lokasi_kegiatan","tanggal_audiensi","tanggal_kegiatan","deskripsi_kegiatan")
			, "kegiatan");
		//second table
		$this->leftjoin(array("nama_ukm","logo_ukm"),"ukm",array("id_ukm","id_ukm"));

		$this->joingroupby(array(0,"id_kegiatan"));
		$this->joinorderby(array(0,"id_kegiatan DESC"));
		$this->joinlimit($limit);
		$this->joinoffset($offset);
		//$this->joinorderby("string");
		//joining all
		$this->joinsql();
		$this->listKegiatan();
	}

	public function kegiatanPanitia($params= array()){
		$this->auditAksesPanitia();
		$id = (!empty($params[0])) ? preg_replace('/\D/', '', $params[0]) : 0;
		if(empty($id)){
			$this->error422("kegiatan anda telah berakhir");
		}else{
		$offset = (!empty($params[1])) ? preg_replace('/\D/', '', $params[1]) : 0;
		$limit  = (!empty($params[2])) ? preg_replace('/\D/', '', $params[2]) : 10;
		$this->preparejoin(array("id_kegiatan","id_refrensi","id_panitia"
			,"nama_kegiatan","lokasi_kegiatan","tanggal_audiensi","tanggal_kegiatan","deskripsi_kegiatan")
			, "kegiatan");
		$this->leftjoin(array("nama_ukm","logo_ukm"),"ukm",array("id_ukm","id_ukm"));
		$this->joingroupby(array(0,"id_kegiatan"));
		$this->joinorderby(array(0,"id_kegiatan DESC"));
		$this->joinwhere(array(0,"id_panitia = '".$id."'"));
		$this->joinlimit($limit);
		$this->joinoffset($offset);
		$this->joinsql();
		$this->listKegiatan();
		}
	}

	public function cariKegiatan($params = array()){
		$this->auditAksesBalma(); 
		if(empty($params[0])){
			$this->error422("Pencarian kegiatan masih kosong");
		}else{
			$search = preg_replace("/[^A-Za-z0-9?![:space:]]/","",$params[0]);
			$limit  = (!empty($params[1])) ? $params[1] : 10;
			$offset = (!empty($params[2])) ? $params[2] : 0;
			$this->preparejoin(array("id_kegiatan","id_refrensi","id_panitia",
			"nama_kegiatan","lokasi_kegiatan","tanggal_audiensi","tanggal_kegiatan","deskripsi_kegiatan")
			, "kegiatan");
			$this->leftjoin(array("nama_ukm","logo_ukm"),"ukm",array("id_ukm","id_ukm"));
			$this->joingroupby(array(0,"id_kegiatan"));
			$this->joinorderby(array(0,"id_kegiatan DESC"));
			$this->joinwhere(array(0,"nama_kegiatan LIKE '%".$search."%'"));
			$this->joinlimit($limit);
			$this->joinoffset($offset);
			$this->joinsql();
			if($this->result('count') > 0){
				$this->listKegiatan();
			}else{
				$this->error404("Tidak ada hasil untuk pencarian kegiatan ".$search);
			}
		}
	}

	private function listKegiatan(){
		$result = $this->result("all");
		foreach ($result as $key => $field) {
        	$result[$key]['tanggal_kegiatan'] = date("j F Y, H:i ", strtotime($result[$key]["tanggal_kegiatan"]));
        	$result[$key]['tanggal_audiensi'] = date("j F Y, H:i ", strtotime($result[$key]["tanggal_audiensi"]));
        	if($result[$key]['logo_ukm'] != "NULL"){
        		$base64foto = file_get_contents("../image/ukm/".$result[$key]['logo_ukm']);
        		$type = explode('.', $result[$key]['logo_ukm']);
				$result[$key]['logo_ukm'] = base64_encode($base64foto);
				$result[$key]['type'] = 'data:image/' . $type[1] . ';base64,';
        	}else{
       			$base64foto = file_get_contents("../image/ukm/default.png");
				$result[$key]['logo_ukm'] = base64_encode($base64foto);
				$result[$key]['type'] = 'data:image/png;base64,';
        	}
		}
		echo json_encode($result);
	}

	//kegiatan baru
	public function newKegiatan(){
		$this->auditAksesSenat();
		if(!empty($_POST["id_panitia"])&&!empty($_POST["id_ukm"])){
			$id_panitia =filter_input(INPUT_POST, 'id_panitia', FILTER_SANITIZE_NUMBER_INT);
			$id_ukm = filter_input(INPUT_POST, 'id_ukm', FILTER_SANITIZE_NUMBER_INT);
			$id_refrensi = !empty($_POST['id_refrensi']) ? filter_input(INPUT_POST, 'id_refrensi', FILTER_SANITIZE_NUMBER_INT) : "NULL";
			$nama_kegiatan = filter_input(INPUT_POST, 'nama_kegiatan', FILTER_SANITIZE_SPECIAL_CHARS);
			$lokasi_kegiatan = filter_input(INPUT_POST, 'lokasi_kegiatan', FILTER_SANITIZE_SPECIAL_CHARS);
			// date time format 2016-01-21 07:20:00
			$tanggal_audiensi = filter_input(INPUT_POST, 'tanggal_audiensi', FILTER_DEFAULT);
			$tanggal_kegiatan = filter_input(INPUT_POST, 'tanggal_kegiatan', FILTER_DEFAULT);
			$deskripsi_kegiatan = filter_input(INPUT_POST, 'deskripsi_kegiatan', FILTER_SANITIZE_SPECIAL_CHARS);
			$arrayPost= array("NULL",$id_refrensi,$id_panitia,$id_ukm,
						$nama_kegiatan,$lokasi_kegiatan,$tanggal_audiensi,$tanggal_kegiatan,$deskripsi_kegiatan);
			if(!$this->datetime($tanggal_kegiatan)||!$this->datetime($tanggal_audiensi)){
				$this->error422("Waktu dan tanggal belum di isi");
			}else{
				$this->insert("kegiatan",$arrayPost,false);
				$this->notifikasiKegiatan($this->lastId(),$id_panitia,$id_ukm,$nama_kegiatan);
			}
		}else{
			$this->error404("no panitia or organization found");
		}
	}

	public function editKegiatan(){
		$this->auditAksesSenat();
		if(!empty($_POST['id_kegiatan'])){
			$columnset="";
			$id = filter_input(INPUT_POST, 'id_kegiatan', FILTER_SANITIZE_NUMBER_INT);

			if(!empty($_POST['id_panitia'])){
				$id_panitia =filter_input(INPUT_POST, 'id_panitia', FILTER_SANITIZE_NUMBER_INT);
				$columnset.= ($columnset=="") ? "id_panitia = '".$id_panitia."'" : " , id_panitia = '".$id_panitia."'";
			}

			if(isset($_POST['id_refrensi'])&& trim($_POST['id_refrensi'])!=""){
				$id_refrensi =filter_input(INPUT_POST, 'id_refrensi', FILTER_SANITIZE_NUMBER_INT);
				$columnset.= ($columnset=="") ? "id_refrensi = '".$id_refrensi."'" : " , id_refrensi = '".$id_refrensi."'";
			}

			if(!empty($_POST['id_ukm'])){
				$id_ukm = filter_input(INPUT_POST, 'id_ukm', FILTER_SANITIZE_NUMBER_INT);
				$columnset.= ($columnset=="") ? "id_ukm = '".$id_ukm."'" : " , id_ukm = '".$id_ukm."'";
			}

			if(!empty($_POST['nama_kegiatan'])){
				$nama_kegiatan = filter_input(INPUT_POST, 'nama_kegiatan', FILTER_SANITIZE_SPECIAL_CHARS);
				$columnset.= ($columnset=="") ? "nama_kegiatan = '".$nama_kegiatan."'" : " , nama_kegiatan= '".$nama_kegiatan."'";
			}

			if(!empty($_POST['lokasi_kegiatan'])){
				$lokasi_kegiatan = filter_input(INPUT_POST, 'lokasi_kegiatan', FILTER_SANITIZE_SPECIAL_CHARS);
				$columnset.= ($columnset=="") ? "lokasi_kegiatan = '".$lokasi_kegiatan."'" : " , lokasi_kegiatan = '".$lokasi_kegiatan."'";
			}

			if(!empty($_POST['tanggal_audiensi'])){
				$tanggal_audiensi = filter_input(INPUT_POST, 'tanggal_audiensi', FILTER_DEFAULT);
				if(!$this->datetime($tanggal_audiensi)){
					$this->error("Tanggal Audiensi masih kosong");
					exit;
				}else{
					$columnset.= ($columnset=="") ? "tanggal_audiensi = '".$tanggal_audiensi."'" : " , tanggal_audiensi = '".$tanggal_audiensi."'";
				}
			}

			if(!empty($_POST['tanggal_kegiatan'])){
				$tanggal_kegiatan = filter_input(INPUT_POST, 'tanggal_kegiatan', FILTER_DEFAULT);
				if(!$this->datetime($tanggal_kegiatan)){
					$this->error("Tanggal Kegiatan masih kosong");
					exit;
				}else{
					$columnset.= ($columnset=="") ? "tanggal_kegiatan = '".$tanggal_kegiatan."'" : " , tanggal_kegiatan = '".$tanggal_kegiatan."'";
				}
			}

			if(!empty($_POST['deskripsi_kegiatan'])){
				$deskripsi_kegiatan = filter_input(INPUT_POST, 'deskripsi_kegiatan', FILTER_SANITIZE_SPECIAL_CHARS);
				$columnset.= ($columnset=="") ? "deskripsi_kegiatan = '".$deskripsi_kegiatan."'" : " , deskripsi_kegiatan = '".$deskripsi_kegiatan."'";
			}
			$this->update("kegiatan",$columnset,"ID_kegiatan='".$id."'","Kegiatan berhasil di perbarui");
		}
		else{
			$this->error422("No id kegiatan found");
		}
	}

	public function deleteKegiatan(){
		$this->auditAkses();
		if(!empty($_POST['id_kegiatan'])){
			$id = filter_input(INPUT_POST, 'id_kegiatan', FILTER_SANITIZE_NUMBER_INT);
			$this->deleteAllEvaluasi($id);
			$this->delete('notif',"id_kegiatan ='".$id."'",false);	
			$this->delete("kegiatan","id_kegiatan='".$id."'");
		}else{
			$this->error404("No id kegiatan found");
		}
	}

	public function indexEvaluasi($params = array()){
		$id_kegiatan= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		if(!empty($id_kegiatan)){
			$this->preparejoin(array("id_evaluasi","evaluasi","foto_evaluasi","tanggal_evaluasi"),"evaluasi");
			$this->leftjoin(array("nama_user","foto_user"),"user",array("id_user","id_user"));
			$this->joinwhere(array(0,"id_kegiatan = '".$id_kegiatan."'"));
			$this->joinsql();
			$result = $this->result("all");
			foreach ($result as $key => $value) {
				if($result[$key]['foto_evaluasi'] === "NULL"){
					$result[$key]['foto_evaluasi'] = null;
				}else{
					$base64foto = file_get_contents("../image/evaluasi/".$result[$key]['foto_evaluasi']);
					$type = explode('.', $result[$key]['foto_evaluasi']);
					$result[$key]['foto_evaluasi'] = base64_encode($base64foto);
					$result[$key]['type_evaluasi'] = 'data:image/' . strtolower($type[1]) . ';base64,';
				}
				if($result[$key]['foto_user']!="NULL"&&!empty($result[$key]['foto_user'])){
					$base64foto = file_get_contents("../image/user/".$result[$key]['foto_user']);
					$type = explode('.', $result[$key]['foto_user']);
					$result[$key]['foto_user'] = base64_encode($base64foto);
					$result[$key]['type_user'] = 'data:image/' . strtolower($type[1]) . ';base64,';
				}else{
					$base64foto = file_get_contents("../image/user/default.png");
					$result[$key]['foto_user'] = base64_encode($base64foto);
					$result[$key]['type_user'] = 'data:image/png;base64,';
				}
				if($result[$key]['evaluasi'] === "NULL"){
					$result[$key]['evaluasi'] = null;
				}
				$result[$key]['tanggal_evaluasi'] = date("j F Y, H:i ", strtotime($result[$key]["tanggal_evaluasi"]));
			}
			echo json_encode($result);
		}else{
			$this->error("no id kegiatan found");
		}
	}
	
	public function indexLastEvaluasi($params=array()){
		$id_kegiatan= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		if(!empty($id_kegiatan)){
			$this->preparejoin(array("id_evaluasi","evaluasi","foto_evaluasi","tanggal_evaluasi"),"evaluasi");
			$this->leftjoin(array("nama_user","foto_user"),"user",array("id_user","id_user"));
			$this->joinorderby(array(0,"id_evaluasi DESC"));
			$this->joinwhere(array(0,"id_kegiatan = '".$id_kegiatan."'"));
			$this->joinlimit(1);
			$this->joinsql();
			if($this->result("count")>0){
				$result = $this->result("one");
				if($result['foto_evaluasi'] === "NULL"){
					$result['foto_evaluasi'] = null;
				}else{
					$base64foto = file_get_contents("../image/evaluasi/".$result['foto_evaluasi']);
					$result['foto_evaluasi'] = base64_encode($base64foto);
					$type = pathinfo("../image/evaluasi/".$result['foto_evaluasi'], PATHINFO_EXTENSION);
					$result['type_evaluasi'] = 'data:image/' . $type . ';base64,';
				}
				if($result['foto_user']!="NULL"&&!empty($result['foto_user'])){
					$base64foto = file_get_contents("../image/user/".$result['foto_user']);
					$result['foto_user'] = base64_encode($base64foto);
					$type = pathinfo("../image/user/".$result['foto_user'], PATHINFO_EXTENSION);
					$result['type_user'] = 'data:image/' . $type . ';base64,';
				}else{
					$base64foto = file_get_contents("../image/user/default.png");
					$result['foto_user'] = base64_encode($base64foto);
					$result['type_user'] = 'data:image/png;base64,';
				}
				if($result['evaluasi'] === "NULL"){
					$result['evaluasi'] = null;
				}
				$result['tanggal_evaluasi'] = date("j F Y, H:i ", strtotime($result["tanggal_evaluasi"]));
				echo json_encode($result);
			}else{
				$this->error("kegiatan dengan id ".$id_kegiatan." tidak ditemukan");
			}
		}else{
			$this->error("id kegiatan tidak ditemukan");
		}
	}

	public function newEvaluasi(){
		$this->auditAksesPanitia();
		$id_kegiatan = filter_input(INPUT_POST, 'id_kegiatan', FILTER_SANITIZE_NUMBER_INT);
		$id_panitia = filter_input(INPUT_POST, 'id_panitia', FILTER_SANITIZE_NUMBER_INT);
		if(!empty($id_kegiatan) && !empty($id_panitia)){
			$evaluasi = filter_input(INPUT_POST, 'evaluasi', FILTER_SANITIZE_SPECIAL_CHARS);
			if(!empty($_FILES["file"]["name"])){
				if(strlen($_FILES["file"]["tmp_name"])>0 && $_FILES["file"]["error"]===0){
				$tmp_name = $_FILES["file"]["tmp_name"];
				$name = $_FILES["file"]["name"];
				$ext = pathinfo($name, PATHINFO_EXTENSION);
				$name = uniqid().".".$ext;
				try{
				$im = new ImageManipulator($_FILES['file']['tmp_name']);
				}catch (InvalidArgumentException $e){
					$this->error($e->getMessage());
				}
					switch ($ext) {
 					case 'jpg':
 					$im->save('../image/evaluasi/'.$name, IMAGETYPE_JPEG);
 					break;
 					case 'png':
					$im->save('../image/evaluasi/'.$name, IMAGETYPE_PNG);
 					break;
 					default:
 					$im->save('../image/evaluasi/'.$name, IMAGETYPE_JPEG);
 					break;
 					}
 				$foto = $name;
 				}else{
 					$this->error422("Foto evaluasi tidak dapat digunakan , gunakan gambar lainnya");
 				}
 			}else{
 			$foto = "NULL";
 			}
 			//maybe check kegiatan?
 			if(empty($evaluasi)||$evaluasi==="null"){
 				$evaluasi= "NULL";
 			}
 			if($evaluasi==="NULL"&&$foto==="NULL"){
 				$this->error422("Data evaluasi masih kosong");
 			}else{
 			$dt = new DateTime();
			$dt->setTimezone(new DateTimeZone("Asia/Singapore"));
 			$arrayPost = array("NULL",$id_kegiatan,$id_panitia,$evaluasi,$foto,$dt->format('Y-m-d H:i:s'));
 			$this->insert("evaluasi",$arrayPost);
 			$this->notifikasiEvaluasi($id_kegiatan,$id_panitia,$evaluasi,$this->lastId());
 			}
		}else{
			$this->error422("kirim evaluasi gagal");
		}
	}

	public function deleteEvaluasi($params=array()){
		$id_evaluasi = filter_input(INPUT_POST, 'id_evaluasi', FILTER_SANITIZE_NUMBER_INT);
		if(!empty($id_evaluasi)){
			$this->select("id_user,foto_evaluasi","evaluasi","id_evaluasi ='".$id_evaluasi."'",1);
			if($this->result("count")>0){
			$result = $this->result("one");
				if($result["id_user"] === $_SESSION['login']){
					if($result["foto_evaluasi"]!="NULL"){
 						if(file_exists("../image/evaluasi/".$result["foto_evaluasi"])){
 						unlink("../image/evaluasi/".$result["foto_evaluasi"]);
 						}
 					}
 					$this->delete("evaluasi","id_evaluasi ='".$id_evaluasi."'");
				}else{
				$this->error("delete not permitted");
				}
			}else{
				$this->error("Evaluasi tidak di temukan");
			}
		}else{
			$this->error("Evaluasi tidak di temukan");
		}
	}

	public function deleteAllEvaluasi($id_kegiatan){
		$this->select("id_evaluasi,foto_evaluasi","evaluasi","id_kegiatan ='".$id_kegiatan."'");
		if($this->result('count')>0){
			$result = $this->result('all');
			foreach ($result as $key => $value) {
				if($value['foto_evaluasi'] !== "NULL"){
				 	if(file_exists("../image/evaluasi/".$value["foto_evaluasi"])){
 					unlink("../image/evaluasi/".$value["foto_evaluasi"]);
 					}
				}
			}
			$this->delete('evaluasi',"id_kegiatan ='".$id_kegiatan."'",false);	
		}
	}

	private function notifikasiKegiatan($id_kegiatan,$id_panitia
		,$id_ukm,$nama_kegiatan){
		$lastid = $id_kegiatan;
		$this->select('id_user','user','hak_akses <4');
		$listUser = $this->result('all');
		$this->select('nama_ukm','ukm',"id_ukm='".$id_ukm."'");
		$nama_ukm = $this->result('one')['nama_ukm'];
		$notif = "Kegiatan baru ".$nama_kegiatan." oleh ".$nama_ukm;
		$dt = new DateTime();
		$dt->setTimezone(new DateTimeZone("Asia/Singapore"));
		$waktu = $dt->format('Y-m-d H:i:s');
		foreach ($listUser as $value) {
			$arrayPost = 
			array('NULL',$value['id_user'],$id_panitia,$lastid,$notif,'0',$waktu,'0');
			$this->insert("notif",$arrayPost,false);
		}
		$notif = "Kegiatan ".$nama_kegiatan." siap untuk di dokumentasikan , selamat bekerja!";
		$arrayPost = 
			array('NULL',$id_panitia,'1',$lastid,$notif,'0',$waktu,'0');
		$this->insert("notif",$arrayPost,false);
		$this->success("Data Kegiatan berhasil di kirim");
	}

	private function notifikasiEvaluasi($id_kegiatan,$id_pengirim,$evaluasi,$id_notifikasi){
		$this->select('id_user ','evaluasi','id_kegiatan = '.$id_kegiatan.' AND id_user !='.$id_pengirim.' GROUP BY id_user');
		$this->preparejoin(array('id_user'),"evaluasi");
		$this->leftjoin(array(" GCM"),"user",array("id_user","id_user"));
		$this->joingroupby(array(0,"id_user"));
		$this->joinwhereraw(" WHERE AA.id_user != ".$id_pengirim." AND AA.id_kegiatan=".$id_kegiatan);
		$this->joinsql();
		$listUser = $this->result('all');
		$this->select('nama_kegiatan','kegiatan','id_kegiatan='.$id_kegiatan);
		$kegiatan = $this->result('one');
		$dt = new DateTime();
		$dt->setTimezone(new DateTimeZone("Asia/Singapore"));
		$waktu = $dt->format('Y-m-d H:i:s');
		$notif = "Evaluasi baru : ".$evaluasi." pada kegiatan ".$kegiatan['nama_kegiatan'];
		foreach ($listUser as $value) {
			$arrayPost = 
			array('NULL',$value['id_user'],$id_pengirim,$id_kegiatan,$notif,'0',$waktu,'0');
			$this->insert("notif",$arrayPost,false);
		}
		$msg = array
		(
			'message' 	=> $notif,
			'title'		=> 'Evaluasi Baru',
			'id_kegiatan'	=> $id_kegiatan,
			'id_notifikasi' => $id_notifikasi,
			'vibrate'	=> 1,
			'sound'		=> 1,
			'largeIcon'	=> 'large_icon',
			'smallIcon'	=> 'small_icon',
			'soundname' => 'default'
		);
		$this->sendGcmNotif($msg,$listUser);
	}

	private function sendGcmNotif($msg= array(),$listUser = array()){
		$registrationIds = array();

		foreach ($listUser as $value) {
			if($value['GCM']!== "NULL"){
				$registrationIds[] = $value['GCM'];
			}
		}

		if(!empty($registrationIds)){
			$fields = array
			(
				'registration_ids' 	=> $registrationIds,
				'data'			=> $msg
			);
			 
			$headers = array
			(
				'Authorization: key=' . API_ACCESS_KEY,
				'Content-Type: application/json'
			);
			 
			$ch = curl_init();
			curl_setopt( $ch,CURLOPT_URL, 'https://android.googleapis.com/gcm/send' );
			curl_setopt( $ch,CURLOPT_POST, true );
			curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
			curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
			curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
			curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
			$result = curl_exec($ch );
			curl_close( $ch );
			$current = file_get_contents("gcmResponse.txt");
			$current .= $result."\n";
			file_put_contents('gcmResponse.txt', print_r($current,true));
		}
	}

	public function kalender($params = array()){
		$month= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		$month2= (isset($params[1])) ? preg_replace('/\D/', '', $params[1]) : null;
		if(isset($month)&&isset($month2)){
			$this->select("date(tanggal_kegiatan) as 'day',nama_kegiatan","kegiatan","(tanggal_kegiatan BETWEEN '".$month."' AND '".$month2."')");
			$pre = $this->result('all');
			$result = array();	
			foreach ($pre as $key => $value) {
				if(isset($result[$value['day']])){
					$result[$value['day']][]=array('kegiatan' => $value['nama_kegiatan']) ;
				}else{
					$result[$value['day']][]=array('kegiatan' => $value['nama_kegiatan']) ;
				}	
			}
			echo json_encode($result);
		}else{
			$this->error422("Bulan tidak ditemukan");
		}

	}
}

?>