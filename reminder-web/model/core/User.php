<?php 


class User extends Model{

	public function __construct(){
		parent::__construct();
	}

	public function checkHeader(){
		if(isset($_SERVER['HTTP_USER']) && isset($_SERVER['HTTP_AKSES'])){
		$header = array();
		$header['USER'] = $_SERVER['HTTP_USER'];
		$header['AKSES'] = $_SERVER['HTTP_AKSES'];
		echo json_encode($header);
		}else{
			$this->error403("forbidden");
		}
	}

	public function getBoxInfo($params= array()){
		$this->auditLogin();
		$idparam= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		if(!empty($idparam)){
			$this->select('email_user,nama_user,foto_user',"user","id_user='".$idparam."'");
			if($this->result('count') > 0){
				$result = $this->result('one');
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
				echo json_encode($result);
			}else{
				$this->error404('User tidak ditemukan');
			}
		}else{
			$this->error422('Parameter tidak ditemukan');
		}
	}

	public function index($params = array()){
		$this->auditLogin();
		$this->auditAksesPanitia();
		//param[0] inputan id field di database
		$idparam= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		//param [1] di gunakan untuk pemilihan field di database
		$param=(isset($params[1])) ? preg_replace('/[^A-Za-z-.\*.\_.\,]/', '', $params[1]) : null;
		if(!empty($idparam)){
			if(!empty($param)){
				$param = strtolower($param);
				$param = str_replace("password_user,","",$param);
				$param = str_replace(",password_user","",$param);
				$param = str_replace("password_user","",$param);
				$this->select($param,"user","ID_User='".$idparam."'");
			}else{
				$this->select("id_user,email_user,nama_user,no_handphone,hak_akses,nim,foto_user","user","ID_User=".$idparam);
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
				$this->error("No user found");
			}
		}else{
			$this->error("No user params id found");
		}
	}

	private function listPencarian($pencarian="",$hakakses='1'){
			$this->select(
				"id_user,email_user,nama_user,no_handphone,hak_akses,nim,foto_user",
				"user",
				"nama_user LIKE '%".$pencarian."%' AND hak_akses=".$hakakses);
			if($this->result('count') > 0){
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
				switch ($hakakses) {
					case '1':
						$this->error404("Tidak ada hasil untuk pencarian Admin ".$pencarian);
						break;
					case '2':
						$this->error404("Tidak ada hasil untuk pencarian Senat ".$pencarian);
						break;
					case '3':
						$this->error404("Tidak ada hasil untuk pencarian Balma ".$pencarian);
						break;
				}
			}
	}

