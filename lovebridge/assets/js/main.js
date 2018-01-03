
COMMONCONFIGS.WX_APPID = COMMONCONFIGS.WX_APPID_XYGAME;

var configs = {
	mpurl: 'http://mp.weixin.qq.com/s?__biz=MjM5NjI1NDUzNQ==&mid=200617553&idx=1&sn=e64038ed336a0d0fe10775ddfdbe5914#rd',
	back: {
		resolution: {
			w: 640,
			h: 1136,
		},
		offsetY: 0,
		mooncenter:{
			x: 320,
			y: 608,
		},
		loveimg:{
			w: 640,
			h: 382,
		}
	},
	gaming: {
		status: {
			lose: -1,
			run: 0,
			win: 1,
		},
		readytime: 3,
		mintime: 8,
		troubletime: 25,
		trouble_min: 1,
		trouble_max: 5,
		maxenergy_introuble: 1.2,
	},
	words:{
		wxtitle: '牛哥与织妹',
		wxdesc: '牛哥与织妹又到了一年中相会的日子！快用最短的时间让他们相见吧！',
		wxtitle_share: '让牛哥与织妹相见我只用了[[TIME]]秒，你呢？',
		title: '牛哥与织妹又到了难得相会的日子！但是一股邪恶力量在阻止着他们见面，现在该我们出手相助了！',
		help: '在邪恶力量出现的时候，<span class="helpred">点击按钮加把劲</span>，用最短的时间让他们相见吧！',
		finish: '牛哥与织妹经过了<span class="result_secs">[[TIME]]</span>秒终于相聚在一起！',
		boy:{
			lose: '可怜的织妹没能见到她的牛哥……',
			speech:[
				'织妹！',
				'牛郎的话1',
				'牛郎的话2',
				'牛郎的话3',
				'牛郎的话4',
			],
		},
		girl:{
			lose: '可怜的牛哥没能见到他的织妹……',
			speech:[
				'牛哥！',
				'织女的话1',
				'织女的话2',
				'织女的话3',
				'织女的话4',
			],
		}
	},
	images: [
		'back.jpg',
		'boy.png',
		'door1.png',
		'door2.png',
		'focus.png',
		'girl.png',
		'icon.png',
		'lose_boy.png',
		'lose_girl.png',
		'push1.png',
		'push2.png',
		'retry.png',
		'share.png',
		'sharetip.png',
		'start.png',
		'title.png',
		'win.png',
	]
};

var maths = (function(){
	return {
		getdistance: function(pos1, pos2){
			var dx = pos2.x - pos1.x;
			var dy = pos2.y - pos1.y;
			return Math.sqrt(dx*dx + dy*dy);
		},
		getdirection: function(pos1, pos2){
			var dx = pos2.x - pos1.x;
			var dy = pos2.y - pos1.y;
			var dist = this.getdistance(pos1, pos2);
			if (dist < 0.00001)
				return {x:0, y:0};
			return {x: dx / dist, y: dy / dist};
		},
		getlength: function(vec){
			return Math.sqrt(vec.x*vec.x + vec.y*vec.y);
		},
		getdir: function(vec){
			var dist = this.getlength(vec);
			if (dist < 0.00001)
				return {x:0, y:0};
			return {x: vec.x / dist, y: vec.y / dist};
		},
		getRandValue: function(min, max){
			return min + Math.random() * (max - min);
		}
	}
})();

