<?php
class wxEntry {
  private $appId;
  private $appSecret;

  public function __construct($appId="wx706693a3b8c06727", $appSecret="8746c9934263bc1cdbf9cf330f20567a") {
    $this->appId = $appId;
    $this->appSecret = $appSecret;
  }

  public function saveJson($name, $content){
    $mmc = memcache_init();
    if($mmc == false)
        echo "mc init failed\n";
    else
        memcache_set($mmc, $name, $content);
  }

  public function getJson($name){
    $mmc = memcache_init();
    if($mmc == false)
        return "";
    else
        return memcache_get($mmc, $name);
  }

  public function getSignPackage($url) {
    $jsapiTicket = $this->getJsApiTicket();
    if (!$url || !strlen($url))
      $url = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    $timestamp = time();
    $nonceStr = $this->createNonceStr();

    // 这里参数的顺序要按照 key 值 ASCII 码升序排序
    $string = "jsapi_ticket=$jsapiTicket&noncestr=$nonceStr&timestamp=$timestamp&url=$url";

    $signature = sha1($string);

    $signPackage = array(
      "appId"     => $this->appId,
      "nonceStr"  => $nonceStr,
      "timestamp" => $timestamp,
      "url"       => $url,
      "signature" => $signature,
      "rawString" => $string
    );
    return $signPackage; 
  }

  private function createNonceStr($length = 16) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    $str = "";
    for ($i = 0; $i < $length; $i++) {
      $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
    }
    return $str;
  }

  private function getJsApiTicket() {
    $time = date('Y-m-d H:i:s',time());

    $ctx = $this->getJson("jsapi_ticket");
    $data = json_decode($ctx);
    if (!$data || strlen($ctx) == 0){
      $data = json_decode(json_encode(array('expire_time' => 1, 'jsapi_ticket' => 0)));
    }
    $ticket = '';
    if ($data->expire_time < time()) {
      $accessToken = $this->getAccessToken();
      $url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=$accessToken";
      $res = json_decode($this->httpGet($url));
      $ticket = $res->ticket;

      if ($ticket) {
        $data->expire_time = time() + 7000;
        $data->jsapi_ticket = $ticket;
        $this->saveJson("jsapi_ticket", json_encode($data));
      }
    } else {
      $ticket = $data->jsapi_ticket;
    }

    return $ticket;
  }

  private function getAccessToken() {
    $time = date('Y-m-d H:i:s',time());

    $data = json_decode($this->getJson("access_token"));
    if (!$data || $data->expire_time < time()) {
      $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$this->appId&secret=$this->appSecret";
      $res = json_decode($this->httpGet($url));
      $access_token = $res->access_token;

      if ($access_token) {
        $data->expire_time = time() + 7000;
        $data->access_token = $access_token;
        $this->saveJson("access_token", json_encode($data));
      }
    } else {
      $access_token = $data->access_token;
    }

    return $access_token;
  }

  private function httpGet($url) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 500);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_URL, $url);

    $res = curl_exec($curl);
    curl_close($curl);

    return $res;
  }
}

$entry = new wxEntry();

if (isset($_SERVER['HTTP_REFERER']))
  $url = $_SERVER['HTTP_REFERER'];
else
  $url = $_SERVER["REQUEST_URI"];

$data = $entry->GetSignPackage($url);
echo json_encode($data);

