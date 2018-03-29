<?php

	require("internal-dbinfo.php");
	header('Content-Type: application/json');
	//error_reporting(0);
		
	function returnArrayAsJSON($array) {
		echo json_encode($array);
		die;
	}

	$return = [];

	const ERROR = -1, OK = 0, INVALIDTOKEN = 3;

	//connect and args
	$c = new mysqli($db_host,$db_username,$db_password,$db_database);
	if ($c -> connect_error) {
		$return["status"] = ERROR;
		$return["error"] = "DB connection error";
		returnArrayAsJSON($return);
	}

	$token = $c->escape_string($_GET["token"]);
	
	$omessage = mb_substr($_GET["message"],0,256);
	$message = $c->escape_string($omessage);

	//get config
	// $res = $c -> query('SELECT server_ip, server_password FROM config');
	// if (!$res) {
	// 	$return["status"] = ERROR;
	// 	$return["error"] = "DB config query error";
	// 	returnArrayAsJSON($return);
	// }

	// $config = $res -> fetch_assoc();

	//check status
	$res = $c -> query('SELECT * FROM players WHERE token="'.$token.'"');
	if (!$res) {
		$return["status"] = ERROR;
		$return["error"] = "DB check player query error";
		returnArrayAsJSON($return);
	}

	$row = $res -> fetch_assoc();
	if (!$row) {
		$return["status"] = INVALIDTOKEN;
		returnArrayAsJSON($return);
	}

	$res = $c -> query('UPDATE players SET message="'.$message.'" WHERE token="'.$token.'"');
	if (!$res) {
		$return["status"] = ERROR;
		$return["error"] = "DB update message query error";
		returnArrayAsJSON($return);
	}

	$return["message"] = $omessage;
	$return["status"] = OK;
	returnArrayAsJSON($return);

?>