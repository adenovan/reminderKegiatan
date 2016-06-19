<?php 

class Panitia extends Model {

	public function __construct(){
		$this->auditLogin();
		parent::__construct();
	}

	public function index($params = array()){
		$this->auditAksesPanitia();
		$idparam= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		//param [1] di gunakan untuk pemilihan field di database
		$param=(isset($params[1])) ? preg_replace('/[^A-Za-z-.\*.\_.\,]/', '', $params[1]) : null;
		if(!empty($idparam)){
			if(!empty($param)&&trim($param)!=""){
				$param = strtolower($param);
				$param = str_replace("password_user,","",$param);
				$param = str_replace(",password_user","",$param);
				$param = str_replace("password_user","",$param);
				$this->select($param,"user","ID_User='".$idparam."'");
			}else{
				$this->select("id_user,email_user,nama_user,no_handphone,hak_akses,nim,foto_user","user","ID_User='".$idparam."' AND hak_akses > 3");
			}
			if($this->result("count")>0){
			$result = $this->result("one");
				if(array_key_exists("foto_user", $result)){
					if($result['foto_user']!="NULL"&&!empty($result['foto_user'])){
					$base64foto = file_get_contents("../image/user/".$result['foto_user']);
					$result['foto_user'] = base64_encode($base64foto);
					$type = pathinfo("../image/user/".$result['foto_user'], PATHINFO_EXTENSION);
					$result['type'] = 'data:image/' . $type . ';base64,';
					}else{
					$base64foto = file_get_contents("../image/user/default.png");
					$result['type'] = 'data:image/png;base64,';
					$result['foto_user'] = base64_encode($base64foto);
					}
				}
			echo json_encode($result);
			}else{
				parent::error("No panitia found");
			}
		}else{
			parent::error("No panitia params id found");
		}
	}

	private function listPanitia($param="",$hakakses="=3"){
		if(!empty($param)){
		$param = str_replace("password_user,","",$param);
		$param = str_replace(",password_user","",$param);
		$param = str_replace("password_user","",$param);
		$this->select($param,"user","hak_akses".$hakakses);
			$result = $this->result("all");
			for($i=0;$i<count($result);$i++){
				if(array_key_exists('foto_user', $result[$i])){
					if($result[$i]['foto_user']!="NULL"&&!empty($result[$i]['foto_user'])){
					$base64foto = file_get_contents("../image/user/".$result[$i]['foto_user']);
					$result[$i]['foto_user'] = base64_encode($base64foto);
					$type = pathinfo("../image/user/".$result[$i]['foto_user'], PATHINFO_EXTENSION);
					$result[$i]['type'] = 'data:image/' . $type . ';base64,';
					}else{
					$base64foto = file_get_contents("../image/user/default.png");
					$result[$i]['foto_user'] = base64_encode($base64foto);
					$result[$i]['type'] = 'data:image/png;base64,';
					}
				}
			}
			echo json_encode($result);
		}else{
			$this->select("ID_User,email_user,nama_user,no_handphone,hak_akses,nim,foto_user",
				"user","hak_akses".$hakakses);
			$result = $this->result("all");
			for($i=0;$i<count($result);$i++){
				if($result[$i]['foto_user']!="NULL"&&!empty($result[$i]['foto_user'])){
				$base64foto = file_get_contents("../image/user/".$result[$i]['foto_user']);
				$result[$i]['foto_user'] = base64_encode($base64foto);
				$type = pathinfo("../image/user/".$result[$i]['foto_user'], PATHINFO_EXTENSION);
				$result[$i]['type'] = 'data:image/' . $type . ';base64,';
				}else{
				$base64foto = file_get_contents("../image/user/default.png");
				$result[$i]['foto_user'] = base64_encode($base64foto);
				$result[$i]['type'] = 'data:image/png;base64,';
				}
			}
			echo json_encode($result);
		}
	}

	public function indexAll($params = array()){
		$this->auditAksesBalma();
		$param=(isset($params[0])) ? preg_replace('/[^A-Za-z-.\*.\_.\,]/', '', $params[0]) : null;
		$this->listPanitia($param,">3");
	}

	public function indexAllAktif($params = array()){
		$this->auditAksesBalma();
		$param=(isset($params[0])) ? preg_replace('/[^A-Za-z-.\*.\_.\,]/', '', $params[0]) : null;
		$this->listPanitia($param,"=4");
	}

	public function indexAllTidakAktif($params = array()){
		$this->auditAksesBalma();
		$param=(isset($params[0])) ? preg_replace('/[^A-Za-z-.\*.\_.\,]/', '', $params[0]) : null;
		$this->listPanitia($param,"=5");
	}

	private function listPencarian($search="",$hakakses=""){
		$this->select("id_user,email_user,nama_user,no_handphone,hak_akses,nim,foto_user",
				"user","nama_user LIKE '%".$search."%' AND hak_akses".$hakakses);
		if($this->result("count")>0){
			$result = $this->result("all");
			for($i=0;$i<count($result);$i++){
				if($result[$i]['foto_user']!="NULL"&&!empty($result[$i]['foto_user'])){
				$base64foto = file_get_contents("../image/user/".$result[$i]['foto_user']);
				$result[$i]['foto_user'] = base64_encode($base64foto);
				$type = pathinfo("../image/user/".$result[$i]['foto_user'], PATHINFO_EXTENSION);
				$result[$i]['type'] = 'data:image/' . $type . ';base64,';
				}else{
				$base64foto = file_get_contents("../image/user/default.png");
				$result[$i]['foto_user'] = base64_encode($base64foto);
				$result[$i]['type'] = 'data:image/png;base64,';
				}
			}
			echo json_encode($result);
		}else{
			$this->error404("Tidak ada hasil untuk pencarian Panitia ".$search);
		}
	}

