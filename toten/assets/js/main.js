
COMMONCONFIGS.WX_APPID = COMMONCONFIGS.WX_APPID_XYGAME;
var EVT_TOUCH = 'touchstart';

var configs = {
	mpurl: 'http://mp.weixin.qq.com/s?__biz=MjM5NjI1NDUzNQ==&mid=200617553&idx=1&sn=e64038ed336a0d0fe10775ddfdbe5914#rd',
	back: {
		size: {w: 0, h: 0},
	},
	gaming: {
		status: {
			prepare: -1,
			run: 0,
			finish: 1,
		},
		totaltime: 60,
	},
	board: {
		startsize: 2,
	},
	words:{
		wxtitle: '10分完美 - 凑齐每个数字10，做个十分完美的少年！',
		wxdesc: '凑齐每个数字10，做个十分完美的少年！',
		wxtitle_share: '【10分完美！】我得了[[SCORE]]分！',
		title: '凑齐每个数字10，做个十分完美的少年！',
		help: '<span class="mark">提示</span>：在规定时间内让你<span class="red">点击的数字相加等于10</span>，相加的数字个数越多所得分值越高！（例如：4+4+2 比 5+5 分高）',
		finish: '你获得了[[SCORE]]分！',
	},
	colors: [
		'238,238,238',
		'163,255,0',
		'255,229,42',
		'63,217,255',
		'255,73,248',
		'255,149,34',
		'53,77,255',
		'13, 255, 61',
		'161,108,255',
		'255,2,2'
	]
};

var board = (function(){
	var elm, elmStatus;
	var sizeCount;
	var numElms = [];
	var calcingSum = 0;
	var calcingValues = [];
	var calcingIds = [];
	var totalScore = 0;
	var waitingInput = false;
	var turns = 0;
	return {
		init: function(){
			elm = $('#board');
			elmStatus = $('#status');
			totalScore = 0;
			$('#refresh').on(EVT_TOUCH, function(e){
				e.preventDefault();
				board.refresh();
			});
		},
		tick: function(span){
		},
		reset: function(){
			totalScore = 0;
			turns = 0;
			$('#score').html('得分：0');
			this.setSize(configs.board.startsize);
		},
		setSize: function(s){
			sizeCount = s;
			$('.num').remove();
			numElms.length = 0;
			var gap = 6, x = gap, y = gap;
			var size = (configs.back.size.w - 36) / sizeCount - gap * 2;
			for (var i = 0; i < sizeCount; i++) {
				for (var j = 0; j < sizeCount; j++) {
					var id = i + '-' + j;
					var dom = '<div id="n'+id+'" class="num"></div>';
					elm.append(dom);
					var e = $('#n'+id);
					e.css({
						width: size,
						height: size,
						left: x,
						top: y,
						'line-height': size+'px',
						margin: gap / 2,
					});
					numElms.push(e);
					x += size + gap;
				}
				x = gap;
				y += size + gap;
			};
			elm.css({
				width: configs.back.size.w - 36,
				height: y
			});
			var me = this;
			$('.num').on(EVT_TOUCH + ' click', function(e){
				e.preventDefault();
				if (!board.inputEnabled())
					return;
				var id = $(this).attr('id');
				var n = Math.floor($(this).html());
				if (calcingIds.indexOf(id) >= 0)
					return;
				$(this).css({
					'background-color': '#888',
				});
				calcingValues.push(n);
				calcingIds.push(id);
				calcingSum += n;
				var state = '当前数字：' + calcingSum;
				var clr = '#000';
				if (calcingSum > 10){
					state += ' 超啦！';
					clr = '#f00';
					waitingInput = false;
					setTimeout(function(){
						board.refresh();
					}, 500);
				}
				else if (calcingSum == 10){
					var score = me.calcScore();
					state += ' 获得' + score + '分！';
					clr = 'rgb(31, 190, 63)';
					totalScore += score;
					if (calcingValues.length == 4)
						state += '增加2s！';
					else if (calcingValues.length >= 5)
						state += '增加4s！';
					$('#score').html('得分：'+totalScore);
					waitingInput = false;
					turns++;
					if (turns == 2)
						setTimeout(function(){
							board.setSize(configs.board.startsize + 1);
						}, 500);
					else if (turns == 20)
						setTimeout(function(){
							board.setSize(configs.board.startsize + 2);
						}, 500);
					else
						setTimeout(function(){
							board.refresh();
						}, 500);
					try{
						var snd = $('#snd_up')[0];
						snd.load();
						snd.play();
					}catch(e){}
				}
				elmStatus.html(state).css('color', clr);
			});
			this.refresh();
		},
		gainNum: function(cnt, rest, ns){
			if (cnt <= 0 || rest <= 0)
				return;
			if (cnt == 1){
				ns.push(rest);
				return;
			}
			else if (rest == 1)
				ns.push(1);
			var max = Math.round(rest / cnt);
			if (Math.random() > 0.8)
				max = rest - (cnt - 1);
			var n = Math.floor(Math.random() * max + 1);
			ns.push(n);
			this.gainNum(cnt - 1, rest - n, ns);
		},
		refresh: function(){
			calcingSum = 0;
			calcingValues.length = 0;
			calcingIds.length = 0;
			elmStatus.html('选择可相加等于10的数字！').css('color', '#000');

			var count = sizeCount * sizeCount;
			var nums = [];
			var rests = [];
			for (var i = 0; i < count; i++) {
				rests.push(i);
			};
			// console.log('-----');
			for ( ; nums.length < count && rests.length > 0; ) {
				var ns = [];
				if (rests.length <= count * 0.3){
					for (var i = 0; i < rests.length; i++) {
						ns.push(Math.floor(Math.random() * 4 + 5));
					};
				}
				else{
					var c;
					var r = Math.random();
					if (rests.length == count && count == 2 * 2)
						r = 0;
					if (r < 0.55)
						c = 2;
					else if (r < 0.75)
						c = 3;
					else if (r < 0.9)
						c = 4;
					else
						c = 5;
					this.gainNum(c, 10, ns);
				}
				// console.log(ns);
				for (var i = 0; i < ns.length && rests.length > 0; i++) {
					var n = ns[i];
					nums.push(n);
					var k = Math.floor(Math.random() * rests.length);
					numElms[rests[k]].html(n);
					numElms[rests[k]].css('background-color', 'rgba('+configs.colors[n]+',0.75)');
					rests.splice(k, 1);
				};
			};
			waitingInput = true;
		},
		calcScore: function(){
			if (calcingSum != 10 || calcingValues.length < 2)
				return 0;
			if (calcingValues.length == 4)
				timer.addTime(2);
			else if (calcingValues.length == 5)
				timer.addTime(4);
			return 10 * Math.pow(2, calcingValues.length - 2);
		},
		getTotalScore: function(){
			return totalScore;
		},
		inputEnabled: function(){
			return game.getState() == configs.gaming.status.run && waitingInput;
		}
	};
})();