	private function listUser($param="",$hakakses = '1'){
		if(!empty($param)){
			$this->select($param,"user","hak_akses=".$hakakses);
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
					$result[$i]['type'] = 'data:image/png' . $type . ';base64,';
					}
				}
				if(array_key_exists('password_user', $result[$i])){
					unset($result[$i]['password_user']);
				}
			}
			echo json_encode($result);
		}else{
			$this->select("*","user","hak_akses=".$hakakses);
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
				unset($result[$i]['password_user']);
			}
			echo json_encode($result);
		}
	}

	public function indexAdmin($params=array()){
		$this->auditLogin();
		$this->auditSuper();
		$param=(isset($params[0])) ? preg_replace('/[^A-Za-z-.\*.\_.\,]/', '', $params[0]) : null;
		$this->listUser($param,'1');
	}

	public function indexSenat($params=array()){
		$this->auditLogin();
		$this->auditAkses();
		$param=(isset($params[0])) ? preg_replace('/[^A-Za-z-.\*.\_.\,]/', '', $params[0]) : null;
		$this->listUser($param,'2');
	}

	public function indexBalma($params=array()){
		$this->auditLogin();
		$this->auditAkses();
		$param=(isset($params[0])) ? preg_replace('/[^A-Za-z-.\*.\_.\,]/', '', $params[0]) : null;
		$this->listUser($param,'3');
	}


	public function cariAdmin($params=array()){
		$this->auditLogin();
		$this->auditSuper();
		if(empty($params[0])){
			$this->error422("Pencarian Admin masih kosong");
		}else{
			$search = preg_replace("/[^A-Za-z0-9?![:space:]]/","",$params[0]);
			$this->listPencarian($search,"1");
		}
	}


	public function cariSenat($params=array()){
		$this->auditLogin();
		$this->auditAkses();
		if(empty($params[0])){
			$this->error422("Pencarian Senat masih kosong");
		}else{
			$search = preg_replace("/[^A-Za-z0-9?![:space:]]/","",$params[0]);
			$this->listPencarian($search,"2");
		}
	}

	public function cariBalma($params=array()){
		$this->auditLogin();
		$this->auditAkses();
		if(empty($params[0])){
			$this->error422("Pencarian Balma masih kosong");
		}else{
			$search = preg_replace("/[^A-Za-z0-9?![:space:]]/","",$params[0]);
			$this->listPencarian($search,"3");
		}
	}


	public function edituser(){
		$this->auditLogin();
		$this->auditAksesBalma();
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
			if(!empty($_POST['hakakses'])){
				$hakakses = filter_input(INPUT_POST, "hakakses", FILTER_SANITIZE_NUMBER_INT);
				$columnset.= ($columnset=="") ? "hak_akses = '".$hakakses."'" : " , hak_akses = '".$hakakses."'";
			}
			if(!empty($_POST['nim'])){
				$nim =filter_input(INPUT_POST, "nim", FILTER_SANITIZE_NUMBER_INT);
				if($nim!=''){
				$columnset.= ($columnset=="") ? "nim = '".$nim."'" : " , nim = '".$nim."'";
				}
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
			$this->update("user",$columnset,"ID_User='".$id."'","Data berhasil dirubah");
		}else{
			$this->error422('Primary ID Not Found');
		}
	}

	public function newuser(){
		$this->auditLogin();
		$this->auditAkses();
		if(!empty($_POST)){
		$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
		$password = filter_input(INPUT_POST, 'password', FILTER_DEFAULT);
		$nama = filter_input(INPUT_POST, 'nama', FILTER_SANITIZE_SPECIAL_CHARS);
		$handphone = filter_input(INPUT_POST, "handphone", FILTER_SANITIZE_NUMBER_INT);
		$hakakses = filter_input(INPUT_POST, "hakakses", FILTER_SANITIZE_NUMBER_INT);
		$nim = isset($_POST['nim']) ? filter_input(INPUT_POST, "nim", FILTER_SANITIZE_NUMBER_INT) : "NULL";
			//foto handler
			if(!empty($_FILES["file"]["name"])){
				if(strlen($_FILES["file"]["tmp_name"])>0 && $_FILES["file"]["error"]==0){
				$tmp_name = $_FILES["file"]["tmp_name"];
				$name = $_FILES["file"]["name"];
				$ext = pathinfo($name, PATHINFO_EXTENSION);
				$name = uniqid().".".$ext;
				try{
					$im = new ImageManipulator($_FILES['file']['tmp_name']);
				}catch (InvalidArgumentException $e){
					$this->error422($e->getMessage());
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
 				}else{
 					$this->error422("Foto ini tidak dapat digunakan , gunakan foto lainnya");
 				}
 			}else{
 			$foto = "NULL";
 			}
		$arrayPost =array("NULL",$email,$password,$nama,$handphone,$hakakses,$nim,$foto,"NULL");
		$this->insert("user",$arrayPost);
		}else{
			$this->error405("Forbidden Method!");
		}
	}

	//delete user
	public function deleteuser(){
		$this->auditLogin();
		$this->auditAkses();
			if(!empty($_POST['id'])){
				$id = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_NUMBER_INT);
				$this->select("foto_user","user","ID_User='".$id."'");
 				$result = $this->result("one")['foto_user'];
 					if($result!="NULL"){
 						if(file_exists("../image/user/".$result)){
 						unlink("../image/user/".$result);
 						}	
 					}
				$this->delete("user","ID_User ='".$id."'",false);
				$this->success("User berhasil di hapus");
			}
			else{
				$this->error422("No user id found");
			}	
	}

	public function login(){
		if(!empty($_POST['email'])){
			$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
			$password = filter_input(INPUT_POST, 'password', FILTER_DEFAULT);
			$this->select("password_user,ID_User AS Session , hak_akses ","user","email_user = '".$email."'");
			if( $this->result("count") > 0){
				$result = $this->result('one');
				$passwordquery = array_shift($result);
				if($passwordquery == $password){
				$_SESSION['login'] = $result['Session'];
				$_SESSION['hakakses']= $result['hak_akses'];
				echo json_encode($result);
				}else{
					$this->error("Password yang anda masukan salah");
				}
			}else{
				$this->error("User tidak ditemukan");
			}
		}else{
			$this->error("no email found");
		}
	}

	public function logout(){
		if(isset($_SESSION['login'])){
			session_destroy();
			$this->success('Log Out Success');
		}else{
			$this->error422('No Session Found');
		}
	}

	//gcm registration
	public function updateGCM(){
		//$this->auditLogin();
		//$this->auditAksesPanitia();
		if(!empty($_POST["id"])){
			$id = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_NUMBER_INT);
			if(!empty($_POST["gcm_id"])&&trim($_POST["gcm_id"])!=""){
				$gcm = filter_input(INPUT_POST, "gcm_id", FILTER_DEFAULT);
				$device = filter_input(INPUT_POST, "device", FILTER_DEFAULT);
				$current = file_get_contents("gcm.txt");
				$current .= "GCM ID = ".$gcm." Device : ".$device."\n";
				file_put_contents('gcm.txt', print_r($current,true));
				$this->select("hak_akses","user","ID_User='".$id."'");
				if($this->result("count")>0){
				$columnset="GCM = '".$gcm."'";
				$this->update("user",$columnset,"ID_User='".$id."'","GCM berhasil di perbarui");
				}else{
					$this->error("user not found");
				}
			}else{
				$this->error("no GCM id found");
			}
		}else{
			$this->error("no id found");
		}
	}
}


?>