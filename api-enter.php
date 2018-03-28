<?php
	
	require("internal-dbinfo.php");
	error_reporting(0);
	
	function returnArrayAsJSON($array) {
		echo json_encode($array);
		die;
	}

	$return = [];
	const ERROR = -1, ENTERED = 0, ALREADYENTERED = 1, NOTSUBSCRIBED = 2, NOTOPEN = 3;

	//connect and args
	$c = new mysqli($db_host,$db_username,$db_password,$db_database);
	if ($c -> connect_error) {
		$return["status"] = ERROR;
		$return["error"] = "DB connection error";
		returnArrayAsJSON($return);
	}

	$token = $c->escape_string($_GET["token"]);

	//get config
	$res = $c -> query('SELECT twitch_client_id, game_open, game_viewermode, twitch_channel_id FROM config');
	if (!$res) {
		$return["status"] = ERROR;
		$return["error"] = "DB config query error";
		returnArrayAsJSON($return);
	}
	$config = $res -> fetch_assoc();

	//set http headers
	$headers = array(
		"Accept: application/vnd.twitchtv.v5+json",
		"Client-ID: ".$config["twitch_client_id"],
		"Authorization: OAuth ".$token
	);

	function curlGet($url,$headers) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$result = curl_exec($ch);
		curl_close($ch);
		return $result;
	}

	//get user id
	$curl = curlGet("https://api.twitch.tv/kraken/user",$headers);
	if (!$curl) {
		$return["status"] = ERROR;
		$return["error"] = "Can't connect with Twitch User";
		returnArrayAsJSON($return);
	}
	$result = json_decode($curl);

	if (property_exists($result,'error')) {
		$return["status"] = ERROR;
		$return["error"] = "Twitch User API: Error ".$result->{'message'};
		returnArrayAsJSON($return);
	}

	$userid = $result->{'_id'};
	$username = $result->{'display_name'};
	$useravatar = $result->{'logo'};

	$return["username"] = $username;
	$return["avatar"] = $useravatar;

	//check if in database
	$res = $c -> query('SELECT * FROM players WHERE userid="'.$userid.'"');
	if (!$res) {
		$return["status"] = ERROR;
		$return["error"] = "DB check player query error";
		returnArrayAsJSON($return);
	}

	$row = $res -> fetch_row();
	if ($row) {
		$res = $c -> query('UPDATE players SET token="'.$token.'" WHERE userid="'.$userid.'"');
		if (!$res) {
			$return["status"] = ERROR;
			$return["error"] = "DB update player query error";
			returnArrayAsJSON($return);
		}
		$return["status"] = ALREADYENTERED;
		returnArrayAsJSON($return);
	} else {
		//check if game is open
		if (!$config["game_open"]) {
			$return["status"] = NOTOPEN;
			returnArrayAsJSON($return);
		} else {

			//if NOT in viewer mode, check if actually subscribed
			if (!$config["game_viewermode"]) {
				//check if subscribed to channel
				$curl = curlGet("https://api.twitch.tv/kraken/users/".$userid."/subscriptions/".$config["twitch_channel_id"],$headers);
				if (!$curl) {
					$return["status"] = ERROR;
					$return["error"] = "Can't connect with Twitch Subscriptions";
					returnArrayAsJSON($return);
				}
				$result = json_decode($curl);

				//for some reason, twitch sends "not subscribed" as an error, and I can't seems to diferentiate it from others.
				/*
				if (property_exists($result,'error')) {
					$return["status"] = ERROR;
					$return["error"] = "Twitch Subscriptions API: Error ".$result->{'message'};
					returnArrayAsJSON($return);
				}
				*/

				if (!property_exists($result,'_id')) {
					//not subbed
					$return["status"] = NOTSUBSCRIBED;
					returnArrayAsJSON($return);
				}
			}

			$res = $c -> query('INSERT INTO players (userid,username,avatar,token,status) VALUES ("'.$userid.'","'.$username.'","'.$useravatar.'","'.$token.'",0)');
			if (!$res) {
				$return["status"] = ERROR;
				$return["error"] = "DB insert player query error";
				returnArrayAsJSON($return);
			}
			$return["status"] = ENTERED;
		}
	}
	
	returnArrayAsJSON($return);

?>