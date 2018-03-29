<?php

	require("internal-dbinfo.php");
	error_reporting(0);
	
	function returnArrayAsJSON($array) {
		echo json_encode($array);
		die;
	}

	$return = [];
	const ERROR = -1;

	//connect and args
	$c = new mysqli($db_host,$db_username,$db_password,$db_database);
	if ($c -> connect_error) {
		$return["status"] = ERROR;
		$return["error"] = "DB connection error";
		returnArrayAsJSON($return);
	}

	//get config
	$res = $c -> query('SELECT game_open, game_viewermode FROM config');
	if (!$res) {
		$return["status"] = ERROR;
		$return["error"] = "DB config query error";
		returnArrayAsJSON($return);
	}
	$config = $res -> fetch_assoc();

	$return["status"] = 0;
	$return["open"] = intval($config["game_open"]);
	$return["viewermode"] = intval($config["game_viewermode"]);
	returnArrayAsJSON($return);

?>