
localData = {
   hname: location.hostname ? location.hostname: 'localStatus',
   isLocalStorage: window.localStorage ? true : false,
   dataDom: null,
   initDom: function(){ //初始化userData
       if(!this.dataDom){
           try{
               this.dataDom = document.createElement('input');//这里使用hidden的input元素
                this.dataDom.type = 'hidden';
                this.dataDom.style.display = "none";
                this.dataDom.addBehavior('#default#userData');//这是userData的语法
                document.body.appendChild(this.dataDom);
                var exDate = new Date();
                exDate = exDate.getDate()+30;
                this.dataDom.expires = exDate.toUTCString();//设定过期时间
            }catch(ex){
                return false;
            }
        }
        return true;
    },
    set:function(key,value){
        if(this.isLocalStorage){
            window.localStorage.setItem(key,value);
        }else{
            if(this.initDom()){
                this.dataDom.load(this.hname);
                this.dataDom.setAttribute(key,value);
                this.dataDom.save(this.hname)
            }
        }
    },
    get:function(key){
        if(this.isLocalStorage){
            return window.localStorage.getItem(key);
        }else{
            if(this.initDom()){
                this.dataDom.load(this.hname);
                return this.dataDom.getAttribute(key);
            }
        }
    },
    remove:function(key){
        if(this.isLocalStorage){
            localStorage.removeItem(key);
        }else{
            if(this.initDom()){
                this.dataDom.load(this.hname);
                this.dataDom.removeAttribute(key);
                this.dataDom.save(this.hname)
            }
        }
    }
}

COMMONMETHODS = {
    newGuid: function(nums, line) {
        var guid = "";
        for (var i = 1; i <= nums; i++){
            var n = Math.floor(Math.random()*16.0).toString(16);
            guid += n;
            if (line){
                if ((i==8)||(i==12)||(i==16)||(i==20))
                    guid += "-";
            }
        }
        return guid;
    },
    newXmlHttpRequest: function() {
        var xmlhttp;
        if (window.XMLHttpRequest)// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        else// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        return xmlhttp;
    },
    getWeixinAuthorizeUrl: function(redirect_uri, state){
        var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + COMMONCONFIGS.WX_APPID;
        url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
        url += "&response_type=code&scope=snsapi_userinfo";
        url += "&state=" + state;
        url += "#wechat_redirect";
        return url;
    },
    //%2s,%2d,%2.2f
    sprintf: function(){
        var s = arguments[0] || '',r=[],c=0;
        for(var i = 1; i < arguments.length; i++){
            r[i] = arguments[i];
        }
        return s.replace(/%([0-9.]+)?(s|d|f)/ig, function(a){
            c++;
            a = a.match(/([0-9.]+)|(s|d|f)/ig);
            if (a.length!=2){
                a[1]=a[0];
                a[0]=0;
            }
            a[1]=a[1].toLowerCase();
            if (a[1]=='f'){
                a=String(parseFloat(a[0])).split('.');
                a[0]=parseInt(a[0]);
                a[1]=parseInt(a[1]);
                var _r=String(parseFloat(r[c])).split('.'),f=_r[0].indexOf('-')!=-1;r[0]=(f?r[0].substr(1):r[0]);
                return((f?'-':'')+'0'.repeat(a[0]-_r[0].length)+_r[0]+(_r[1]?'.'+_r[1]+'0'.repeat(a[1]-_r[1].length):''));
            }
            else if(a[1]=='d'){
                a[0]=parseInt(a[0]);
                r[c]=parseInt(r[c]);
                return(r[c]<0?'-':'')+('0'.repeat(a[0]-String(r[c]).length)+(r[c]>0?r[c]:-r[c]));
            }
            else{
                a[0]=parseInt(a[0]);
                return(' '.repeat(a[0]-r[c].length)+r[c]);
            }
        });
    },
    randomString: function(len) {
    　　len = len || 32;
        // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
    　　var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    　　var maxPos = chars.length;
    　　var pwd = '';
    　　for (i = 0; i < len; i++) {
    　　　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return pwd;
    },
    setWeixinProperties: function(logo,title,desc){
        if (logo != null)
            localData.set(COMMONCONFIGS.LOCALKEY_WXLOGO, logo);
        if (title != null)
            localData.set(COMMONCONFIGS.LOCALKEY_WXTITLE, title);
        if (desc != null)
            localData.set(COMMONCONFIGS.LOCALKEY_WXDESC, desc);
    },
    getParameterValue: function(key){
        var url = window.location.href;
        var i = url.indexOf('?');
        if (i >= 0){
            var args = url.substr(i + 1);
            var reg1 = new RegExp('\\W?'+key+'=(.+?)&', 'i');
            var reg2 = new RegExp('\\W?'+key+'=(.+)', 'i');
            var r = reg1.exec(args);
            if (!r)
                r = reg2.exec(args);
            if (r) {
                return decodeURIComponent(r[1]);
            }
        }
        return null;
    }
}

String.prototype.left = function(len){
    if (len <= 0)
        return this;
    return this.substr(0, len);
};
String.prototype.right = function(len){
    return this.substr(this.length - len);
};
String.prototype.repeat=function(len){
    var result = '';
    for (var i = 0; i < len; i++){
        result += this;
    }
    return result;
};

// var g_sUserAgent = navigator.userAgent.toLowerCase();
// alert(g_sUserAgent);
// var g_bIsIpad = g_sUserAgent.match(/ipad/i) == "ipad";
// var g_bIsIphoneOs = g_sUserAgent.match(/iphone os/i) == "iphone os";
// var g_bIsMidp = g_sUserAgent.match(/midp/i) == "midp";
// var g_bIsUc7 = g_sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
// var g_bIsUc = g_sUserAgent.match(/ucweb/i) == "ucweb";
// var g_bIsAndroid = g_sUserAgent.match(/android/i) == "android";
// var g_bIsCE = g_sUserAgent.match(/windows ce/i) == "windows ce";
// var g_bIsWM = g_sUserAgent.match(/windows mobile/i) == "windows mobile";


COMMONCONFIGS = {
    WX_APPID_XYHH: "wx8d2f92fc570a5813",
    WX_APPID_XYGAME: "wxded58a7108a16130",
    WX_APPID_LXOL: "",
    LOCALKEY_WXTITLE: 'xygame_wxtitle',
    LOCALKEY_WXDESC: 'xygame_wxdesc',
    LOCALKEY_WXLOGO: 'xygame_wxlogo',
    LOCALKEY_USERINFO: 'xygame_userinfo',
}

GLOBAL = {
    appId: COMMONCONFIGS.WX_APPID_XYHH,
    userInfo: null,
    hostUrl: '',
    serverUrl: '',
}
