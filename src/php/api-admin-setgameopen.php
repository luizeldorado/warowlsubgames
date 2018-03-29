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

		if (!isset($_GET["open"])) {
			http_response_code(500); die;
		}
		$open = $_GET["open"];

		$res = $c -> query('UPDATE config SET game_open="'.$open.'"');
		if (!$res) {
			http_response_code(500); die;
		}

		if ($open == 1) {
			//clear players table
			$res = $c -> query('DELETE FROM players WHERE 1');
			if (!$res) {
				http_response_code(500); die;
			}
		} else {
			//change all statuses to 2
			$res = $c -> query('UPDATE players SET status=2 WHERE status=0');
			if (!$res) {
				http_response_code(500); die;
			}
		}

		returnArrayAsJSON($return);

	} else {
		http_response_code(403); //?
	}

?>