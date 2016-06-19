<?php
define("SITE_NAME" 				, "api.pk3reminder.com"); //setting nama website
define("SITE_DB"				, "reminder");		//setting nama database
define("SITE_DB_DRIVER"			, "mysql");				//setting driver pdo
define("SITE_DB_HOST"			, "127.0.0.1");			//setting nama host
define("SITE_DB_USERNAME" 		, "root");				//setting username database
define("SITE_DB_PASSWORD"		, "");					//setting password database
define("SITE_UNDER_MAINTENANCE"	, false);				//setting status maintenance
define("SITE_DIR" 				, __DIR__); 			//site directory
spl_autoload_register('autoload');						//auto include

	function autoload($classname){
		include "core/".$classname.".php";
	}

?>