<?php
	session_start();
	require("internal-dbinfo.php");
	error_reporting(0);
	
	function returnArrayAsJSON($array) {
		echo json_encode($array);
		die;
	}

	$return = [];

	if(isset($_SESSION["logged"]) && $_SESSION["logged"]==true) {

		$c = new mysqli($db_host,$db_username,$db_password,$db_database);
		if ($c -> connect_error) {
			http_response_code(500); die;
		}

		if (!isset($_GET["state"])) {
			http_response_code(500); die;
		}
		$state = $_GET["state"];

		$res = $c -> query('UPDATE config SET game_viewermode="'.$state.'"');
		if (!$res) {
			http_response_code(500); die;
		}

		returnArrayAsJSON($return);

	} else {
		http_response_code(403); //?
	}

?>