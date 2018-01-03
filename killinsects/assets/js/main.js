
COMMONCONFIGS.WX_APPID = COMMONCONFIGS.WX_APPID_XYGAME;

var configs = {
	mpurl: 'http://mp.weixin.qq.com/s?__biz=MjM5NjI1NDUzNQ==&mid=200617553&idx=1&sn=e64038ed336a0d0fe10775ddfdbe5914#rd',
	frog: {
		size: 96,
		velocity_min: 600,
		velocity_max: 1400,
		maxholdtime: 0.8,
		jumpgravity: 1500,
		states: {stay:0, sit:1, jump:2, eat:3},
		frames: [
			[{x: 0, y: 0}],
			[{x: 0, y: -96}],
			[{x: 0, y: -192}, {x: -96, y: -192}],
		],
	},
	insect: {
		size: 64,
		states: {fly:0, destroy:1, flyback:2, dying:3},
		kinds_count: 8,
		speed_min: 400,
		speed_max: 2000,
		borninterval_max: 2.5,
		borninterval_min: 0.5,
		borninterval_cur: 0,
		difficult_spantime: 60 * 1,// the time of steping to the most difficult status
		id_counter: 0,
	},
	rice: {
		maxhp: 10,
		destroyspeed_ps_min: 2,
		destroyspeed_ps_max: 4,
		destroyspeed_ps_cur: 0,
		recoverspeed_ps: 0.5,
		locations: [
			{w: 26, p1: [15,402], p2: [5,470]},
			{w: 30, p1: [54,365], p2: [33,443]},
			{w: 21, p1: [35,454], p2: [38,488]},
			{w: 28, p1: [57,448], p2: [68,489]},
			{w: 28, p1: [70,397], p2: [89,464]},
			{w: 30, p1: [123,331], p2: [101,423]},
			{w: 27, p1: [152,418], p2: [136,478]},
			{w: 23, p1: [169,445], p2: [173,485]},
			{w: 27, p1: [163,365], p2: [176,444]},
			{w: 24, p1: [215,411], p2: [210,466]},
			{w: 27, p1: [204,470], p2: [219,515]},
			{w: 33, p1: [218,284], p2: [231,387]},
			{w: 25, p1: [244,435], p2: [232,490]},
			{w: 31, p1: [297,327], p2: [268,361]},
			{w: 28, p1: [268,361], p2: [254,414]},
			{w: 27, p1: [280,425], p2: [285,487]},
			{w: 30, p1: [293,374], p2: [312,449]},
		]
	},
	farm: {
		resolution: {w: 320, h: 640},
	},
	gaming: {
		screensize: {
			w: 0, h: 0
		},
		states: {init:0, title:1, gaming:2, over:3},
	},
	sound: {
		states: {frog_jump:0, frog_kill:1, insect_fly:2, insect_eat:3, rice_die:4, gameover:5},
		res: [
				['jump1.wav'],
				['kill2.wav'],
				['insect1.wav','insect2.wav','insect3.wav'],
				['eating.wav'],
				['ricedie.wav'],
				['over1.wav'],
		],
		times: [
			2, 2, 60, 60, 3, 4
		],
		autoid: 1,
	}
};

var sound = (function(){
	var channels = [];
	return {
		play: function(idx, loop){
			// var sounds = configs.sound.res[idx];
			// var file = sounds[Math.floor(Math.random() * sounds.length)];
			// var id = configs.sound.autoid++;
			// var elm = '	<audio id="snd'+id+'" src="assets/sounds/'+file+'" ';
			// if (loop)
			// 	elm += 'loop="loop"';
			// elm += ' autoplay="autoplay"></audio>';
			// $('body').append(elm);
			// channels.push({
			// 	id: id,
			// 	idx: idx,
			// 	resttime: configs.sound.times[idx],
			// });
			// return id;
			return 0;
		},
		stop: function(id){
			// $('#snd'+id).remove();
		},
		tick: function(span){
			for (var i = 0; i < channels.length; i++) {
				var s = channels[i];
				s.resttime -= span;
				if (s.resttime <= 0){
					this.stop(s.id);
				}
			};
		},
		finish: function(){
			for (var i = 0; i < channels.length; i++) {
				this.stop(channels[i].id);
			};
			channels = [];
			this.play(configs.sound.states.gameover, false);
		}
	}
})();