var role = function(){
	var elm, elmbtn;
	var pos;
	var curspeed = 0;
	var maxspeed = 0;
	var rundir;
	var door;
	var cfg = {
		resol: {
			w: 54,
			h: 98,
		},
		scale: 0.7,
		cr: 36 / 54,
	};
	var pathnodes, nodedists, troubles;
	var curTrouble, lastTroublePercent;
	var size = {
		w: cfg.resol.w * cfg.scale,
		h: cfg.resol.h * cfg.scale,
	};
	var runningdist, runningnode, totaldist, state;

	return {
		init: function(_elm, _dir, _nodes, _elmbtn, _troubles, _door){
			elm = _elm;
			elmbtn = _elmbtn;
			troubles = _troubles;
			door = _door;
			rundir = _dir;
			if (_dir < 0){
				cfg.cr = 1 - cfg.cr;
				_nodes[_nodes.length - 1].x += 7;
			}
			else
				_nodes[_nodes.length - 1].x -= 7;
			var pn = null;
			runningdist = 0;
			runningnode = 0;
			totaldist = 0;
			lastTroublePercent = 0;
			curTrouble = null;
			pathnodes = [];
			nodedists = [];
			state = configs.gaming.status.run;
			for (var i = 0; i < _nodes.length; ++i){
				var n = {
					x: _nodes[i].x,
					y: _nodes[i].y,
				};
				pathnodes.push(n);
				if (pn != null)
					totaldist += maths.getdistance(n, pn);
				nodedists.push(totaldist);
				pn = n;
			}
			maxspeed = totaldist / configs.gaming.mintime;
			curspeed = maxspeed;

			var me = this;
			elm.css({
				width: size.w,
				height: size.h,
				display: 'block',
				opacity: 1
			});
			elmbtn
				.on('mousedown touchstart', function(e){
					e.preventDefault();
					me.pushEnergy();
					$(this).css('background-image', 'url(assets/images/push2.png)');
				})
				.on('click touchend', function(e){
					e.preventDefault();
					$(this).css('background-image', 'url(assets/images/push1.png)');
				})
				.hide();

			pathnodes[0].x += _dir * runningdist;
			this.move(pathnodes[0]);
			return this;
		},
		move: function(_pos){
			pos = {x:_pos.x, y:_pos.y};
			var x = pos.x - cfg.cr * size.w;
			var y = pos.y - size.h;
			elm.css('left', x + 'px')
			    .css('top', y + 'px');
		},
		tick: function(_span){
			runningdist += _span * curspeed;
			var nidx = nodedists.length;
			for (var i = 0; i < nodedists.length; i++) {
				if (runningdist < nodedists[i]){
					nidx = i - 1;
					break;
				}
			};
			if (nidx < 0){
				elm.hide();
				elmbtn.hide();
				state = configs.gaming.status.lose;
			}
			else if (nidx == nodedists.length){
				state = configs.gaming.status.win;
			}
			else{
				var reldist = runningdist - nodedists[nidx],
					n1 = pathnodes[nidx],
					n2 = pathnodes[nidx + 1],
					far = maths.getdistance(n1, n2),
					dir = maths.getdirection(n1, n2);
				var	p = {
					x: pathnodes[nidx].x + reldist * dir.x,
					y: pathnodes[nidx].y + reldist * dir.y,
				};
				this.move(p);
				state = configs.gaming.status.run;
			}

			if (curTrouble == null){
				var percent = runningdist / totaldist;
				var tr = this.getTrouble(percent);
				if (tr != null){
					this.appendTrouble(tr);
				}
			}
			else{
				curTrouble.tick += _span;
				if (curTrouble.tick >= curTrouble.time){
					this.removeTrouble();
				}
				else{
					curspeed -= _span * maxspeed * 1;
					if (curspeed < -maxspeed)
						curspeed = -maxspeed;
				}
			}
			return state;
		},
		getTrouble: function(percent){
			for (var i = troubles.length - 1; i >= 0; i--) {
				var t = troubles[i];
				if (t.percent > lastTroublePercent && t.percent < percent){
					return t;
				}
			};
			return null;
		},
		appendTrouble: function(tr){
			if (curTrouble != null)
				removeTrouble();
			if (tr != null){
				curTrouble = tr;
				curspeed = -maxspeed;
			}
			var randy = Math.random() < 0.5 ? 50 : 150;
			if (rundir > 0)
				elmbtn.css({left: bridge.convertLength(randy)});
			else
				elmbtn.css({right: bridge.convertLength(randy)});
			elmbtn.show();
			this.showDoor();
		},
		removeTrouble: function(){
			if (curTrouble != null){
				lastTroublePercent = curTrouble.percent;
				curTrouble.tick = 0;
				curTrouble = null;
			}
			curspeed = maxspeed;
			elmbtn.hide();
			door.fadeOut(200);
		},
		pushEnergy: function(){
			if (curTrouble == null)
				return;
			curspeed += maxspeed * 0.5;
			if (curspeed > maxspeed)
				curspeed = maxspeed;
		},
		showDoor: function(){
			var me = this;
			door.fadeIn(200);
		},
		fly: function(){
			elm.animate({
				top: pos.y - 150,
				opacity: 0,
			}, 2500);
			door.fadeOut(500);
			elmbtn.fadeOut(500);
		},
		hide: function(){
			elm.fadeOut(2000);
			door.fadeOut(500);
			elmbtn.fadeOut(500);
		},
		getState: function(){
			return state;
		}
	};
}

