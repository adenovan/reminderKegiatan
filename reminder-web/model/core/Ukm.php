<?php

class Ukm extends Model {

	public function __construct(){
		$this->auditLogin();
		parent::__construct();
	}

	public function index($params = array()){
		$this->auditAksesPanitia();
		$idparam= (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		//param [1] di gunakan untuk pemilihan field di database
		$param=(isset($params[1])) ? preg_replace('/[^A-Za-z-.\*.\_.\,]/', '', $params[1])  : null;
		if(!empty($idparam)){
			if(!empty($param)){
				$this->select($param,"ukm","ID_Ukm = '".$idparam."'");
			}else{
				$this->select("*","ukm","ID_Ukm = '".$idparam."'");
			}
			if($this->result("count")>0){
			$result = $this->result("one");
				if(array_key_exists("logo_ukm", $result)){
					if($result['logo_ukm']!="NULL"&&!empty($result['logo_ukm'])){
					$base64foto = file_get_contents("../image/ukm/".$result['logo_ukm']);
					$type = explode('.', $result['logo_ukm']);
					$result['logo_ukm'] = base64_encode($base64foto);
					$result['type'] = 'data:image/' . strtolower($type[1]) . ';base64,';
					}else{
					$base64foto = file_get_contents("../image/ukm/default.png");
					$result['type'] = 'data:image/png;base64,';
					$result['logo_ukm'] = base64_encode($base64foto);
					}
				}
			echo json_encode($result);
			}else{
				$this->error("No ukm found");
			}
		}else{
			$this->error("No ukm params id found");
		}
	}

	public function indexAll($params=array()){
		$this->auditAksesPanitia();
		$param=(isset($params[0])) ? preg_replace('/[^A-Za-z-.\*.\_.\,]/', '', $params[0]) : null;
		if(!empty($param)){
			$offset = (isset($params[1])) ? preg_replace('/\D/', '', $params[1]) : "";
			if(!empty($offset)){
				$this->select($param,"ukm","",$offset);
			}else{
			$this->select($param,"ukm","","0");
			}
			$result = array_change_key_case($this->result("all"), CASE_LOWER);
			for($i=0;$i<count($result);$i++){
				if(array_key_exists('logo_ukm', $result[$i])){
					if($result[$i]['logo_ukm']!="NULL"&&!empty($result[$i]['logo_ukm'])){
					$base64foto = file_get_contents("../image/ukm/".$result[$i]['logo_ukm']);
					$type = explode('.', $result[$i]['logo_ukm']);
					$result[$i]['logo_ukm'] = base64_encode($base64foto);
					$result[$i]['type'] = 'data:image/' . strtolower($type[1]) . ';base64,';
					}else{
					$base64foto = file_get_contents("../image/ukm/default.png");
					$result[$i]['type'] = 'data:image/png;base64,';
					$result[$i]['logo_ukm'] = base64_encode($base64foto);
					}
				}
			}
			echo json_encode($result);
		}else{
			$this->select("id_ukm,nama_ukm,logo_ukm","ukm","1");
			$result = $this->result('all');
			for($i=0;$i<count($result);$i++){
				if($result[$i]['logo_ukm']!="NULL"&&!empty($result[$i]['logo_ukm'])){
				$base64foto = file_get_contents("../image/ukm/".$result[$i]['logo_ukm']);
				$type = explode('.', $result[$i]['logo_ukm']);
				$result[$i]['logo_ukm'] = base64_encode($base64foto);
				$result[$i]['type'] = 'data:image/' . strtolower($type[1]) . ';base64,';
				}else{
				$base64foto = file_get_contents("../image/ukm/default.png");
				$result[$i]['type'] = 'data:image/png;base64,';
				$result[$i]['logo_ukm'] = base64_encode($base64foto);
				}
			}
			echo json_encode($result);
		}
	}

	public function cariUkm($params = array()){
		$this->auditAksesSenat();
		if(!empty($params[0])){
			$search = preg_replace("/[^A-Za-z0-9?![:space:]]/","",$params[0]);
			$this->select("id_ukm,nama_ukm,logo_ukm","ukm","nama_ukm LIKE '%".$search."%'");
			if($this->result("count")>0){
			$result = $this->result('all');
			for($i=0;$i<count($result);$i++){
				if($result[$i]['logo_ukm']!="NULL"&&!empty($result[$i]['logo_ukm'])){
				$base64foto = file_get_contents("../image/ukm/".$result[$i]['logo_ukm']);
				$type = explode('.', $result[$i]['logo_ukm']);
				$result[$i]['logo_ukm'] = base64_encode($base64foto);
				$result[$i]['type'] = 'data:image/' . strtolower($type[1]) . ';base64,';
				}else{
				$base64foto = file_get_contents("../image/ukm/default.png");
				$result[$i]['type'] = 'data:image/png;base64,';
				$result[$i]['logo_ukm'] = base64_encode($base64foto);
				}
			}
			echo json_encode($result);
			}else{
				$this->error404('Ormawa dengan nama '.$search.' tidak ditemukan');
			}
		}else{
			$this->error422("Pencarian UKM masih kosong");
		}
	}

	public function newUkm(){
		$this->auditAksesSenat();
		if(!empty($_POST['nama_ukm'])&&trim($_POST['nama_ukm'])!=""){
			$namaukm = filter_input(INPUT_POST, "nama_ukm", FILTER_SANITIZE_SPECIAL_CHARS);
			if(!empty($_FILES["file"]["name"])){
				if(strlen($_FILES["file"]["tmp_name"])>0 && $_FILES["file"]["error"]==0){
				$tmp_name = $_FILES["file"]["tmp_name"];
				$name = $_FILES["file"]["name"];
				$ext = pathinfo($name, PATHINFO_EXTENSION);
				$name = uniqid().".".$ext;
				try{
				$im = new ImageManipulator($_FILES["file"]['tmp_name']);
				}catch (InvalidArgumentException $e){
					$this->error($e->getMessage());
				}
					switch ($ext) {
 					case 'jpg':
 					$im->save('../image/ukm/'.$name, IMAGETYPE_JPEG);
 					break;
 					case 'png':
					$im->save('../image/ukm/'.$name, IMAGETYPE_PNG);
 					break;
 					default:
 					$im->save('../image/ukm/'.$name, IMAGETYPE_JPEG);
 					break;
 					}
 				$foto = $name;
 				}else{
 					$this->error("logo ormawa error , gunakan gambar lainnya");
 				}
 			}else{
 			$foto = "NULL";
 			}
 		$arrayPost = array("NULL",$namaukm,$foto);
 		$this->insert("ukm",$arrayPost);
		}else{
			$this->error("No nama ormawa found");
		}
	}

	public function editUkm(){
		$this->auditAksesSenat();
		$columnset= "";
		if(!empty($_POST["id_ukm"])){
			$id = filter_input(INPUT_POST, 'id_ukm', FILTER_SANITIZE_NUMBER_INT);
			if(!empty($_POST["nama_ukm"])){
			$namaukm = filter_input(INPUT_POST, "nama_ukm", FILTER_SANITIZE_SPECIAL_CHARS);
			$columnset.= ($columnset=="") ? "nama_ukm = '".$namaukm."'" : " , nama_ukm = '".$namaukm."'";
			}
			if(!empty($_FILES["file"]["name"])){
				if(strlen($_FILES["file"]["tmp_name"])>0 && $_FILES["file"]["error"]==0){
				$tmp_name = $_FILES["file"]["tmp_name"];
				$name = $_FILES["file"]["name"];
				$ext = pathinfo($name, PATHINFO_EXTENSION);
				$name = uniqid().".".$ext;
				try{
				$im = new ImageManipulator($_FILES["file"]['tmp_name']);
				}catch (InvalidArgumentException $e){
					$this->error($e->getMessage());
				}
					switch ($ext) {
 					case 'jpg':
 					$im->save('../image/ukm/'.$name, IMAGETYPE_JPEG);
 					break;
 					case 'png':
					$im->save('../image/ukm/'.$name, IMAGETYPE_PNG);
 					break;
 					default:
 					$im->save('../image/ukm/'.$name, IMAGETYPE_JPEG);
 					break;
 					}
 				$foto = $name;
 				$columnset.= ($columnset=="") ? "logo_ukm = '".$foto."'" : " , logo_ukm = '".$foto."'";
 				$this->select("logo_ukm","ukm","ID_Ukm='".$id."'");
 				$result = $this->result("one")['logo_ukm'];
 					if($result!="NULL"){
 						unlink("../image/ukm/".$result);
 					}
 				}else{
 					$this->error("logo ormawa error , gunakan gambar lainnya");
 				}
 			}
 			$this->update("ukm",$columnset,"ID_Ukm='".$id."'");
		}else{
			$this->error("ID UKM not found");
		}
	}

	public function deleteUkm(){
		$this->auditAksesSenat();
		if(!empty($_POST["id_ukm"])){
			$id = filter_input(INPUT_POST, 'id_ukm', FILTER_SANITIZE_NUMBER_INT);
			$this->select("logo_ukm","ukm","ID_Ukm='".$id."'");
 			$result = $this->result("one")['logo_ukm'];
 				if($result!="NULL"){
 					if(file_exists("../image/ukm/".$result)){
 					unlink("../image/ukm/".$result);
 					}
 				}
 			$this->delete("ukm","ID_Ukm = '".$id."'");	
		}else{
			$this->error404("No parameter id ukm found");
		}
	}
}

?>
