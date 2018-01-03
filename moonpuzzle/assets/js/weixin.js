var weixin = {
    debug: false,
    info: {
        title: '定制我的健康家园',
        desc: '挑战涂料安全游戏，赢百色熊好礼！',
        imgUrl: 'http://behr.sinaapp.com/health/images/logo.jpg'
    },
    fillShare: function(info) {
        wx.onMenuShareAppMessage(info);
        wx.onMenuShareTimeline(info);
    },
    init: function(callbk){
        if (this.debug) return;
        $.ajax({
            url: '../lib/wxentry.php',
            dataType: 'json',
            error: function(r, s, e){
                console.log(s, e);
                alert('访问微信入口功能失败！');
            },
            success: function(resp){
                wx.ready(function () {
                    weixin.fillShare($.extend({}, weixin.info, {
                        type: 'link',
                        link: window.location.href,
                        success: function() {
                            // $.ajax({
                            //     url: getLocalUrl() + 'signup.php?act=record&field=shared_count',
                            // });
                        }
                    }));
                    callbk && callbk();
                });

                wx.config({
                    debug: false,
                    appId: resp.appId,
                    timestamp: resp.timestamp,
                    nonceStr: resp.nonceStr,
                    signature: resp.signature,
                    jsApiList: [
                        'onMenuShareAppMessage',
                        'onMenuShareTimeline',
                    ]
                });
            }
        });

        wx.error(function (res) {
            // alert('微信接口错误:' + res.errMsg);
        });
    }
};