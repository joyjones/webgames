
COMMONCONFIGS.WX_APPID = COMMONCONFIGS.WX_APPID_XYGAME;
var EVT_TOUCH = (/Windows/.test(navigator.userAgent) ? 'mousedown' : 'touchstart');

var configs = {
	projname: 'bookpuzzle',
	mpurl: 'http://mp.weixin.qq.com/s?__biz=MjM5NjI1NDUzNQ==&mid=200617553&idx=1&sn=e64038ed336a0d0fe10775ddfdbe5914#rd',
	moreurl: 'http://game.xyhh.net/webgame/index/list.php',
	back: {
		size: {w: 0, h: 0},
	},
	gaming: {
		status: {
			prepare: -1,
			run: 0,
			finish: 1,
		},
	},
	board: {
		startsize: 2,
		datas: [],
		imgs: ['assets/images/s0.png', 'assets/images/s1.png']
	},
	words:{
		wxtitle: '【猜书达人】你喜爱阅读吗？那么来测验一下你的阅读量吧！',
		wxdesc: '你喜爱阅读吗？那么来测验一下你的阅读量吧！',
		wxtitle_share: '【猜书达人】我收获了很多！你喜爱阅读吗？那么你也来测验一下你的阅读量吧！',
		title: '你喜爱阅读吗？那么来测验一下你的阅读量吧！我们从世界历代经典及历年畅销书中，摘录出了25部作品的代表段落作为测试题。',
		help: '在开始游戏前请记住：重要的并不是正确的答案，重要的是去品味每一段文字，让它启迪、警醒、陶冶自己的内心。',
		finish: '测验结束，你获得了[[SCORE]]分！',
		ending: '&nbsp;&nbsp;&nbsp;&nbsp;谢谢你坚持做完所有题目，对于你的得分，无需去做评价，因为知识就是力量，我们想要获得的力量永远不会嫌多。<br/>&nbsp;&nbsp;&nbsp;&nbsp;在科技飞速变化、生活节奏日益加快的现代社会中，我们更应坚持把爱读书、会读书、读好书作为我们日常生活的座右铭，让这种力量为我们的美好未来服务。<br/>&nbsp;&nbsp;&nbsp;&nbsp;那么现在分享一下，让朋友们都来读书吧！',
	},
};

var board = (function(){
	var elm;
	var totalScore = 0;
	var waitingInput = false;
	var qindex = -1;
	var orders = [];
	return {
		init: function(){
			elm = $('#board');
			totalScore = 0;
			for (var i = 1; i <= 4; ++i){
				$('#a'+i).on(EVT_TOUCH, function(e){
					var id = $(this).attr('id');
					board.select(Math.floor(id.substr(1)) - 1);
				});
			}
		},
		reset: function(){
			totalScore = 0;
			qindex = -1;
			this.next();
		},
		getTotalScore: function(){
			return totalScore;
		},
		inputEnabled: function(){
			return game.getState() == configs.gaming.status.run && waitingInput;
		},
		next: function(){
			if (qindex >= 0)
				$('#result').fadeOut(300);
			orders.length = 0;
			if (++qindex >= configs.board.datas.length){
				game.finish();
				return;
			}
			var ct = '';
			if (qindex == configs.board.datas.length - 1)
				ct = '附加题';
			else
				ct = COMMONMETHODS.sprintf('第%d/%d题', qindex + 1, configs.board.datas.length - 1);
			$('#counter').html(ct);
			var ns = [0,1,2,3];
			for (var i = 0; i < 4; i++) {
				var n = Math.floor(Math.random() * ns.length);
				orders.push(ns[n]);
				ns.splice(n, 1);
			};
			var data = configs.board.datas[qindex];
			var qt = '&nbsp;&nbsp;&nbsp;&nbsp;' + data.q.replace(/\|/g, '<br/>&nbsp;&nbsp;&nbsp;&nbsp;');
			$('#q').html(qt);
			var ps = ['A. ', 'B. ', 'C. ', 'D. '];
			for (var i = 0; i < 4; ++i){
				$('#a'+(i+1))
				.html(ps[i] + data.a[orders[i]].t)
				.css({color: '#444'});
			}
			waitingInput = true;
		},
		select: function(sel){
			if (!waitingInput)
				return;
			waitingInput = false;
			i = orders[sel];
			var data = configs.board.datas[qindex];
			var img = '', txt = '', clr = '#f00';
			if (data.a[i].w > 0){
				img = configs.board.imgs[1];
				txt = '正确！';
				clr = '#0f0';
				totalScore += data.a[i].w;
			}else{
				var ci = -1;
				for (var j = 0; j < data.a.length; j++) {
					if (data.a[j].w > 0)
						ci = j;
				};
				img = configs.board.imgs[0];
				txt = '错啦！';
				if (ci >= 0){
					txt += '正确答案是：' + data.a[ci].t;
				}
			}
			var y = $('#a1')[0].offsetTop;
			$('#a'+(sel+1)).css({
				color: clr
			});
			$('#resultimg > img').attr('src', img);
			$('#resulttxt').html(txt);
			$('#result')
			.css({top: y - 100})
			.show();
			setTimeout(function(){
				board.next();
			}, 2000);
		},
		showresult: function(i, oki){

		}
	};
})();

