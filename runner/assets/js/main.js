
COMMONCONFIGS.WX_APPID = COMMONCONFIGS.WX_APPID_XYGAME;

var configs = {
	mpurl: 'http://mp.weixin.qq.com/s?__biz=MjM5NjI1NDUzNQ==&mid=200617553&idx=1&sn=e64038ed336a0d0fe10775ddfdbe5914#rd',
	system: {
		touches:{
			start: 'touchstart',
			move: 'touchmove',
			end: 'touchend',
		}
	},
	back: {
		size: {w: 0, h: 0},
	},
	gaming: {
		status: {
			prepare: -1,
			run: 0,
			finish: 1,
		},
		totaltime: 6000,
	},
	tracker: {
		foot:{ w: 64, h: 125 }
	},
	words:{
		wxtitle: '【我尼玛用手指就能跑过博尔特】你的手指是百米健将，你知道吗？',
		wxdesc: '在规定时间内使用你的食指和中指轮番向下滑动，向百米终点冲刺！',
		wxtitle_share: '【我尼玛用手指就能跑过博尔特】跑完百米我用了[[SCORE]]秒！',
		title: '博尔特的9秒58，你能破他的纪录吗？',
		help: '<span class="mark">提示</span>：在规定时间内使用你的<span class="red">食指和中指轮番向下滑动</span>，向百米终点冲刺！',
		finish: '跑完百米你用了[[SCORE]]秒！',
	},
};

var ruler = (function(){
	var elmRoot,
		elmLine,
		markers = [],
		rgn,
		convertRate = 0.0075,
		finishM = 100,
		meter = 0;
	return {
		init: function(){
			rgn = tracker.getRegion();
			elmRoot = $('#ruler')
			.show()
			.css({
				width: configs.back.size.w,
				height: configs.back.size.h,
				left: 0,
				top: 0
			});
			elmLine = $('#line');
		},
		reset: function(){
			var my = rgn.t + 20;
			for (var i = 0; i < markers.length; i++) {
				markers[i].elm.remove();
			};
			markers.length = 0;
			for (var i = 0; i < 5; ++i){
				var dom = '<div class="rulermarker" id="rulermarker'+i+'">'+i+' m</div>';
				elmRoot.append(dom);
				var e = $('#rulermarker' + i);
				e.css({top: my});
				markers.push({
					elm: $('#rulermarker' + i),
					m: i,
					y: my,
				});
				my -= 1 / convertRate;
			}
			meter = 0;
			elmLine
			.show()
			.attr({
				width: configs.back.size.w,
			})
			.css({
				left: 0,
				top: rgn.t,
			});
			elmRoot.show();
			this.updateUi();
		},
		tick: function(vel, span){
			var finished = false;
			var dy = vel * span;
			if (dy > 0){
				meter += dy;
				for (var i = 0; i < markers.length; i++) {
					var k = markers[i];
					k.y += dy;
				};
				if (meter * convertRate >= finishM){
					meter = finishM / convertRate;
					finished = true;
				}
			}
			this.updateUi();
			return !finished;
		},
		finish: function(){
			for (var i = 0; i < markers.length; i++) {
				markers[i].elm.remove();
			};
			markers.length = 0;
			elmLine.hide();
			elmRoot.hide();
		},
		updateUi: function(){
			var realMeter = meter * convertRate;
			$('#bg').css('background-position', '0px '+meter+'px');
			$('#score').html(realMeter.toFixed(2) + '米');
			for (var i = 0; i < markers.length; i++) {
				var k = markers[i];
				k.elm.css({top: k.y});
			};
			var klast = markers[markers.length - 1];
			while(klast.m < finishM){
				var k = markers[0];
				if (k.y < configs.back.size.h)
					break;
				k.y = klast.y - 1 / convertRate;
				k.m = klast.m + 1;
				k.elm.html(k.m + ' m');
				klast = k;
				markers.splice(0, 1);
				markers.push(k);
			}
			if (klast.m == finishM)
				elmLine.show().css({top: klast.y - 20});
			else if (markers[0].m == 0)
				elmLine.show().css({top: markers[0].y - 20});
			else
				elmLine.hide();
		}
	}
})();

