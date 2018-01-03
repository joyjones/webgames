<!DOCTYPE html>
<html>
    <head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta name="viewport" content="width=320" />
		<meta charset="utf-8" />
        <title>星云小游戏</title>
        <script type="text/javascript" src="../lib/js/jquery.min.js"></script>
        <script type="text/javascript" src="../lib/js/defines.js"></script>
        <script type="text/javascript" src="../lib/js/depend.js"></script>
        <link rel="stylesheet" href="../lib/css/common.css">
        <script type="text/javascript">
            COMMONMETHODS.setWeixinProperties("assets/images/icon.jpg", "星云小游戏", "星云在线小游戏");
        </script>
        <style type="text/css">
            body{
                background-image: url(assets/images/back.jpg);
                background-size: 100% 100%;
                background-attachment: fixed;
            }
            img {
                width: 50px;
                height: 50px;
            }
            table.gridtable td {
                background-color: rgba(255, 255, 255, 0.67);
            }
            button{
                font-size: 1.1em;
                font-weight: bold;
                padding: 4px 16px;
                border: 2px solid;
                border-radius: 16px;
                background-color: rgba(255, 252, 189, 0.75);
            }
            .focus{
                font-size: 1.1em;
                position: absolute;
                width: 100%;
                text-align: center;
                bottom: 10px;
            }
        </style>
    </head>
    <body style="margin:0;padding:0;overflow:hidden;border:0">
        <table class="gridtable" width="100%" border="1" cellspacing="0">
            <tr>
                <th style="width:50px;height:0px"></th>
                <th>游戏名称</th>
                <th>游戏热度</th>
            </tr>
        <?php
            $projs = array(
                array('name' => 'lovebridge', 'title' => '牛哥与织妹', 'logo' => 'icon.png'),
                array('name' => 'killinsects', 'title' => '害虫来了', 'logo' => 'icon.png'),
                array('name' => 'toten', 'title' => '10分完美', 'logo' => 'icon.jpg'),
                array('name' => 'moonpuzzle', 'title' => '中秋拼图大挑战', 'logo' => 'icon.jpg'),
                array('name' => 'runner', 'title' => '超越博尔特', 'logo' => 'icon.jpg'),
                array('name' => 'crusher', 'title' => '睡前行动', 'logo' => 'icon.png'),
                array('name' => 'bookpuzzle', 'title' => '猜书达人', 'logo' => 'icon.jpg'),
            );

            foreach ($projs as $proj) {
                echo '<tr onclick="window.location.href=\'../'.$proj['name'].'\';">';
                echo '<td><img src="../'.$proj['name'].'/assets/images/'.$proj['logo'].'"/></td>';
                echo '<td>'.$proj['title'].'</td>';
                echo '<td>--</td>';
                echo '</tr>';
            }
        ?>
        </table>
        <div class="focus">
            <a href="http://mp.weixin.qq.com/s?__biz=MjM5NjI1NDUzNQ==&mid=200617553&idx=1&sn=e64038ed336a0d0fe10775ddfdbe5914#rd"><button>欢迎关注星云游戏</button></a>
        </div>
    </body>
</html>