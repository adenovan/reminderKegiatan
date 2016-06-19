<?php

class Router {

	public function __construct(){
		$requestUrl = isset($_GET['params']) ? $_GET['params'] : null;
		//register core model class di sini , (XSS PREVENTION) (FILE INJECTION PREVENTION)
		$safeUrl= array('Kegiatan','User','Ukm','Panitia','Notif');
		
		$uri = explode('/',$requestUrl);
		$classname = ucfirst(array_shift($uri));
		$method = strtolower(array_shift($uri));
		//TODO SESSION FUCKED ID
		session_start();
		$params = count($uri) > 0 ? $uri : null;
		if(!in_array($classname, $safeUrl ) || !file_exists("core/".$classname.'.php')){
			http_response_code(404);
			echo json_encode(array('error'=>'404 Page not found'));
			die();
		}else{
			$class = new $classname;
			if(method_exists($class, $method)){
				if(empty($params)){
					call_user_func(array($class,$method));
				}else{
					call_user_func(array($class,$method), $params);
				}
				$ip = getenv('HTTP_CLIENT_IP')?:
				getenv('HTTP_X_FORWARDED_FOR')?:
				getenv('HTTP_X_FORWARDED')?:
				getenv('HTTP_FORWARDED_FOR')?:
				getenv('HTTP_FORWARDED')?:
				getenv('REMOTE_ADDR');
				$login = isset($_SESSION['login']) ? $_SESSION['login'] : "error";
				$akses = isset($_SESSION['hakakses']) ? $_SESSION['hakakses'] : "error";
				$current = file_get_contents("session.txt");
				$current .= "IP : ".$ip.",ID : ".$login.", hak_akses : ".$akses." SID : ".session_id()."\n";
				file_put_contents('session.txt', print_r($current,true));
			}else{
				http_response_code(404);
				echo json_encode(array('error'=>'404 Method not found'));
				die();
			}
		}
	}

}


?>