var tracker = (function(){
	var curSide = -1,
		touching = true,
		touches = [],
		runningRgn = null,
		velocity = 0,
		friction = 480,
		helper,
		helpTimes = 0,
		foots = [];
	return {
		init: function(){
			runningRgn = {
				l: 10,
				r: configs.back.size.w - 10,
				t: configs.back.size.h * 0.5,
				b: configs.back.size.h * 0.9
			};
			var fw = configs.tracker.foot.w / 640 * configs.back.size.w,
			fh = configs.tracker.foot.h / 640 * configs.back.size.w,
			fx1 = runningRgn.l + (runningRgn.r - runningRgn.l) * 0.25,
			fx2 = runningRgn.r - (runningRgn.r - runningRgn.l) * 0.25,
			fy = runningRgn.t + (runningRgn.b - runningRgn.t) * 0.5;
			var f1 = $('#foot1')
			.attr({width: fw})
			.css({
				left: fx1 - fw * 0.5,
				top: fy - fh * 0.5,
			});
			var f2 = $('#foot2')
			.attr({width: fw})
			.css({
				left: fx2 - fw * 0.5,
				top: fy - fh * 0.5,
			});
			foots.push({
				elm: f1,
				pos: null,
				ticker: 0,
				fid: -1,
				rgn: {
					l: runningRgn.l,
					r: runningRgn.l + (runningRgn.r - runningRgn.l) * 0.5,
				}
			});
			foots.push({
				elm: f2,
				pos: null,
				ticker: 0,
				fid: -1,
				rgn: {
					l: runningRgn.l + (runningRgn.r - runningRgn.l) * 0.5,
					r: runningRgn.r,
				}
			});
			$('#helper')
			.css({
				left: runningRgn.l,
				top: runningRgn.t,
				width: runningRgn.r - runningRgn.l,
				height: runningRgn.b - runningRgn.t,
			});
			helper = $('#helperfocus');
			helper.css('line-height', (runningRgn.b - runningRgn.t) + 'px');
			
			$('body')
			.css({height: configs.back.size.h})
			.on(configs.system.touches.start, function(e){
		    	e.preventDefault();
		    	if (game.getState() == configs.gaming.status.run)
					tracker.moveHold(e);
			})
			.on(configs.system.touches.move, function(e){
		    	e.preventDefault();
		    	if (game.getState() == configs.gaming.status.run)
					tracker.move(e);
			})
			.on(configs.system.touches.end, function(e){
		    	e.preventDefault();
		    	if (game.getState() == configs.gaming.status.run)
					tracker.moveRelease(e);
			});

			ruler.init();

			if (!Zepto.os.phone)
				touching = false;
		},
		reset: function(){
			curSide = 0;
			helpTimes = 0;
			velocity = 0;
			for (var i = 0; i < foots.length; i++) {
				foots[i].pos = null;
			};
			ruler.reset();
			this.updateHelper(false);
		},
		tick: function(span){
			if (!ruler.tick(velocity, span)){
				return configs.gaming.status.finish;
			}
			velocity -= friction * span;
			if (velocity < 0)
				velocity = 0;
			this.updateHelper(false);
			return configs.gaming.status.run;
		},
		getRegion: function(){
			return runningRgn;
		},
		moveHold: function(e){
			if (touching){
				var f = foots[curSide];
				f.pos = null;
				for (var i = 0; i < e.touches.length; i++) {
					var t = e.touches[i];
					if (f.rgn.l <= t.clientX && t.clientX <= f.rgn.r){
						f.fid = t.identifier;
						f.pos = {x: t.clientX, y: t.clientY};
						f.ticker = (new Date()).getTime();
						break;
					}
				}
			}
		},
		move: function(e){
			if (touching){
				var f = foots[curSide];
				if (f.pos == null)
					return;
				for (var i = 0; i < e.touches.length; i++) {
					var t = e.touches[i];
					if (f.fid != t.identifier)
						continue;
					var dy = t.clientY - f.pos.y;
					var dt = ((new Date()).getTime() - f.ticker) * 0.001;
					if (dy > 0){
						velocity = dy / dt;
						if (velocity > 1500)
							velocity = 1500;
						// console.log('dy:'+dy+';dt:'+dt+';vel:'+velocity);
					}
					f.elm.css({
						left: t.clientX - f.elm.attr('width') * 0.5,
						top: t.clientY - f.elm.attr('height') * 0.5,
					}).show();
				}
			}
		},
		moveRelease: function(e){
			if (!touching || curSide < 0)
				return;
			foots[curSide].elm.hide();
			if (foots[curSide].pos != null){
				curSide = curSide == 0 ? 1 : 0;
				this.updateHelper(true);
			}
		},
		updateHelper: function(added){
			if (helpTimes >= 6)
				$('#helper').hide();
			else{
				$('#helper').show();
				if (game.getState() == configs.gaming.status.prepare){
					helper.css({
						left: '0%'
					}).html('各就位……');
				}
				else if (curSide == 0){
					helper.css({
						left: '0%'
					}).html('↓向下滑动食指↓');
				}
				else{
					helper.css({
						left: '50%'
					}).html('↓向下滑动中指↓');
				}
				if (added)
					++helpTimes;
			}
		}
	}
})();

