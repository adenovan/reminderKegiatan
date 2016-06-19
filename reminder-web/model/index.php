<?php
require "config.php";
require "router.php";
header('Content-Type: application/json;charset=utf-8');
header('Access-Control-Allow-Origin: *'); 
define( 'API_ACCESS_KEY', '' );
$router = new Router;
?>