var game = (function(){
	var lastTick = 0;
	var funcTick = null;
	var state = configs.gaming.status.prepare;
	var bestscore = -1;
	var backoffset = 0;
	var bestranking = -1;
    return {
    	updatewx: function(){
			if (bestscore > 0){
				var title = configs.words.wxtitle_share.replace('[[SCORE]]', bestscore);
				COMMONMETHODS.setWeixinProperties(
					"assets/images/icon.jpg",
					title,
					configs.words.wxdesc);
			}
			else
				COMMONMETHODS.setWeixinProperties(
					"assets/images/icon.jpg",
					configs.words.wxtitle,
					configs.words.wxdesc);
    	},
		init: function(){
	    	configs.back.size.w = $(window).width();
	    	configs.back.size.h = $(window).height();

			this.updatewx();
			board.init();
			$('#titletext').html(configs.words.title);
			$('#titletip').html(configs.words.help);
			$('#sec_welcome').show();

			$('#retry').on(EVT_TOUCH, function(e){
				e.preventDefault();
				game.start();
			});
			$('#share').on(EVT_TOUCH, function(e){
				e.preventDefault();
				$('#sharetip').show();
				setTimeout('configs.shareflag = 1;', 500);
			});
			$('#start').on(EVT_TOUCH, function(e){
				e.preventDefault();
				game.start();
			}).attr('disabled', 'disabled');
			$('#sharetip')
			.css({
				position: 'absolute',
				width: configs.back.size.w,
				height: configs.back.size.h,
				top: 0,
				left: 0,
			})
			.on(EVT_TOUCH, function(e){
				e.preventDefault();
				if (configs.shareflag == 1)
					$(this).hide();
				configs.shareflag = 0;
			});
    		$('.focus > button').on(EVT_TOUCH, function(e){
				e.preventDefault();
    			window.location.href = configs.mpurl;
			});
			$('.more > button').on(EVT_TOUCH, function(e){
				e.preventDefault();
    			window.location.href = configs.moreurl;
			});
			$('#endwords').html(configs.words.ending);

			this.visitServer();
			this.requireData();
		},
		start: function(){
			$('#sec_welcome').hide();
			$('#sec_finish').hide();
			$('#sec_game').show();
			$('body').css({
				'background-image': 'url(assets/images/back2.jpg)'
			});

			state = configs.gaming.status.run;

			lastTick = 0;
			board.reset();
		},
    	finish: function(){
    		var score = board.getTotalScore();
    		var msg = configs.words.finish.replace('[[SCORE]]', score);
    		if (bestscore < 0 || score > bestscore)
    			bestscore = score;
    		$('#score').html(msg);
    		$('#sec_game').hide();
			$('#sec_finish').show();

			this.updatewx();
			this.notifyServer();
    	},
    	getState: function(){
    		return state;
    	},
    	setRanking: function(r){
    		if (bestranking == -1 || bestranking > r){
    			bestranking = r;
				this.updatewx();
    		}
    	},
		requireData: function(){
			// if (true){
			// 	this.fillData(true, ['测试标题'], [{id:0,idx:0,ctx:'答案A',w:4},{id:0,idx:1,ctx:'答案B',w:0},{id:0,idx:2,ctx:'答案C',w:0},{id:0,idx:3,ctx:'答案D',w:0}])
			// }else		
            $.ajax({
            	url: "../lib/php/issues.php",
            	type: "post",
            	data: {
            		proj: configs.projname,
            	},
            	error: function(e1, e2, e3){
            		alert(e2+e3);
            	},
            	success: function(resp){
            		var rst = $.parseJSON(resp);
					console.log(rst);
            		game.fillData(rst.success, rst.issues, rst.results);
            	}
            });
		},
		fillData: function(ok, qs, as){
			configs.board.datas.length = 0;
			if (ok){
				for (var i = 0; i < qs.length; i++) {
					var rs = [];
					for (var j = 0; j < as.length; j++) {
						if (as[j].id == i){
							rs.push({
								t: as[j].ctx,
								w: as[j].w,
							});
						}
					}
					configs.board.datas.push({
						q: qs[i],
						a: rs
					});
				};
				$('#start').removeAttr('disabled').html('开始游戏');
			}
		},
    	visitServer: function() {
            $.ajax({
            	url: "../lib/php/visits.php",
            	type: "post",
            	data: {
            		proj: configs.projname,
            	},
            	dataType: "html"
            });
        },
    	notifyServer: function(){
    		$.ajax({
    			url: '../lib/php/records.php',
    			type: 'post',
    			data:{
    				proj: configs.projname,
    				score: bestscore,
    				gainrank: 'false',
    			},
				dataType: 'html',
    			error: function(){},
    			success: function(resp){},
    		});
    	}
    };
})();

$(function(){
	game.init();
});
