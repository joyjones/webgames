<!DOCTYPE html>
<html>
    <head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta name="viewport" content="width=320" />
		<meta charset="utf-8" />
        <title>星云小游戏 统计</title>
        <script type="text/javascript" src="../lib/js/jquery.min.js"></script>
        <script type="text/javascript" src="../lib/js/defines.js"></script>
        <script type="text/javascript" src="../lib/js/depend.js"></script>
        <link rel="stylesheet" href="../lib/css/common.css">
        <style type="text/css">
            img {
                width: 50px;
                height: 50px;
            }
        </style>
        <script type="text/javascript">
            COMMONMETHODS.setWeixinProperties("assets/images/icon.jpg", "星云小游戏 统计", "星云在线小游戏 运营统计列表");
        </script>
    </head>
    <body style="margin:0;padding:0;overflow:hidden;border:0">
        <table class="gridtable" width="100%" border="1" cellspacing="0">
            <tr>
            <th style="width:50px;height:0px"></th>
            <th>名称</th>
            <th>访问量</th>
            <th>IP数量</th>
            <th>游戏次数</th>
            </tr>
        <?php
            require('../lib/php/db.php');
            $dp = new DBProccessor();
            $baseUrl = 'http://game.xyhh.net/webgame/';
            if ($dp->open_db('webgame')){
                $rows = $dp->get_datarows('select * from project');
                foreach ($rows as $row) {
                    echo '<tr onclick="window.location.href=\''.$baseUrl.$row['name'].'\';">';
                    echo '<td><img src="'.$baseUrl.$row['name'].'/assets/images/'.$row['logo'].'"/></td>';
                    echo '<td>'.iconv('GB2312','UTF-8',$row['title']).'</td>';
                    $cdt = "project_id=".$row['id'];
                    $count = $dp->get_datarows_count('project_visit', $cdt);
                    echo '<td>'.$count.'</td>';
                    $count = $dp->get_datarows_count('project_visit', $cdt, 'visit_ip', true);
                    echo '<td>'.$count.'</td>';
                    $count = $dp->get_datarows_count('project_score', $cdt);
                    echo '<td>'.$count.'</td>';
                    echo '</tr>';
                }
                $dp->close_db();
            }
        ?>
        </table>
        <p></p>
    </body>
</html>