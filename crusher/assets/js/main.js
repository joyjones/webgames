
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
		totaltime: 60,
	},
	skeeter: {
		size: 64,
		maxid: 0,
		hpmax: [
			100,
			200,
			500,
		],
		speed: [
			100,
			150,
			200,
		],
		scrcountmin: 1,
		scrcountmax: 8,
		counts: {
			lv1: 0,
			lv2: 10,
			lv3: 5,
		}
	},
	room: {
		
	},
	words:{
		wxtitle: '【睡前行动】蚊子太TM多了，根本睡不着，捏死它们再睡觉！',
		wxdesc: '动用你的所有手指，消灭这些让你睡不好的蚊子！',
		wxtitle_share: '【睡前行动】我得了[[SCORE]]分！',
		title: '动用你的所有手指，消灭这些让你睡不好的蚊子！',
		help: '<span class="mark">提示</span>：在规定时间内用你的<span class="red">手指按住飞来的蚊子，并且碾一碾直到碾死</span>，让蚊子彻底在你房间消失！',
		finish: '你获得了[[SCORE]]分！',
	},
};

var skeeter = function(type, pos, dir){
	var curPos = pos;
	var curDir = dir;
	var fullHp = configs.skeeter.hpmax[type];
	var curHp = fullHp;
	var isHolding = false;
	var hotRadius = configs.skeeter.size * 0.5 * 1.2;
	var speed = configs.skeeter.speed[type];
	var bgoffset = {x:0,y:0};
	var curType = type;
	if (type == 1){
		bgoffset.x = -64;
		// hotRadius = hotRadius * 0.75;
	}
	else if (type == 2){
		bgoffset.y = -64;
		// hotRadius = hotRadius * 0.9;
	}
	var id = ++configs.skeeter.maxid;
	var div = '<div id="skeeter' + id + '" style="position:absolute;overflow:visible;';
	div += 'background-image: url(assets/images/skeeters.png);';
	div += 'background-position: '+bgoffset.x+'px '+bgoffset.y+'px;';
	div += 'z-index:10">';
	div += '<div class="hp"><div class="hpval"></div></div>';
	div += '</div>';
	$('body').append(div);
	var elm = $('#skeeter'+id);
	var elmHp = $('#skeeter'+id+' > .hp > .hpval');
	elm
	.on(configs.system.touches.start, function(e){
    	e.preventDefault();
		room.crushHold(e);
	})
	.on(configs.system.touches.move, function(e){
    	e.preventDefault();
    	if (Zepto.os.phone)
			room.crush(e);
	})
	.on(configs.system.touches.end, function(e){
    	e.preventDefault();
		room.crushRelease(e);
	});

	return {
		tick: function(span){
			if (elm == null)
				return false;
			if (curHp <= 0){
				elm.remove();
				return false;
			}
			if (!isHolding){
				var move = {dx: curDir.x * speed * span, dy: curDir.y * speed * span};
				curPos.x += move.dx;
				curPos.y += move.dy;
				var sw = configs.back.size.w,
					sh = configs.back.size.h
					halfsize = configs.skeeter.size * 0.5;
				if (curPos.x < -halfsize || curPos.x >= sw - halfsize ||
					curPos.y < -halfsize || curPos.y >= sh - halfsize){
					elm.remove();
					return false;
				}
			}
			this.updateElms();
			return true;
		},
		getPos: function(){
			return curPos;
		},
		getType: function(){
			return curType;
		},
		isDying: function(){
			return curHp <= 0;
		},
		remove: function(){
			elm.remove();
		},
		hold: function(ishold){
			if (isHolding != ishold){
				isHolding = ishold;
				if (isHolding)
					$('#skeeter'+id+' > .hp').show();
				else
					$('#skeeter'+id+' > .hp').hide();
			}
		},
		damage: function(val){
			curHp -= val;
			if (curHp <= 0){
				curHp = 0;
				room.onSkeeterDie(this);
			}
		},
		containPos: function(pos, scale){
			var r = maths.getDistance(curPos, pos);
			return r < hotRadius * scale;
		},
		checkTurnRound: function(){
			var sw = configs.back.size.w,
				sh = configs.back.size.h;
		},
		updateElms: function(){
			var size = configs.skeeter.size;
			elm.css({
				width: size,
				height: size,
				left: curPos.x - size * 0.5,
				top: curPos.y - size * 0.5,
			});
			var percent = curHp / fullHp * 100;
			elmHp.css('width', percent+'%');
		}
	}
}