var bridge = (function(){
	var locations = [
		[40, 888],
		[150, 856],
		[320, 845],
		[490, 856],
		[600, 888],
	];
	var midindex = (locations.length + 1) / 2 - 1;
	var boy, girl;
	var doors;
	var elmLove;
	var asp = configs.back.loveimg.w / configs.back.loveimg.h;

	return {
		init: function(){
	 		boy = new role();
	 		girl = new role();
	 		elmLove = $('#winview');
			doors = [$('#door1'), $('#door2')];
	 		this.showTitle();
		},
		reset: function(){
			var nodes = [];
			for (var i = 0; i <= midindex; i++) {
				nodes.push(this.convertPos(locations[i]));
			};
	 		boy.init($('#boy'), 1, nodes, $('#push1'), this.calcTroubles(), doors[0]);

	 		nodes = [];
			for (var i = locations.length - 1; i >= midindex; i--) {
				nodes.push(this.convertPos(locations[i]));
			};
			nodes[nodes.length - 1].x += this.convertLength(12);
	 		girl.init($('#girl'), -1, nodes, $('#push2'), this.calcTroubles(), doors[1]);

	 		var p = this.convertPos(locations[0]);
	 		var dw = this.convertLength(50);
	 		var dh = this.convertLength(100);
			doors[0].css({
				width: dw,
				height: dh,
				left: 0,
				top: p.y - dh,
			}).hide();
			doors[1].css({
				width: dw,
				height: dh,
				right: 0,
				top: p.y - dh,
			}).hide();
		},
		calcTroubles: function(){
			var trs = [];
	 		var restt = configs.gaming.troubletime;
	 		while(restt > 0){
	 			var t = maths.getRandValue(configs.gaming.trouble_min, configs.gaming.trouble_max);
	 			if (t > restt)
	 				t = restt;
	 			trs.push({
	 				percent: maths.getRandValue(0.2, 0.95),
	 				time: t,
	 				tick: 0,
	 			});
	 			restt -= t;
	 		}
	 		trs.sort(function(t1, t2){
	 			if (t1.percent < t2.percent)
	 				return -1;
	 			else if (t1.percent > t2.percent)
	 				return 1;
	 			return 0;
	 		});
	 		return trs;
		},
		convertPos: function(pos){
			return {
				x: pos[0] / configs.back.resolution.w * game.scrsize().w,
				y: game.scrsize().h - (configs.back.resolution.h - pos[1]) / configs.back.resolution.h * (game.scrsize().h - configs.back.offsetY),
			};
		},
		convertLength: function(len){
			return len / configs.back.resolution.w * game.scrsize().w;
		},
		tick: function(span){
			var r1 = boy.tick(span);
			var r2 = girl.tick(span);
			if (r1 == configs.gaming.status.lose || r2 == configs.gaming.status.lose)
				return configs.gaming.status.lose;
			else if (r1 == configs.gaming.status.win && r2 == configs.gaming.status.win)
				return configs.gaming.status.win;
			return configs.gaming.status.run;
		},
		onResult: function(rst){
			if (rst == configs.gaming.status.win){
				boy.fly();
				girl.fly();
				setTimeout('bridge.showLove();', 1500);
			}
			else{
				boy.hide();
				girl.hide();
				setTimeout('bridge.showCry();', 1500);
			}
			setTimeout(function(){
				$('#retry').show();
				$('#share').show();
			}, 4000);
		},
		showTitle: function(){
			var ybgn = 10;
			elmLove.css({
				top: 10,
				display: 'block',
				opacity: 0,
			});
			elmLove.animate({opacity: 1}, 2000);

			$('#results')
			.addClass('titlewelcome')
			.css('opacity', 0)
			.html(configs.words.title)
			.animate({opacity: 1}, 2000);
		},
		showLove: function(){
			var moon = bridge.convertPos([configs.back.mooncenter.x,configs.back.mooncenter.y]);
			var ybgn = moon.y - game.scrsize().w / asp * 0.5;
			var yend = 10;
			$('#winview > img')
			.attr('src', 'assets/images/win.png');
			elmLove.css({
				top: ybgn,
				display: 'block',
				opacity: 0,
			});
			$('#results').hide();
			var endtime = timer.getTime();
			elmLove.animate({
				opacity: 1,
				top: yend,
			}, 2500, function(){
				$('#results')
					.show()
					.addClass('titlegame')
					.css('opacity', 0)
					.html(configs.words.finish.replace('[[TIME]]', endtime))
					.animate({
						opacity: 1,
					}, 1000);
			});
		},
		showCry: function(){
			var moon = bridge.convertPos([configs.back.mooncenter.x,configs.back.mooncenter.y]);
			var ybgn = moon.y - game.scrsize().w / asp * 0.5;
			var yend = 10;
			var img, words;
			if (boy.getState() == configs.gaming.status.lose){
				img = 'lose_girl.png';
				words = configs.words.boy.lose;
			}
			else{
				img = 'lose_boy.png';
				words = configs.words.girl.lose;
			}
			$('#winview > img')
			.attr('src', 'assets/images/'+img);
			elmLove.css({
				top: ybgn,
				display: 'block',
				opacity: 0,
			});
			$('#results').hide();
			elmLove.animate({
				opacity: 1,
				top: yend,
			}, 2500, function(){
				$('#results')
					.show()
					.addClass('titlegame')
					.css('opacity', 0)
					.html(words)
					.animate({
						opacity: 1,
					}, 1000);
			});
		}
	};
})();