var insect = function(){
	var elm;
	var id, type, size, curpos, targetrice, targetricePos;
	var vel, curdir, state,soundid, ticker;
	return {
		init: function(targetRiceIdx){
			// soundid = sound.play(configs.sound.states.insect_fly, true);
			id = 'insect'+(++configs.insect.id_counter);
			type = Math.floor(Math.random() * configs.insect.kinds_count);
			curpos = {
				x: Math.round(Math.random() * game.getScreenSize().w),
				y: -configs.insect.size,
			};
			size = configs.insect.size;
			targetrice = farm.getRice(targetRiceIdx);
			var ricedir = maths.getDirection(targetrice.p1, targetrice.p2);
			var ricelen = Math.random() * maths.getDistance(targetrice.p1, targetrice.p2);
			targetricePos = {
				x: targetrice.p1.x + ricedir.x * ricelen,
				y: targetrice.p1.y + ricedir.y * ricelen,
			};
			vel = configs.insect.speed_min;
			curdir = {x: 0, y: 0};
			state = configs.insect.states.fly;
			ticker = 0;
			var dy = Math.floor(type / 3) * -size, dx = Math.floor(type % 3) * -size;
			var div = '<div id="' + id + '" style="position:absolute;';
			div += 'background-image: url(assets/images/insects.png);';
			div += 'background-position: '+dx+'px '+dy+'px;';
			div += 'z-index:80"';
			div += '></div>';
			$('body').append(div);
			elm = $('#'+id);
		},
		tick: function(span){
			if (state != configs.insect.states.dying){
				var dist = maths.getDistance(curpos, frog.getPos());
				if (dist < 50){
					var ds = 2 * -size;
					$('#'+id).css('background-position', ds+'px '+ds+'px');
					$('#ricenum'+targetrice.id).hide();
					targetrice.destroyers -= 1;
					state = configs.insect.states.dying;
					ticker = 1;
					sound.stop(soundid);
					sound.play(configs.sound.states.frog_kill);
					game.addScore();
				}
			}

			if (state == configs.insect.states.fly){
				var restdist = maths.getDistance(curpos, targetricePos);
				var dist = vel * span;
				if (dist > restdist)
					dist = restdist;
				curdir = maths.getDirection(curpos, targetricePos);
				curpos.x += curdir.x * dist;
				curpos.y += curdir.y * dist;
				this.updateLocation();
				if (dist == restdist){
					state = configs.insect.states.destroy;
					$('#ricenum'+targetrice.id).show();
					targetrice.destroyers += 1;
					sound.stop(soundid);
					// soundid = sound.play(configs.sound.states.insect_eat, true);
				}
			}
			else if (state == configs.insect.states.destroy){
				targetrice.hp -= configs.rice.destroyspeed_ps_cur * span;
				// console.log(targetrice.hp);
				if (targetrice.hp <= 0){
					targetrice.hp = 0;
					state = configs.insect.states.flyback;
					var fx = 0;
					if ((Math.random() * 2) < 1)
						fx = -configs.insect.size * 2;
					else
						fx = game.getScreenSize().w + configs.insect.size;
					var fy = Math.round(Math.random() * curpos.y);
					curdir = maths.getDirection(curpos, {x:fx, y:fy});

					farm.destroyRice(targetrice);
					sound.stop(soundid);
					// soundid = sound.play(configs.sound.states.insect_fly, true);
				}
				else{
					$('#ricenum'+targetrice.id+' > .riceblood').html(Math.floor(targetrice.hp));
				}
			}
			else if (state == configs.insect.states.flyback){
				var dist = vel * span;
				curpos.x += curdir.x * dist;
				curpos.y += curdir.y * dist;
				var r = configs.insect.size * 0.5;
				if (curpos.x < -r || curpos.x > game.getScreenSize().w - r){
					sound.stop(soundid);
					$('#'+id).remove();
					return false;
				}
				else{
					this.updateLocation();
				}
			}
			else if (state == configs.insect.states.dying){
				ticker -= span;
				if (ticker <= 0){
					farm.recoverRice(targetrice);
					$('#'+id).remove();
					return false;
				}
			}
			return true;
		},
		updateLocation: function(){
			elm.css({
				width: size,
				height: size,
				left: curpos.x - size * 0.5,
				top: curpos.y - size * 0.5,
			});
		}
	};
}

