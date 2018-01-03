<?php

require("common.php");
require("db.php");

$ip = get_ip();
$proj = $_REQUEST['proj'];
$time = date('Y-m-d H:i:s', time());

if ($ip != '::1' && $ip != '127.0.0.1' && !(strlen($ip) > 8 && substr($ip, 0, 8) == '192.168.')){
	$dp = new DBProccessor;
	if ($dp->open_db("webgame")){
		$row = $dp->get_datarow("select id from project where name='$proj'");
		if ($row){
			$fields = 'project_id,time,visit_ip';
			$params = array($row['id'],$time,$ip);
			$dp->query_db("insert into project_visit ($fields) values (?,?,?)", $params);
		}
		$dp->close_db();
	}
}

?>