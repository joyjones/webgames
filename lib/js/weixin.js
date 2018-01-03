(function() {
    $(document).ready(function(e) {
        function shareFriend() {
            WeixinJSBridge.invoke("sendAppMessage", {
                appid: COMMONCONFIGS.WX_APPID,
                img_url: tmpLineLink + localData.get(COMMONCONFIGS.LOCALKEY_WXLOGO),
                img_width: "200",
                img_height: "200",
                link: lineLink,
                desc: localData.get(COMMONCONFIGS.LOCALKEY_WXDESC),
                title: localData.get(COMMONCONFIGS.LOCALKEY_WXTITLE)
            }, function() {
            })
        }
        function shareTimeline() {
            WeixinJSBridge.invoke("shareTimeline", {
                img_url: tmpLineLink + localData.get(COMMONCONFIGS.LOCALKEY_WXLOGO),
                img_width: "200",
                img_height: "200",
                link: lineLink,
                desc: localData.get(COMMONCONFIGS.LOCALKEY_WXDESC),
                title: localData.get(COMMONCONFIGS.LOCALKEY_WXTITLE)
            }, function() {
            })
        }
        function shareWeibo() {
            WeixinJSBridge.invoke("shareWeibo", {
                content: localData.get(COMMONCONFIGS.LOCALKEY_WXDESC),
                url: lineLink
            }, function() {
            })
        }
        var lineLink = window.location.href;
        linkhead = lineLink.indexOf("?") > 0 ? lineLink.split("?")[0] : lineLink;
        tmpLineLink = linkhead.substring(0, linkhead.lastIndexOf("/") + 1);

        document.addEventListener("WeixinJSBridgeReady", function() {
            WeixinJSBridge.on("menu:share:appmessage", function() {
                shareFriend()
            }), WeixinJSBridge.on("menu:share:timeline", function() {
                shareTimeline()
            }), WeixinJSBridge.on("menu:share:weibo", function() {
                shareWeibo()
            })
        }, !1);
    });
})();