var timer = (function(){
	var elm;
	var ticker = -configs.gaming.readytime;
	return {
		init: function(){
			elm = $('#timer');
		},
		reset: function(){
			var pos = bridge.convertPos([configs.back.mooncenter.x,configs.back.mooncenter.y]);
			var size = 80;
			elm.css({
				left: 0,
				top: pos.y - size * 0.5,
				width: game.scrsize().w,
				height: size,
				display: 'block',
				opacity: 1
			});
			ticker = -configs.gaming.readytime;
		},
		tick: function(span){
			ticker += span;
			if (ticker < 0)
				elm.html(Math.ceil(Math.abs(ticker)));
			else{
				elm.html(ticker.toFixed(2) + 's');
	    		return bridge.tick(span);
			}
			return configs.gaming.status.run;
		},
		isGaming: function(){
			return ticker >= 0 ? true : false;
		},
		getTime: function(){
			return ticker.toFixed(2);
		},
		hide: function(){
			elm.fadeOut(1000);
		}
	}
})();

var game = (function(){
	var lastTick = 0;
	var funcTick = null;
	var state = configs.gaming.status.run;
	var bestscore = -1;
    return {
    	scrsize: function(){
		    return {
		    	w: $(window).get(0).innerWidth,
		    	h: $(window).get(0).innerHeight,
		    };
    	},
    	preload: function(){
			for (var i = 0; i < configs.images.length; ++i){
				var img = new Image();
				img.src = "assets/images/" + configs.images[i];
			}
    	},
    	updatewx: function(){
			if (bestscore > 0)
				COMMONMETHODS.setWeixinProperties(
					"assets/images/icon.png",
					configs.words.wxtitle_share.replace('[[TIME]]', bestscore),
					configs.words.wxdesc);
			else
				COMMONMETHODS.setWeixinProperties(
					"assets/images/icon.png",
					configs.words.wxtitle,
					configs.words.wxdesc);
    	},
    	init: function(){
    		this.updatewx();
    		
    		$('#backimage').attr('src', 'assets/images/back.jpg');

    		var bi = $('#backimage');
    		var szScr = this.scrsize();
    		var szImg = {
    			w: szScr.w,
    			h: szScr.w * (configs.back.resolution.h / configs.back.resolution.w),
    		};
    		if (szImg.h < szScr.h)
    			szImg.h = szScr.h;
    		
    		bi.attr({width: szImg.w, height: szImg.h});
    		configs.back.offsetY = szScr.h - szImg.h;
    		bi.css('top', configs.back.offsetY + 'px');

    		$('#winview > img').attr({
    			src: 'assets/images/title.png',
    			width: this.scrsize().w,
    		});
	 		$('.nouse').remove();

			var iw = 100, ih = 100;
    		var is = 0.8;
    		$('#push1').css({
				width: iw * is,
    			height: iw * is,
    			left: bridge.convertLength(50),
    			bottom: bridge.convertLength(100),
    		}).hide();
    		$('#push2').css({
				width: iw * is,
    			height: iw * is,
    			right: bridge.convertLength(50),
    			bottom: bridge.convertLength(100),
    		}).hide();

    		iw = 120, ih = 33;
    		is = 0.75;
	 		$('#start').css({
	 			width: iw * is,
	 			height: ih * is,
    			left: (szScr.w - iw * is) * 0.5,
    			bottom: bridge.convertLength(200),
    			display: 'none',
	 		})
    		.on('click touchend', function(){
    			event.preventDefault();
    			game.start();
    			$(this).fadeOut('fast');
    		}).fadeIn(2000);

    		$('#retry').css({
    			width: iw * is,
    			height: ih * is,
    			left: 10,
    			bottom: bridge.convertLength(80),
    		})
    		.on('click touchend', function(){
    			event.preventDefault();
    			if (state != configs.gaming.status.run){
	    			game.start();
    			}
    		}).hide();

    		$('#share').css({
    			width: iw * is,
    			height: ih * is,
    			right: 10,
    			bottom: bridge.convertLength(80),
    		})
    		.on('click touchend', function(){
				event.preventDefault();
    			if (state != configs.gaming.status.run){
    				$('#sharetip').show();
					setTimeout('configs.shareflag = 1;', 500);
    			}
    		}).hide();

    		is = 0.5;
    		$('#focus')
    		.css({
    			width: iw * is,
    			height: ih * is,
    			left: (szScr.w - iw * is) * 0.5,
    			bottom: bridge.convertLength(10),
    		})
    		.on('click touchend', function(){
    			window.location.href = configs.mpurl;
			});

			$('#sharetip')
			.css({
				width: szScr.w,
				height: szScr.h,
				top: 0,
				left: 0,
			})
			.on('click touchend', function(){
				if (configs.shareflag == 1)
					$(this).hide();
				configs.shareflag = 0;
			});

			$('#help')
			.html(configs.words.help)
			.css({
				bottom: bridge.convertLength(80),
				display: 'none',
			}).fadeIn(2000);

    		bridge.init();
    		timer.init();

    		$('#bn_start').on('click touchend', function(){
				game.start();
			});
    	},
    	start: function(){
    		if (funcTick != null)
    			this.finish();
    		state = configs.gaming.status.run;
			$('#welcomedialog').fadeOut('slow');
			$('#winview').fadeOut('slow');
			$('#share').fadeOut('slow');
			$('#retry').fadeOut('slow');
			$('#help').fadeOut('slow');

			lastTick = 0;
    		bridge.reset();
    		timer.reset();
			funcTick = setInterval('game.tick()', 40);
    	},
    	finish: function(){
    		timer.hide();
    		clearInterval(funcTick);
    		funcTick = null;
    		var t = timer.getTime();
    		if (bestscore < 0 || t < bestscore)
    			bestscore = t;
    	},
    	tick: function(){
    		var t = (new Date()).getTime();
    		if (lastTick > 0){
	    		var span = (t - lastTick) * 0.001;
	    		state = timer.tick(span);
	    		if (state == configs.gaming.status.win ||
	    			state == configs.gaming.status.lose){
		    		this.finish();
		    		bridge.onResult(state);
		    		if (state == configs.gaming.status.win){
    					this.updatewx();
		    			this.notifyServer();
		    		}
	    		}
    		}
			lastTick = t;
    	},
    	getState: function(){
    		return state;
    	},
    	notifyServer: function(){
    		$.ajax({
    			url: '../lib/php/records.php',
    			type: 'post',
    			data:{
    				proj: 'lovebridge',
    				score: bestscore,
    			},
				dataType: 'html',
    			error: function(){},
    			success: function(){},
    		});
    	}
    };
})();

$(function(){
	game.preload();
	game.init();
});
