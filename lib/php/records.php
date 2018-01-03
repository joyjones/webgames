<?php

require("common.php");
require("db.php");

$ip = get_ip();
$proj = $_REQUEST['proj'];
$score = $_REQUEST['score'];
$gainrank = isset($_REQUEST['gainrank']) ? ($_REQUEST['gainrank'] == 'true' ? true : false) : false;
$ascending = isset($_REQUEST['ascending']) ? ($_REQUEST['ascending'] == 'true' ? true : false) : true;
$time = date('Y-m-d H:i:s', time());
$openid = '<unknown>';

$bestscore = null;
$ranking = 0;
$rst = false;

if ($ip != '::1' && $ip != '127.0.0.1' && !(strlen($ip) > 8 && substr($ip, 0, 8) == '192.168.')){
	$dp = new DBProccessor;
	if ($dp->open_db("webgame")){
		$row = $dp->get_datarow("select id from project where name='$proj'");
		if ($row){
			$pid = $row['id'];
			$fields = 'project_id,time,score,open_id,visit_ip';
			$params = array($pid, $time, $score, $openid, $ip);
			$dp->query_db("insert into project_score ($fields) values (?,?,?,?,?)", $params);

			if ($gainrank){
				$sql = "select top (1) score from project_score where project_id=$pid order by score";
				if ($ascending)
					$sql .= " desc";
				$row = $dp->get_datarow($sql);
				$bestscore = $row['score'];

				$sql = "select count(id) as cnt from project_score where project_id=$pid and score";
				if ($ascending)
					$sql .= ">$score";
				else
					$sql .= "<$score";
				$row = $dp->get_datarow($sql);
				$ranking = $row['cnt'] + 1;
			}
			$rst = true;
		}
		$dp->close_db();
	}
}

$results = array('success' => $rst, 'bestscore' => $bestscore, 'ranking' => $ranking);
echo json_encode($results);

?>