var frog = (function(){
	var elm;
	var cur_pos = {x:0, y:0};
	var cur_frompos = {x:0, y:0};
	var cur_targetpos = {x:0, y:0};
	var cur_jump_vel = {x:0, y:0};
	var cur_jump_lasttick = 0.0;
	var cur_hold_lasttick = 0.0;
	var cur_hold_strength = 0.0;
	var curframe = -1;
	var strength_dir = 1;
	var state = configs.frog.states.stay;
	var isHolding = false;
	var stateChanged = false;

	return {
		init: function(){
			elm = $('#frog');
			elm.show();
		    var screen_size = game.getScreenSize();
			this.move({
				x: screen_size.w * 0.5,
				y: screen_size.h - configs.frog.size * 0.5,
			});
			this.setState(configs.frog.states.stay);
		},
		reset: function(){

		},
		tick: function(span){
			if (isHolding){
				cur_hold_strength += strength_dir * (span / configs.frog.maxholdtime);
				if (strength_dir == 1){
					if (cur_hold_strength >= 1){
						cur_hold_strength = 1;
						strength_dir = -1;
					}
				}
				else{
					if (cur_hold_strength <= 0){
						cur_hold_strength = 0;
						strength_dir = 1;
					}
				}
				this.updateStrength();
			}
			var frame = curframe + 1;
			if (frame >= configs.frog.frames[state].length)
				frame = 0;
			if (curframe != frame || stateChanged){
				stateChanged = false;
				var framepos = configs.frog.frames[state][frame];
				$('#frog').css('background-position', framepos.x + 'px ' + framepos.y + 'px');
				curframe = frame;
			}

			if (state == configs.frog.states.jump){
				this.tickJump(span);
			}
		},
		tickJump: function(span){
		    var screen_size = game.getScreenSize();
			var pos = cur_pos;
			var restdist = maths.getDistance(pos, cur_targetpos);
			cur_jump_vel.y += configs.frog.jumpgravity * span;
			var dist = maths.getLength(cur_jump_vel) * span;
			var dir = maths.getVectorDirection(cur_jump_vel);
			pos.x += dir.x * dist;
			pos.y += dir.y * dist;
			var radius = configs.frog.size * 0.5;
			if (pos.x < radius)
				pos.x = radius;
			else if (pos.x > screen_size.w - radius)
				pos.x = screen_size.w - radius;
			if (pos.y > cur_frompos.y)
				pos.y = cur_frompos.y;
			this.move(pos);
			if (dist == restdist || pos.y == cur_frompos.y){
				this.landing();
			}
			else{
				// this.eatInsects();
			}
		},
		move: function(pos){
			cur_pos = pos;
			elm.css({
				width: configs.frog.size,
				height: configs.frog.size,
				left: pos.x - configs.frog.size * 0.5,
				top: pos.y - configs.frog.size * 0.5,
			});
		},
		updateStrength: function(){
			var n = Math.round(cur_hold_strength * 10);
			var str = '';
			for (var i = 0; i < n; i++)
				str += '■';
			for (var i = n; i < 10; i++)
				str += '□';
			$('#strength').html(str);
		},
		hold: function(){
			isHolding = true;
			cur_hold_strength = 0;
			if (state == configs.frog.states.stay){
				this.setState(configs.frog.states.sit);
			}
		},
		jump: function(pos){
			isHolding = false;
			if (state != configs.frog.states.sit || maths.getDistance(cur_pos, pos) < 10)
				return;
			cur_frompos = {x: cur_pos.x, y: cur_pos.y};
			cur_targetpos = pos;
			var speed = cur_hold_strength * (configs.frog.velocity_max - configs.frog.velocity_min) + configs.frog.velocity_min;
			var dir = maths.getDirection(cur_frompos, cur_targetpos);
			cur_jump_vel = {x: dir.x * speed, y: dir.y * speed};
			sound.play(configs.sound.states.frog_jump, false);
			this.setState(configs.frog.states.jump);
		},
		landing: function(){
			cur_jump_vel = {x: 0, y: 0};
			if (!isHolding){
				this.setState(configs.frog.states.stay);
				cur_hold_strength = 0;
			}
			else{
				this.setState(configs.frog.states.sit);
			}
			this.updateStrength();
		},
		getPos: function(){
			return cur_pos;
		},
		setState: function(s){
			if (state != s){
				state = s;
				stateChanged = true;
			}
		}
	};
})();

