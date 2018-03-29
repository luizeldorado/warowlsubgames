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

		if(isset($_GET["password"]) && $_GET["password"]!="") {
			$c = new mysqli($db_host,$db_username,$db_password,$db_database);
			if ($c -> connect_error) {
				http_response_code(500); die;
			}

			$password = $c -> escape_string($_GET["password"]);

			$res = $c -> query('UPDATE config SET admin_password="'.$password.'"');
			if (!$res) {
				http_response_code(500); die;
			}

			$return["status"] = 1;
		} else {
			$return["status"] = 0;
		}

		returnArrayAsJSON($return);

	} else {
		http_response_code(403); //?
	}

?>