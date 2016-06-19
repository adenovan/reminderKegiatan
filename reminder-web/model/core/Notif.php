<?php

class Notif extends Model {

	public function __construct(){
		parent::__construct();
	}

	public function indexAll($params=array()){
		$id_user = (!empty($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		$offset = (!empty($params[1])) ? preg_replace('/\D/', '', $params[1]) : 0;
		$limit = (!empty($params[2])) ? preg_replace('/\D/', '', $params[2]) : 25;
		if(!empty($id_user)){
			$this->preparejoin(
				array('id_notif','id_kegiatan',
					'notifikasi','status_dibaca','waktu','tipe')
				,"notif");
			$this->leftjoin(array('foto_user')
				,'user',array('id_pengirim','id_user'));
			$this->joinwhere(array(0,"id_user='".$id_user."'"));
			$this->joinorderby(array(0,'waktu DESC'));
			$this->joinoffset($offset);
			$this->joinlimit($limit);
			$this->joinsql();
			$result = $this->result('all');
			foreach ($result as $key => $value) {
				$result[$key]['waktu'] = date("H:i, j M Y ", strtotime($result[$key]["waktu"]));
				if($result[$key]['foto_user']!="NULL"&&!empty($result[$key]['foto_user'])){
					$base64foto = file_get_contents("../image/user/".$result[$key]['foto_user']);
					$type = explode('.', $result[$key]['foto_user']);
					$result[$key]['foto_user'] = base64_encode($base64foto);
					$result[$key]['type'] = 'data:image/' . strtolower($type[1]) . ';base64,';
				}else{
					$base64foto = file_get_contents("../image/user/default.png");
					$result[$key]['foto_user'] = base64_encode($base64foto);
					$result[$key]['type'] = 'data:image/png;base64,';
				}
			}
			echo json_encode($result);
		}
		else{
			$this->error422("Anonymous user youre not found on this system!");
		}
	}
	//digunakan oleh system untuk automatic reminder menghadiri notif
	public function newSystemNotif(){
		$ip = $_SERVER['REMOTE_ADDR'];
		if($ip === "::1"||$ip ==="127.0.0.1"){
			$this->select("id_kegiatan,nama_kegiatan,lokasi_kegiatan,tanggal_kegiatan","kegiatan","DATE(tanggal_kegiatan) = DATE(NOW())");
			$kegiatan = $this->result('all');
			$this->select('id_user','user','hak_akses <4');
			$listUser = $this->result('all');
			$dt = new DateTime();
			$dt->setTimezone(new DateTimeZone("Asia/Singapore"));
			$waktu = $dt->format('Y-m-d H:i:s');
			foreach ($kegiatan as $value) {
				$jamkegiatan = date("H:i", strtotime($value["tanggal_kegiatan"]));
				$notif = "Waktunya anda menghadiri kegiatan "
				.$value['nama_kegiatan']." jam ".$jamkegiatan." di lokasi ".$value['lokasi_kegiatan'];
				foreach($listUser as $user){
					$arrayPost = 
					array('NULL',$user['id_user'],'1',$value['id_kegiatan'],$notif,'0',$waktu,'1');
					$this->insert("notif",$arrayPost,false);
				}
			}
			$this->success("notifikasi inserted to database");
		}else{	
			$this->error404("hayo mau ngapain?");
		}
	}

	//update notif sudah di baca di database
	public function updateNotif(){
		$this->auditLogin();
		$id_notif = filter_input(INPUT_POST, 'id_notif', FILTER_SANITIZE_NUMBER_INT);
		if(!empty($id_notif)){
			$update = "status_dibaca = 1";
			$this->update('notif',$update,"id_notif='".$id_notif."'","Update Notif ".$id_notif." Success ");
		}else{
			$this->error422('Anonymous notifikasi update');
		}
	}

	//google cloud messaging for mobile every new notif
	public function sendGcm($params = array()){

	}

	//kirim gcm jam 8 pagi invoked by operating system server side
	public function sendGcm8am($token = array()){
		//todo if date match and time == 8am send gcm and new system notif
	}

	//notif checker service untuk web app
	public function longPolling($params=array()){
		$id_user = (isset($params[0])) ? preg_replace('/\D/', '', $params[0]) : null;
		if(!empty($id_user)){
			$this->select('id_notif','notif',"id_user='".$id_user."' AND status_dibaca = 0");
			$count = array("notif_count" => $this->result('count'));
			echo json_encode($count);
		}else{
			$this->error422('Anonymous user!');
		}	
	}

}


?>