var farm = (function(){
	var cover = null;
	var bottomer = null;
	var cur_insects = [];
	var cur_insect_borntick = 0;
	var cur_insect_tick = 0;
	var cur_rices = [];
	var canvas;
	var context2D;
	var redraw = function(){
		var screen_size = game.getScreenSize();
		var offset = -game.getBackImageOffset();
		var backsize = game.getBackImageSize();
		offset = offset / backsize.h * configs.farm.resolution.h;
		if (cover.complete){
			context2D.drawImage(cover, 0, offset, 320, 640 - offset,
				0, 0, screen_size.w, screen_size.h);
			context2D.drawImage(cover, 0, game.getBackImageOffset(), backsize.w, backsize.h);
		}
		else{
			cover.onload = function(e){
				context2D.drawImage(cover, 0, offset, 320, 640 - offset,
					0, 0, screen_size.w, screen_size.h);
			}
		}
	}

	return {
		init: function(){
			var screen_size = game.getScreenSize();
			context2D = document.getElementById("canvas").getContext("2d");
			canvas = $('canvas');
			canvas.attr({
				width: screen_size.w,
				height: screen_size.h,
			});
			bottomer = $('#farm_destroyed')[0];
			cover = new Image();
			cover.src = 'assets/images/back.jpg';
			redraw();
			frog.init();
		},
		reset: function(){
			var screen_size = game.getScreenSize();
			cur_rices = [];
			var radius = configs.insect.size * 0.5;
			var scale = screen_size.w / configs.farm.resolution.w;
			var offset = game.getBackImageOffset();
			for (var i = 0; i < configs.rice.locations.length; i++) {
				var r = configs.rice.locations[i];
				var p1 = {x: r.p1[0] * scale, y: r.p1[1] * scale + offset};
				var p2 = {x: r.p2[0] * scale, y: r.p2[1] * scale + offset};
				var dom = '<div id="ricenum' + i + '" style="z-index:90;display:none;left:'+p1.x+'px;top:'+p1.y+'px;">'
						+ '<span class="riceblood">' + configs.rice.maxhp + '</span>'
						+ '</div>';
				$('body').append(dom);
				cur_rices.push({
					id: i,
					p1: p1,
					p2: p2,
					w: r.w,
					hp: configs.rice.maxhp,
					destroyers: 0,
				});
			};
			redraw();
			frog.reset();
		},
		tick: function(span){
			frog.tick(span);
			cur_insect_borntick += span;
			if (cur_insect_borntick > configs.insect.borninterval_cur){
				this.bornInsect();
				cur_insect_borntick = 0;
			}
			configs.insect.borninterval_cur -= span / configs.insect.difficult_spantime;
			if (configs.insect.borninterval_cur < configs.insect.borninterval_min)
				configs.insect.borninterval_cur = configs.insect.borninterval_min;
			configs.rice.destroyspeed_ps_cur += span / configs.insect.difficult_spantime;
			if (configs.rice.destroyspeed_ps_cur > configs.rice.destroyspeed_ps_max)
				configs.rice.destroyspeed_ps_cur = configs.rice.destroyspeed_ps_max;

			for (var i = 0; i < cur_insects.length; i++) {
				if (!cur_insects[i].tick(span)){
					cur_insects.splice(i--, 1);
				}
			};
			var count = 0;
			for (var i = 0; i < cur_rices.length; i++) {
				var r = cur_rices[i];
				if (r.hp > 0)
					count++;
				if (r.destroyers <= 0 && r.hp > 0 && r.hp < configs.rice.maxhp){
					r.hp += configs.rice.recoverspeed_ps * span;
					if (r.hp > configs.rice.maxhp){
						r.hp = configs.rice.maxhp;
					}
				}
			};
			sound.tick(span);
			return count;
		},
		finish: function(){
		},
		bornInsect: function(){
		    var screen_size = game.getScreenSize();
			var rices = [];
			for (var i = 0; i < cur_rices.length; i++) {
				if (cur_rices[i].hp == 0)
					continue;
				var found = false;
				for (var j = 0; !found && j < cur_insects.length; j++) {
					var o = cur_insects[j];
					if (o.targetrice != null && i == o.targetrice.id)
						found = true;
				};
				if (!found)
					rices.push(i);
			};
			if (rices.length == 0){
				return;
			}
			var riceidx = Math.floor(Math.random() * rices.length);
			var ins = new insect();
			ins.init(rices[riceidx]);
			cur_insects.push(ins);
		},
		getRice: function(index){
			 return cur_rices[index];
		},
		destroyRice: function(rice){
			$('#ricenum'+rice.id).remove();

			var src_pos = configs.rice.locations[rice.id];
			var offset = game.getBackImageOffset();
			var img_size = game.getBackImageSize();
		    var dir = maths.getDirection({x:src_pos.p1[0],y:src_pos.p1[1]}, {x:src_pos.p2[0],y:src_pos.p2[1]});
			var scale = img_size.w / configs.farm.resolution.w;
	    	var r = src_pos.w;
		    var sp = {x: src_pos.p1[0] - r * 0.5, y: src_pos.p1[1]};
		    while (sp.y <= src_pos.p2[1]){
		    	var x = sp.x * scale;
		    	var y = sp.y * scale + offset;
		    	context2D.drawImage(bottomer, sp.x, sp.y, r, r, x, y, r * scale, r * scale);
		    	sp.y += dir.y * 10;
		    	sp.x += dir.x * 10;
		    }
			// sound.play(configs.sound.states.rice_die);
		},
		recoverRice: function(index){
			if (index >= 0){
				var rice = cur_rices[index];
				rice.hp = configs.rice.maxhp;
				$('#rice'+rice.id).remove();
			}
		}
	};
})();

