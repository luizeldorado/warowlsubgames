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

		$res = $c -> query('SELECT userid, avatar, username, message, status FROM players');
		if (!$res) {
			http_response_code(500); die;
		}

		$return['players'] = array();
		while ($player = $res -> fetch_assoc()) {
			$return['players'][] = array(
				'userid' => $player['userid'],
				'avatar' => $player['avatar'],
				'username' => $player['username'],
				'message' => $player['message'],
				'status' => $player['status']
			);
		}

		returnArrayAsJSON($return);

	} else {
		http_response_code(403); die;
	}
?>