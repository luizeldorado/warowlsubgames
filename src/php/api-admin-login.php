<?php
	session_start();
	require("internal-dbinfo.php");
	error_reporting(0);
	
	function returnArrayAsJSON($array) {
		echo json_encode($array);
		die;
	}

	$return = [];

	if(isset($_GET["password"])) {

		$password = $_GET["password"];

		$c = new mysqli($db_host,$db_username,$db_password,$db_database);
		if ($c -> connect_error) {
			http_response_code(500); die;
		}

		$res = $c -> query('SELECT admin_password, server_ip, server_password, game_viewermode, game_open FROM config');
		if (!$res) {
			http_response_code(500); die;
		}
		
		$config = $res -> fetch_assoc();

		if ($password === $config["admin_password"]) {
			$_SESSION["logged"] = true;

			$return["server_ip"] = $config["server_ip"];
			$return["server_password"] = $config["server_password"];
			$return["game_viewermode"] = intval($config["game_viewermode"]);
			$return["game_open"] = intval($config["game_open"]);
			
			$return["logged"] = true;
			returnArrayAsJSON($return);
		}

	}

	$_SESSION = array();
	$return["logged"] = false;
	returnArrayAsJSON($return);

?>