<?php

require("common.php");
require("db.php");

$proj = $_REQUEST['proj'];
$rst = false;
$qs = array();
$as = null;

$dp = new DBProccessor;
if ($dp->open_db("webgame")){
 	$row = $dp->get_datarow("select id from project where name='$proj'");
 	if ($row){
 		$pid = $row['id'];
 		$rows = $dp->get_datarows("select * from project_issue where project_id=$pid");
 		foreach ($rows as $row) {
 		 	$qs []= iconv("gb2312", "utf-8", $row['issue']);
 		}
 		$rows = $dp->get_datarows("select * from project_issueresult where project_id=$pid");
 		foreach ($rows as $row) {
 		 	$as []= array(
 		 		'id' => $row['issue_id'],
 		 		'idx' => $row['result_id'],
 		 		'ctx' => iconv("gb2312", "utf-8", $row['result']),
 		 		'w' => $row['weight'],
			);
 		}
 		$rst = true;
 	}
 	$dp->close_db();
}

$results = array('success' => $rst, 'issues' => $qs, 'results' => $as);
echo json_encode($results);

?>