var game = (function(){
	var cur_gamestate = configs.gaming.states.init;
	var lastTick = 0;
	var tickHandle;
	var cur_kill_count = 0;
	var back_size;
	var offsetY = 0;
	var bestscore = 0;
	return {
		init: function(){
			this.updatewx();
		    var screen_size = this.getScreenSize();
    		var bi = $('#farm_destroyed');
    		back_size = {
    			w: screen_size.w,
    			h: screen_size.w * (configs.farm.resolution.h / configs.farm.resolution.w),
    		};
    		if (back_size.h < screen_size.h)
    			back_size.h = screen_size.h;
    		offsetY = screen_size.h - back_size.h;
    		bi.attr({
    			width: back_size.w,
    			height: back_size.h,
    		}).css('top', offsetY + 'px');

			$('#gamemask').css({
				width: screen_size.w,
		    	height: screen_size.h,
			});
			$('body').on('mousedown touchstart', function(e){
				event.preventDefault();
				if (cur_gamestate == configs.gaming.states.gaming){
					frog.hold();
				}
			}).on('mouseup touchend', function(e){
				event.preventDefault();
				if (cur_gamestate == configs.gaming.states.gaming){
					var pos = {x:e.pageX, y:e.pageY};
					var touches = e.originalEvent.changedTouches;
					if (touches != null && touches.length > 0){
			            pos.x = touches[0].clientX;
			            pos.y = touches[0].clientY;
					}
					frog.jump(pos);
				}
			});

			$('#replay').on('click touchend', function(){
				game.start();
			});
			$('#share').on('click touchend', function(){
				event.preventDefault();
				$('#sharetip').show();
				setTimeout('configs.shareflag = 1;', 500);
    		});
			$('#focus').on('click touchend', function(){
				window.location.href = configs.mpurl;
			});
			$('#start').on('click touchend', function(){
				game.start();
			});

			$('#sharetip')
			.css({
				width: screen_size.w,
				height: screen_size.h,
				top: 0,
				left: 0,
			})
			.on('click touchend', function(){
				if (configs.shareflag == 1)
					$(this).hide();
				configs.shareflag = 0;
			});

			farm.init();
			cur_gamestate = configs.gaming.states.title;
			this.visitServer();
			// $('#snd_music')[0].play();
		},
		start: function(){
			$('#welcomedialog').hide();
			$('#gamemask').hide();
			$('#resultdialog').hide();
			$('#sharetip').hide();

			if (tickHandle != null)
				clearInterval(tickHandle);
			tickHandle = setInterval('game.tick();', 40);
			farm.reset();

			configs.insect.borninterval_cur = configs.insect.borninterval_max;
			configs.rice.destroyspeed_ps_cur = configs.rice.destroyspeed_ps_min;
			cur_insect_tick = 0;
			cur_kill_count = 0;
			cur_gamestate = configs.gaming.states.gaming;
			$('#killcount').html('0');
		},
		finish: function(){
			cur_gamestate = configs.gaming.states.over;
			var textplus = '';
			if (bestscore < cur_kill_count){
				if (bestscore > 0)
					textplus = '刷新了你的最好记录！';
				bestscore = cur_kill_count;
			}
			else
				textplus = '你的最好成绩是'+bestscore+'个，再接再厉！';
			var text = '';
			if (cur_kill_count == 0){
				text = '庄稼被吃光了，你也一只害虫也没抓到！' + textplus;
			  	COMMONMETHODS.setWeixinProperties(null, "我一个害虫也没杀死，好丢人啊！", null);
			}
			else if (cur_kill_count < 100){
				text = '你消灭了<span style="font-weight:bold;font-size:48px">'+cur_kill_count+'</span>个害虫，'+textplus;
				text += '<br/>赶紧告诉你的朋友们一起捉害虫吧！';
			  	COMMONMETHODS.setWeixinProperties(null, "我消灭了"+cur_kill_count+"个害虫！快一起来保卫庄稼吧！", null);
			}
			else{
				text = '太棒了！你消灭了<span style="font-weight:bold;font-size:48px">'+cur_kill_count+'</span>个害虫！'+textplus;
				text += '<br/>赶紧告诉你的朋友们一起捉害虫吧！';
			  	COMMONMETHODS.setWeixinProperties(null, "我消灭了"+cur_kill_count+"个害虫！击败了全球99%的青蛙！", null);
			}
			this.notifyServer();

			$('#resulttext').html(text);
			$('#gamemask').show();
			$('#resultdialog').show();
			sound.finish();
		},
		tick: function(){
			var t = (new Date()).getTime();
    		if (lastTick > 0){
	    		if (farm.tick((t - lastTick) * 0.001) <= 0){
	    			if (cur_gamestate == configs.gaming.states.gaming)
	    				this.finish();
	    		}
    		}
			lastTick = t;
		},
		getScreenSize: function(){
			var win = $(window).get(0);
		    return {
		    	w: win.innerWidth,
    			h: win.innerHeight,
    		};
		},
		getBackImageSize: function(){
			return back_size;
		},
		getBackImageOffset: function(){
			return offsetY;
		},
		updatewx: function(){
			COMMONMETHODS.setWeixinProperties("assets/images/icon.png", "害虫来了", "一大波害虫来袭，青蛙们你还在等什么？快来消灭害虫保卫庄稼吧！");
		},
		addScore: function(){
			cur_kill_count++;
			$('#killcount').html(cur_kill_count);
		},
		getStatus: function(){
			return cur_gamestate;
		},
    	notifyServer: function(){
    		$.ajax({
    			url: '../lib/php/records.php',
    			type: 'post',
    			data:{
    				proj: 'killinsects',
    				score: bestscore,
    			},
				dataType: 'html',
    			error: function(){},
    			success: function(){},
    		});
    	},
    	visitServer: function() {
            $.ajax({url: "../lib/php/visits.php",type: "post",data: {proj: "killinsects",},dataType: "html",});
        }
	}
})();

$(function(){
	game.init();
});