	public function cariPanitiaAktif($params=array()){
		$this->auditAksesSenat();
		if(!empty($params[0])){
			$nama = preg_replace("/[^A-Za-z0-9?![:space:]]/","",$params[0]);
			$this->listPencarian($nama,'=4');
		}else{
			$this->error422("Pencarian Panitia Aktif Masih Kosong");
		}
	}

	public function cariPanitiaTidakAktif($params=array()){
		$this->auditAksesSenat();
		if(!empty($params[0])){
			$nama = preg_replace("/[^A-Za-z0-9?![:space:]]/","",$params[0]);
			$this->listPencarian($nama,'=5');
		}else{
			$this->error422("Pencarian Panitia Tidak Aktif Masih Kosong");
		}
	}
	
	public function newPanitia(){
		$this->auditAksesSenat();
		if(!empty($_POST)){
		$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
		$password = filter_input(INPUT_POST, 'password', FILTER_DEFAULT);
		$nama = filter_input(INPUT_POST, 'nama', FILTER_SANITIZE_SPECIAL_CHARS);
		$handphone = filter_input(INPUT_POST, "handphone", FILTER_SANITIZE_NUMBER_INT);
		$hakakses = 4;
		$nim = filter_input(INPUT_POST, "nim", FILTER_SANITIZE_NUMBER_INT);
		$arrayPost =array("NULL",$email,$password,$nama,$handphone,$hakakses,$nim,"NULL","NULL");
		$this->insert("user",$arrayPost);
		}else{
			parent::error405(__METHOD__);
		}
	}

	public function editPanitia(){
		$this->auditAksesPanitia();
		if(!empty($_POST['id'])){
			$id = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_NUMBER_INT);
			$columnset ="";
			if(!empty($_POST['email'])){
				$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
				$columnset.= ($columnset=="") ? "email_user = '".$email."'" : " , email_user = '".$email."'";
			}
	
			if(!empty($_POST['password'])){
				$password = filter_input(INPUT_POST, 'password', FILTER_DEFAULT);
				$columnset.= ($columnset=="") ? "password_user = '".$password."'" : " , password_user = '".$password."'";
			}
			if(!empty($_POST['nama'])){
				$nama = filter_input(INPUT_POST, 'nama', FILTER_SANITIZE_SPECIAL_CHARS);
				$columnset.= ($columnset=="") ? "nama_user = '".$nama."'" : " , nama_user = '".$nama."'";
			}
			if(!empty($_POST['handphone'])){
				$handphone = filter_input(INPUT_POST, "handphone", FILTER_SANITIZE_NUMBER_INT);
				if($handphone!=''){
				$columnset.= ($columnset=="") ? "no_handphone = '".$handphone."'" : " , no_handphone = '".$handphone."'";
				}
			}
			if(!empty($_POST['nim'])){
				$nim =filter_input(INPUT_POST, "nim", FILTER_SANITIZE_NUMBER_INT);
				if($nim!=''){
				$columnset.= ($columnset=="") ? "nim = '".$nim."'" : " , nim = '".$nim."'";
				}
			}
			if(!empty($_POST['hakakses'])){
				$hakakses = filter_input(INPUT_POST, "hakakses", FILTER_SANITIZE_NUMBER_INT);
				$columnset.= ($columnset=="") ? "hak_akses = '".$hakakses."'" : " , hak_akses = '".$hakakses."'";
			}
			if(!empty($_FILES["file"]["name"])){
				if(strlen($_FILES["file"]["tmp_name"])>0 && $_FILES["file"]["error"]==0){
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
 					$im->save('../image/user/'.$name, IMAGETYPE_JPEG);
 					break;
 					case 'png':
					$im->save('../image/user/'.$name, IMAGETYPE_PNG);
 					break;
 					default:
 					$im->save('../image/user/'.$name, IMAGETYPE_JPEG);
 					break;
 					}
 				$foto = $name;
 				$columnset.= ($columnset=="") ? "foto_user = '".$foto."'" : " , foto_user = '".$foto."'";
 				$this->select("foto_user","user","ID_User='".$id."'");
 				$result = $this->result("one")['foto_user'];
 					if($result!="NULL"){
 						unlink("../image/user/".$result);
 					}
 				}else{
 				$this->error422("Foto ini tidak dapat digunakan , gunakan foto lainnya");
 				}
 			}
			$this->update("user",$columnset,"ID_User='".$id."' AND hak_akses > '3'");
		}else{
			parent::error("No Primary key found");
		}
	}

	public function deletepanitia(){
		$this->auditLogin();
		$this->auditAksesSenat();
			if(!empty($_POST['id'])){
				$id = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_NUMBER_INT);
				$this->select("foto_user","user","ID_User='".$id."' and hak_akses > 3");
				if($this->result('count') > 0){
					$result = $this->result("one")['foto_user'];
 					if($result!="NULL"){
 						if(file_exists("../image/user/".$result)){
 						unlink("../image/user/".$result);
 						}	
 					}
					$this->delete("user","ID_User ='".$id."' and hak_akses > 3",false);
					$this->success("Panitia berhasil dihapus");
				}else{
					$this->error404("Panitia tidak ditemukan");
				}
			}
			else{
				$this->error422("No user id found");
			}	
	}

}
?>