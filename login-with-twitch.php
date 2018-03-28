<?php
	
	require("internal-dbinfo.php");
	error_reporting(0);

	$c = new mysqli($db_host,$db_username,$db_password,$db_database);
	if ($c -> connect_error) {
		echo "Room under renovations.";
		die;
	}

	$res = $c -> query('SELECT twitch_client_id, twitch_redirect_url FROM config');
	if (!$res) {
		echo "(It seems busy.)"; //vaguest error message ever?
		die;
	}

	$config = $res -> fetch_assoc();

	header('Location: https://id.twitch.tv/oauth2/authorize?client_id='.$config['twitch_client_id'].'&redirect_uri='.$config['twitch_redirect_url'].'&response_type=token&scope=user_subscriptions user_read');

?>