var room = (function(){
	var skeeters = [];
	var fingers = [];
	var curCountSpan;
	var curScore = 0;
	var ticker = 0, bornTickers = [0, 0, 0];
	var bornTimes = [[], [], []];
	var ctx = null;
	var bgImg = new Image(), dyImg = new Image();
	bgImg.src = "assets/images/back0.jpg";
	dyImg.src = "assets/images/die.png";
	return {
		init: function(){
			var roomelm = $('#room');
			roomelm.attr({
				width: configs.back.size.w,
				height: configs.back.size.h,
			});
			ctx = roomelm[0].getContext('2d');

			$('body')
			.on(configs.system.touches.start, function(e){
		    	e.preventDefault();
				room.crushHold(e);
			})
			.on(configs.system.touches.move, function(e){
		    	e.preventDefault();
		    	if (Zepto.os.phone)
					room.crush(e);
			})
			.on(configs.system.touches.end, function(e){
		    	e.preventDefault();
				room.crushRelease(e);
			});

			for (var i = 0; i < 10; i++) {
				fingers.push({
					pos: null,
					ske: null,
				});
			};
		},
		reset: function(){
			curCountSpan = configs.skeeter.scrcountmin;
			curScore = 0;
			ticker = 0;
			bornTickers = [0, 0, 0];
			ctx.drawImage(bgImg, 0, 0, configs.back.size.w, configs.back.size.h);
			bornTimes = [[], [], []];
			for (var i = 0; i < configs.skeeter.counts.lv2; i++) {
				var t = (Math.random() * 0.7 + 0.2) * configs.gaming.totaltime;
				bornTimes[1].push(t);
			};
			for (var i = 0; i < configs.skeeter.counts.lv3; i++) {
				var t = (Math.random() * 0.4 + 0.5) * configs.gaming.totaltime;
				bornTimes[2].push(t);
			};
			$('#score').html('得分：0');
		},
		clear: function(){
			for (var i = 0; i < skeeters.length; i++) {
				skeeters[i].remove();
			};
			skeeters.length = 0;
		},
		tick: function(span){
			ticker += span;
			if (skeeters.length < Math.floor(curCountSpan)){
				var borned = false;
				for (var i = 1; !borned && i < bornTimes.length; i++) {
					for (var j = 0; !borned && j < bornTimes[i].length; j++) {
						var t = bornTimes[i][j];
						if (bornTickers[i] < t && ticker >= t){
							this.bornSkeeter(i);
							borned = true;
							bornTickers[i] = t;
							break;
						}
					};
				};
				if (!borned)
					this.bornSkeeter(0);
			}
			var bs = configs.skeeter.scrcountmax - configs.skeeter.scrcountmin;
			curCountSpan += (span / configs.gaming.totaltime) * bs;
			if (curCountSpan > configs.skeeter.scrcountmax)
				curCountSpan = configs.skeeter.scrcountmax;
			for (var i = 0; i < skeeters.length; i++) {
				if (!skeeters[i].tick(span)){
					skeeters.splice(i--, 1);
				}
			};
		},
		bornSkeeter: function(type){
			var w = configs.back.size.w;
			var h = configs.back.size.h;
			var size = configs.skeeter.size;
			var side = Math.floor(Math.random() * 4);
			var pos = null, dir = null, target = null;
			switch (side){
				case 0:{//left
					pos = {x: -size * 0.5, y: Math.random() * (h - size) + size * 0.5};
					target = {x: w, y: Math.random() * (h - size) + size * 0.5};
				}break;
				case 1:{//top
					pos = {x: Math.random() * (w - size) + size * 0.5, y: -size * 0.5};
					target = {x: Math.random() * (w - size) + size * 0.5, y: h};
				}break;
				case 2:{//right
					pos = {x: w - size * 0.5, y: Math.random() * (h - size) + size * 0.5};
					target = {x: 0, y: Math.random() * (h - size) + size * 0.5};
				}break;
				case 3:{//bottom
					pos = {x: Math.random() * (w - size) + size * 0.5, y: h - size * 0.5};
					target = {x: Math.random() * (w - size) + size * 0.5, y: 0};
				}break;
			}
			dir = maths.getDirection(pos, target);
			skeeters.push(new skeeter(type, pos, dir));
		},
		getScore: function(){
			return curScore;
		},
		crushHold: function(e){
			for (var i = 0; i < e.touches.length; i++) {
				var t = e.touches[i];
				var f = fingers[t.identifier];
				if (f.pos == null){
					f.pos = {x: t.clientX, y: t.clientY};
					f.ske = this.getFingerSkeeter(f.pos);
					if (f.ske != null)
						f.ske.hold(true);
				}
			}
			this.updateDebugInfo(e);
			console.log('hold');
		},
		crush: function(e){
			for (var i = 0; i < e.touches.length; i++) {
				var t = e.touches[i];
				var f = fingers[t.identifier];
				var newpos = {x: t.clientX, y: t.clientY};
				if (f.pos && f.ske && !f.ske.isDying()){
					if (!f.ske.containPos(newpos, 2))
						f.ske.hold(false);
					else{
						var offset = maths.getDistance(f.pos, newpos);
						f.ske.damage(offset);
					}
				}
				f.pos = newpos;
			}
			this.updateDebugInfo(e);
		},
		crushRelease: function(e){
			for (var i = 0; i < fingers.length; i++) {
				if (fingers[i].pos == null)
					continue;
				var found = false;
				for (var j = 0; !found && j < e.touches.length; j++) {
					if (e.touches[j].identifier == i)
						found = true;
				}
				if (!found){
					if (fingers[i].ske != null){
						fingers[i].ske.hold(false);
					}
					fingers[i].pos = null;
					fingers[i].ske = null;
				}
			}
			console.log('release');
			this.updateDebugInfo(e);
		},
		onSkeeterDie: function(ske){
			curScore += configs.skeeter.hpmax[ske.getType()];
			$('#score').html('得分：' + curScore);
			var pos = ske.getPos(), hs = configs.skeeter.size * 0.5;
			ctx.drawImage(dyImg, pos.x - hs, pos.y - hs, hs * 2, hs * 2);
		},
		getFingerSkeeter: function(pos){
			for (var i = 0; i < skeeters.length; i++) {
				if (skeeters[i].containPos(pos, 1))
					return skeeters[i];
			};
			return null;
		},
		updateDebugInfo: function(e){
			// var ids = '';
			// for (var i = 0; i < fingers.length; i++) {
			// 	var f = fingers[i];
			// 	if (f.pos != null)
			// 		ids += i + ' (' + f.pos.x + ',' + f.pos.y + ')<br/>';
			// 	else
			// 		ids += i + ' none<br/>';
			// };

			// $('#debug').html(ids);
		},
	}
})();

