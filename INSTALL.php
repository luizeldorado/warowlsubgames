<?php

	echo '<pre>';

	function addLine($str,$newstr) {
		return $str.$newstr."\n";
	}

	$configfile = 'CONFIG.php';
	if (isset($_GET['f'])) {
		if (file_exists($_GET['f'])) {
			$configfile = $_GET['f'];
		}
	}

	//Insert config file (will add config vars)
	echo "Loading ".$configfile." file...\n";
	require($configfile);

	if(!$admin_password) {
		echo "Password is empty; please set it in CONFIG.php.\n";
		die;
	}

	//Check password
	if (!(isset($_GET['password']) && ($_GET['password'] === $admin_password))) {
		echo "Wrong password! Read CONFIG.php please.\n";
		die;
	}

	//Connect to sql without database
	echo "Connecting to database...\n";
	$c = new mysqli($db_host,$db_username,$db_password);
	if(!$c) {
		echo "Wrong database info! Change CONFIG.php please.\n";
		die;
	}

	//Create database with tables
	//NOTE: some systems don't allow TEXT fields to have defaults.

	$q = '
DROP DATABASE IF EXISTS `'.$db_database.'`;
CREATE DATABASE IF NOT EXISTS `'.$db_database.'` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `'.$db_database.'`;

CREATE TABLE IF NOT EXISTS `config` (
  `game_open` tinyint(1) NOT NULL,
  `game_viewermode` tinyint(1) NOT NULL,
  `twitch_client_id` text NOT NULL,
  `twitch_redirect_url` text NOT NULL,
  `twitch_channel_id` int(11) NOT NULL,
  `server_ip` text NOT NULL,
  `server_password` text NOT NULL,
  `admin_password` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `players` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userid` int(10) unsigned DEFAULT NULL,
  `username` text,
  `avatar` text,
  `token` text,
  `status` tinyint(3) unsigned DEFAULT NULL,
  `message` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO config VALUES (0,0,"'.$twitch_client_id.'", "'.$twitch_redirect_url.'", '.$twitch_channel_id.', "'.$server_ip.'", "'.$server_password.'", "'.$admin_password.'")
';

	echo "Sending database creation query...\n";

	$res = $c -> multi_query($q);
	if(!$res) {
		echo 'Database creation error: ['.$c->errno.'] '.mysqli_error($c)."\n";
		die;
	}

	//Release multi_query (needed to call other queries later)
	//while($test = $c -> next_result()) {}

	//Create internal-dbinfo.php with db vars

	echo "Creating database config file...\n";

	$s = '<?php
	/* AUTO GENERATED FILE */
	$db_host = "'.$db_host.'";
	$db_username = "'.$db_username.'";
	$db_password = "'.$db_password.'";
	$db_database = "'.$db_database.'";
?>';

	if(!file_put_contents("internal-dbinfo.php", $s)) {
		echo "Config file creation error.\n";
		die;
	}

	echo "\nDone!!!\n";
	echo "<a href='admin-index.html'>Go to the control panel.</a>";

?>