var timer = (function(){
	var elm;
	var ticker = 0;
	var preticker = null;
	return {
		init: function(){
			elm = $('#timer');
		},
		reset: function(){
			ticker = -1;
			tracker.reset();
			this.updateLabel();
		},
		finish: function(){
			ruler.finish();
		},
		tick: function(span){
			ticker += span;
			var status = configs.gaming.status.prepare;
			if (ticker > 0)
				status = tracker.tick(span);
			this.updateLabel();
			return status;
		},
		updateLabel: function(){
			var t = Math.floor(ticker);
			if (t < 0)
				elm.html('准备中');
			else
				elm.html('时间：' + ticker.toFixed(2) + 's');
			if (preticker == null){
				$('#ruler').css('opacity', 0.5);
			}
			else if (preticker < 0 && ticker >= 0){
				$('#ruler').css('opacity', 1);
			}
			preticker = ticker;
		},
		getTime: function(){
			return ticker;
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
	var funcTick = null, funcScrolling = null;
	var state = configs.gaming.status.prepare;
	var bestscore = -1;
	var backoffset = 0;
	var bestranking = -1;
    return {
    	updatewx: function(){
			if (bestscore > 0){
				var title = configs.words.wxtitle_share.replace('[[SCORE]]', bestscore);
				if (bestscore < 9.58)
					title += "破了博尔特的鸡录！";
				if (bestranking > 0)
					title += "奥运会排名第"+bestranking+"！";
				else
					title += "你行吗？";
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

            if (!Zepto.os.phone){
            	configs.system.touches.start = "mousedown";
            	configs.system.touches.move = "mousemove";
            	configs.system.touches.end = "mouseup";
            }

			this.updatewx();
			timer.init();
			tracker.init();
			$('#titletext').html(configs.words.title);
			$('#titletip').html(configs.words.help);
			$('#sec_welcome').show();

			$('#bg').css({
				width: configs.back.size.w,
				height: configs.back.size.h,
			});
			var evtTouch = configs.system.touches.start;
			$('#retry').on(evtTouch, function(e){
				e.preventDefault();
				game.start();
			});
			$('#share').on(evtTouch, function(e){
				e.preventDefault();
				$('#sharetip').show();
				setTimeout('configs.shareflag = 1;', 500);
			});
			$('#start').on(evtTouch, function(e){
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
			.on(evtTouch, function(e){
				e.preventDefault();
				if (configs.shareflag == 1)
					$(this).hide();
				configs.shareflag = 0;
			});
    		$('.focus > button').on(evtTouch, function(e){
				e.preventDefault();
    			window.location.href = configs.mpurl;
			});

    		this.enableBgScrolling(true);
			game.visitServer();
		},
		start: function(){
			if (funcTick != null)
				this.finish();
			$('#finish').hide();
			$('#sec_welcome').hide();
			$('#sec_game').show();
			$('.focus').hide();
    		this.enableBgScrolling(false);

			state = configs.gaming.status.prepare;

			lastTick = 0;
			timer.reset();
			tracker.reset();
			funcTick = setInterval('game.tick()', 25);
		},
    	finish: function(){
    		timer.finish();
    		clearInterval(funcTick);
    		funcTick = null;
    		var score = timer.getTime().toFixed(2);
    		var msg = configs.words.finish.replace('[[SCORE]]', score);
    		if (bestscore < 0 || score < bestscore){
    			if (bestscore > 0)
    				msg += '刷新了你的最好成绩！';
    			bestscore = score;
    		}
    		else if (score > bestscore){
    			msg += '你的最好成绩是' + bestscore + '秒！';
    		}
    		if (score < 9.58){
    			msg += '你破了博尔特的鸡录！';
    		}
    		else if (score < 10){
    			msg += '离博尔特就差一点点了！';
    		}
    		else if (score < 11){
    			msg += '离博尔特还那么差一点！';
    		}
    		
    		$('#results').html(msg);
			$('.focus').show();
			$('#retry').hide();
			$('#share').hide();
			$('#finish').show();
			setTimeout(function(){
				$('#retry').show();
				$('#share').show();
			}, 2000);
    		this.enableBgScrolling(true);

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
    	enableBgScrolling: function(enabled){
    		if (enabled && funcScrolling == null){
				funcScrolling = setInterval(function(){
					backoffset += 1;
					$('#bg').css('background-position', '0px '+backoffset+'px');
				}, 100);
			}
			else if (!enabled && funcScrolling != null) {
				clearInterval(funcScrolling);
			}
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
            		proj: "runner",
            	},
            	dataType: "html"
            });
        },
    	notifyServer: function(){
    		$.ajax({
    			url: '../lib/php/records.php',
    			type: 'post',
    			data:{
    				proj: 'runner',
    				score: bestscore,
    				gainrank: 'true',
    				ascending: 'false',
    			},
				dataType: 'html',
    			error: function(){},
    			success: function(resp){
					var rst = $.parseJSON(resp);
					if (rst.success){
    					var msg = $('#results').html();
    					if (rst.ranking == 1){
	    					msg += "你超过了你所有朋友获得了第"+rst.ranking+"名！";
	    				}
	    				else{
	    					msg += "你的朋友们最好成绩是"+rst.bestscore+"秒，";
	    					msg += "你获得了第"+rst.ranking+"名！";
	    				}
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