var timer = (function(){
	var elm;
	var ticker = -1;
	var preticker = null;
	return {
		init: function(){
			elm = $('#timer');
		},
		reset: function(){
			ticker = -1;
			this.updateLabel();
		},
		tick: function(span){
			ticker += span;
			if (ticker > configs.gaming.totaltime)
				ticker = configs.gaming.totaltime;
			this.updateLabel();
			if (ticker == configs.gaming.totaltime)
				return configs.gaming.status.finish;
			else if (ticker < 0)
				return configs.gaming.status.prepare;
			return configs.gaming.status.run;
		},
		updateLabel: function(){
			var t = Math.floor(ticker);
			if (t < 0)
				elm.html('准备中');
			else
				elm.html('剩余：' + (configs.gaming.totaltime - t));
			if (preticker == null){
				$('#board').css('opacity', 0.5);
			}
			else if (preticker < 0 && ticker >= 0){
				$('#board').css('opacity', 1);
			}
			preticker = ticker;
		},
		getTime: function(){
			return ticker.toFixed(2);
		},
		addTime: function(span){
			if (ticker < 0)
				return;
			ticker -= span;
			if (ticker < 0)
				ticker = 0;
		}
	}
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
				if (bestranking > 0)
					title += "全球排名第"+bestranking+"！";
				else
					title += "击败你了没有？";
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
			timer.init();
			board.init();
			$('#titletext').html(configs.words.title);
			$('#titletip').html(configs.words.help);
			$('#sec_welcome').show();

			$('#bg').css({
				width: configs.back.size.w,
				height: configs.back.size.h,
			});
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
			});
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

			setInterval(function(){
				backoffset += 1;
				$('#bg').css('background-position', backoffset+'px 0px');
			}, 100);
			game.visitServer();
		},
		start: function(){
			if (funcTick != null)
				this.finish();
			$('#sec_welcome').hide();
			$('#sec_finish').hide();
			$('#sec_game').show();

			state = configs.gaming.status.run;

			lastTick = 0;
			timer.reset();
			board.reset();
			funcTick = setInterval('game.tick()', 200);
		},
    	finish: function(){
    		clearInterval(funcTick);
    		funcTick = null;
    		var score = board.getTotalScore();
    		var msg = configs.words.finish.replace('[[SCORE]]', score);
    		if (score == 0)
    			msg = 'OH MYGOD，' + msg;
    		if (bestscore < 0 || score > bestscore){
    			if (bestscore > 0)
    				msg += '刷新了你的最好成绩！';
    			bestscore = score;
    		}
    		else if (score < bestscore){
    			msg += '你的最好成绩是' + bestscore + '分，你还可以更完美！';
    		}
    		
    		$('#results').html(msg);
    		$('#sec_game').hide();
			$('#sec_finish').show();

			this.updatewx();
			this.notifyServer();
    	},
    	tick: function(){
    		var t = (new Date()).getTime();
    		if (lastTick > 0){
	    		var span = (t - lastTick) * 0.001;
	    		state = timer.tick(span);
	    		if (state == configs.gaming.status.finish){
		    		this.finish();
	    		}
    		}
			lastTick = t;
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
    	visitServer: function() {
            $.ajax({
            	url: "../lib/php/visits.php",
            	type: "post",
            	data: {
            		proj: "toten",
            	},
            	dataType: "html"
            });
        },
    	notifyServer: function(){
    		$.ajax({
    			url: '../lib/php/records.php',
    			type: 'post',
    			data:{
    				proj: 'toten',
    				score: bestscore,
    				gainrank: 'true',
    				ascending: 'true',
    			},
				dataType: 'html',
    			error: function(){},
    			success: function(resp){
					var rst = $.parseJSON(resp);
					if (rst.success){
    					var msg = $('#results').html();
    					msg += "你的朋友们最好成绩是"+rst.bestscore+"分，";
    					msg += "你获得了第"+rst.ranking+"名！";
    					$('#results').html(msg);
						game.setRanking(rst.ranking);
					}
    			},
    		});
    	}
    };
})();

$(function(){
	game.init();
});