var timer = (function(){
	var elm;
	var ticker = -1;
	return {
		init: function(){
			elm = $('#timer');
			room.init();
		},
		reset: function(){
			ticker = -1;
			room.reset();
			this.updateLabel();
		},
		tick: function(span){
			ticker += span;
			if (ticker > configs.gaming.totaltime)
				ticker = configs.gaming.totaltime;
			room.tick(span);
			this.updateLabel();
			if (ticker == configs.gaming.totaltime){
				room.clear();
				return configs.gaming.status.finish;
			}
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
					"assets/images/icon.png",
					title,
					configs.words.wxdesc);
			}
			else
				COMMONMETHODS.setWeixinProperties(
					"assets/images/icon.png",
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
            else if (Zepto.os.wp){
            	configs.system.touches.start = "MSPointerDown";
            	configs.system.touches.move = "MSPointerMove";
            	configs.system.touches.end = "MSPointerUp";
            }

			this.updatewx();
			timer.init();
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
			funcTick = setInterval('game.tick()', 25);
		},
    	finish: function(){
    		clearInterval(funcTick);
    		funcTick = null;
    		var score = room.getScore();
    		var msg = configs.words.finish.replace('[[SCORE]]', score);
    		if (score == 0)
    			msg = 'OH MYGOD，' + msg;
    		if (bestscore < 0 || score > bestscore){
    			if (bestscore > 0)
    				msg += '刷新了你的最好成绩！';
    			bestscore = score;
    		}
    		else if (score < bestscore){
    			msg += '你的最好成绩是' + bestscore + '分，你还可以捏死更多！';
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
            		proj: "crusher",
            	},
            	dataType: "html"
            });
        },
    	notifyServer: function(){
    		$.ajax({
    			url: '../lib/php/records.php',
    			type: 'post',
    			data:{
    				proj: 'crusher',
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
