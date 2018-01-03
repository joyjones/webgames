<?php
/**
* base db processor
*/
class DBProccessor
{
    protected $con = null;
    protected $info = array("Database" => "", "UID" => "xylx" , "PWD" => "1qazXSW@asd");
    protected $server = '127.0.0.1,28743';
    protected $logFile = 'files/dberrors.txt';
    public function open_db($dbname) {
        $this->close_db();
        $this->info["Database"] = $dbname;
        $this->con = sqlsrv_connect($this->server, $this->info);
        if ($this->con){
            return true;
        }
        $this->record_error('[open_db failed]');
        return false;
    }

    public function close_db() {
        if ($this->con)
            sqlsrv_close($this->con);
        $this->con = null;
    }

    public function get_datarow($sql){
    	$stmt = sqlsrv_query($this->con, $sql);
		if ($stmt)
			return sqlsrv_fetch_array($stmt, SQLSRV_FETCH_BOTH);
		return false;
    }

    public function get_datarows($sql){
        $ary = array();
        $stmt = sqlsrv_query($this->con, $sql);
        while ($stmt && $dr = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_BOTH))
            $ary[] = $dr;
        return $ary;
    }

	public function get_datarows_count($tb, $condt = '', $field = '*', $distinct = false){
        if (strlen($condt) > 0)
            $condt = 'where '.$condt;
        if ($distinct)
            $cdt = "select count(distinct($field)) as count from $tb $condt";
        else
            $cdt = "select count($field) as count from $tb $condt";
		$row = $this->get_datarow($cdt);
		if ($row)
			return $row['count'];
		return 0;
    }

    public function query_db($sql, $params){
        $stmt = sqlsrv_query($this->con, $sql, $params);
        if ($stmt)
            return true;
        $this->record_error('[query_db failed]');
    	return false;
    }

    protected function record_error($msg){
        file_put_contents($this->logFile, $msg.print_r(sqlsrv_errors(), true), FILE_APPEND);
    }
}
?>