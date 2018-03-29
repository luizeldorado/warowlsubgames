<?php

	require("internal-dbinfo.php");
	error_reporting(0);
	
	function returnArrayAsJSON($array) {
		echo json_encode($array);
		die;
	}

	$return = [];
	const ERROR = -1, KEEPWAITING = 0, SELECTED = 1, NOTSELECTED = 2, INVALIDTOKEN = 3;

	//connect and args
	$c = new mysqli($db_host,$db_username,$db_password,$db_database);
	if ($c -> connect_error) {
		$return["status"] = ERROR;
		$return["error"] = "DB connection error";
		returnArrayAsJSON($return);
	}

	$token = $c->escape_string($_GET["token"]);

	//get config
	$res = $c -> query('SELECT server_ip, server_password FROM config');
	if (!$res) {
		$return["status"] = ERROR;
		$return["error"] = "DB config query error";
		returnArrayAsJSON($return);
	}

	$config = $res -> fetch_assoc();

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

	switch ($row["status"]) {
		case '0':
			$return["status"] = KEEPWAITING;
			$return["message"] = $row["message"];
			break;
		case '1':
			$return["status"] = SELECTED;
			$return["server_ip"] = $config["server_ip"];
			$return["server_password"] = $config["server_password"];
			break;
		case '2':
			$return["status"] = NOTSELECTED;
			break;
		default:
			$return["status"] = ERROR;
			$return["error"] = "DB status makes no sense.";
			break;
	}

	returnArrayAsJSON($return);

?>