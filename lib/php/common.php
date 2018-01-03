<?php

function get_ip(){
	if (getenv('HTTP_CLIENT_IP'))
		$onlineip = getenv('HTTP_CLIENT_IP');
	else if(getenv('HTTP_X_FORWARDED_FOR'))
		$onlineip = getenv('HTTP_X_FORWARDED_FOR');
	else if(getenv('REMOTE_ADDR'))
		$onlineip = getenv('REMOTE_ADDR');
	else
		$onlineip = $HTTP_SERVER_VARS['REMOTE_ADDR'];
	return $onlineip;
}

?>