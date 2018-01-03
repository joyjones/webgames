var datas = {
	// 资源描述
	// nx/ny：图片横纵分别分为多少个格子
	// cx/cy：元素占用多少格子
	// x/y：元素起始点位于哪个格子
	// img：图片资源对象指针
	// hotRate：从中心开始用于碰撞检测的范围半径比例
	// frameCnt：用于动画的有效帧数
	res: {
		stars: {
			file: 'stars.png', nx: 8, ny: 2,
			img: null,
			units: [
				{x: 0, y: 0, cx: 2, cy: 2},
				{x: 2, y: 0, cx: 1, cy: 1},
				{x: 3, y: 0, cx: 0.2, cy: 0.2},
			]
		},
		roles: {
			file: 'roles.png', nx: 5, ny: 1,
			img: null,
			player: {x: 0, y: 0, cx: 1, cy: 1, hotRate: 0.5},
			enemies: [
				{x: 1, y: 0, cx: 1, cy: 1, hotRate: 0.7},
				{x: 2, y: 0, cx: 1, cy: 1, hotRate: 0.8}
			],
			boss: {x: 3, y: 0, cx: 1, cy: 1, hotRate: 1},
			bomb: {x: 4, y: 0, cx: 1, cy: 1}
		},
		explode: {
			file: 'explode.png', nx: 3, ny: 3,
			img: null,
			frameCnt: 4
		},
		icons: {
			file: 'icons.png', nx: 5, ny: 5,
			img: null,
			rewards: {
				x: 0, y: 0, size: 1, count: 15
			},
			bullets: [
				{x: 4, y: 3, cx: 1, cy: 1},
				{x: 4, y: 4, cx: 1, cy: 1}
			],
			capsules: [
				{x: 0, y: 3, cx: 2, cy: 2},
				{x: 2, y: 3, cx: 2, cy: 2}
			]
		},
	},
	// 实时视图信息
	// w/h：屏幕宽高
	// scale：当前视图与640像素间的缩放比
	view: {
		w: 0, h: 0, scale: 1
	},
	game: {
		state: 0, //0: prepare, 1: gaming, 2: gameover
		lastTick: 0,
		elapsedTime: 0,
		restFinishTime: 0,
		// 打掉BOSS的奖励物ID
		bossRewards: [],
		// 每个奖励模块的名称列表
		bossRewardsNames: [],
		// 最大核弹数量
		maxBombCount: 3,
		// 难度递增系数：freqCutPS 每秒频率加快毫秒数，speedAddPS 每秒速度增加位移数
		difficultyRate: {freqCutPS: 0.003, speedAddPS: 0.05},
		debugMode: false
	},
	// 实时玩家信息
	player: {
		pos: {x: 0, y: 0},
		size: {w: 0, h: 0},
		score: 0,
		state: 1,
		bulletLv: 0,
		restBombs: 0,
		curRewards: [],
		dragging: {on: false, offset: {x: 0, y: 0}},
		reset: function(_pos, _size){
			this.pos = _pos;
			this.size = _size;
			this.state = 1;
			this.score = 0;
			this.state = 1;
			this.bulletLv = 0;
			this.restBombs = 0;
			this.curRewards.length = 0;
			this.dragging.on = false;
		}
	},
	// 实时宇宙信息
	universe: {
		restBornTime: 0,
		bornTimeSpan: {min: 2.5, max: 5},
		scaleRange: {min: 0.5, max: 1.2},
		speedRange: {min: 0.3, max: 1.2},
		maxCountOnScreen: 12,
		stars: [],// 格式：{resIndex: 0, pos: {x:0, y:0}, size: 1, speed: 1}
		reset: function(){
			this.restBornTime = 0;
			this.stars.length = 0;
		}
	},
	// 实时敌机信息
	enemies: {
		scaleRange: {min: 0.6, max: 1},
		hpRange: {min: 1, max: 3, probs: [0.1, 0.2, 1]},
		maxCountOnScreen: 50,
		killScore: 100,
		planes: [],// 格式：{resIndex: 0, pos: {x:0, y:0}, size: 1, maxHp: 1, hp: 1, speed: 1, score: 100, state: 0(dying)/1(living)/2(hurting)}
		// BOSS在分数在S=(base±range)时开始第一次出现，然后再次间隔(S+step±range)分后再次出现，循环往复
		bossBornScoreRange: {base: 3000, range: 500, step: 2000},
		// BOSS总共出现bossCount次
		bossCount: 3,
		// BOSS血量从base开始，之后出现每次增加step
		bossHpRange: {base: 10, step: 8},
		bossSpeedRange: {min: 1.5, max: 4},
		boss: {
			index: -1,
			level: -1,
			nextBornScore: -1,
			pos: {x: 0, y: 0},
			size: 1,
			hp: 0, maxHp: 0,
			speed: 1,
			score: 200,
			state: -1,
		},
		reset: function(){
			this.planes.length = 0;
			this.boss.index = -1;
			this.boss.level = -1;
			this.boss.nextBornScore = -1;
			this.boss.maxHp = this.boss.hp = 0;
			this.boss.state = -1;
		}
	},
	// 实时子弹信息
	bullets: {
		speed: 28,
		restBornTime: 0,
		bornInterval: 0.25,
		damages: [1, 2],
		objs: [],
		reset: function(){
			this.restBornTime = 0;
			this.objs.length = 0;
		}
	},
	// 实时药丸信息
	capsules: {
		speed: 4,
		objs: [
			{name: 'weapon', active: false, pos: {x:0, y:0}, size: 1, nextBornScore: 0},
			{name: 'bomb', active: false, pos: {x:0, y:0}, size: 1, restBornTime: 0}
		],
		// 当玩家当前子弹等级为0并获得base±range分时，出现子弹升级药丸，错失后需重新等待
		upBulletScore: {base: 2000, range: 300},
		// 当玩家当前核弹数量分别为0、1、2时，分别要等待相应的span±range秒后，出现核弹药丸，错失后需重新等待
		upBombWaitTimes: [{span: 15, range: 2}, {span: 25, range: 3}, {span: 40, range: 4}],
	},
	// 实时界面信息
	hud: {
		bomb: {pos: {x: 0, y: 0}, size: 1},
	},
	// 实时敌机发射器信息
	emitters: {
		// 发射器1：随机位置吐敌
		// 发射器2：向左或向右顺序吐敌
		// 发射器3：中央扩散双头吐敌（未开发）
		// 发射器4：两边聚拢双头吐敌（未开发）
		instances: [],
		// 当前三种阵型出现方案，freq为初始频率，speed为初始速度，按game中的difficultyRate递增难度
		configs: [
			/*0*/{mode: 0, untilScore: 4000, reset: {spanTime: 0, freq: 0.7, speed: 1.8}},
			/*1*/{mode: 1, reset: {moveRatio: 1.2, dir: 1, spanTime: 0, cursor: 0, freq: 0.15, speed: 1.5}},
			/*2*/{mode: 1, reset: {moveRatio: 1.2, dir: -1, spanTime: 0, cursor: 1, freq: 0.15, speed: 1.5}},
		],
		// 三种阵型的出现顺序
		progress: [0,1,2,1,2],
		// 当前游戏所处敌机阵型索引
		progressIndex: -1,
		reset: function(){
			this.instances = [
				{name: 'random'},
				{name: 'line'},
				{name: 'pioneer'},
				{name: 'surround'}
			];
			this.progressIndex = -1;
		}
	},
	sounds: {
		bg: null,
		bullets: null,
		bomb: null,
		explode: null
	}
};

var main = (function() {
	var reses = []; // 要加载的资源
	var canvas = null, graph = null, dlgGameOver, rewardTip;
	var funcBulletSound = null;
	// 根据位置、尺寸、热点比例获取矩形范围
	var getBoundRect = function(pos, size, hotRate){
		!hotRate && (hotRate = 1);
		if (typeof(size.w) === 'undefined')
			size = {w: size, h: size};
		var sz = {w: size.w * 0.5 * hotRate, h: size.w * 0.5 * hotRate};
		return {
			x1: pos.x - sz.w,
			y1: pos.y - sz.h,
			x2: pos.x + sz.w,
			y2: pos.y + sz.h,
		};
	};
	// 判定点落入矩形
	var pointInRect = function(rc, x, y){
		return x >= rc.x1 && y >= rc.y1 && x <= rc.x2 && y <= rc.y2;
	};
	// 按两位置的范围半径碰撞检测
	var checkCollision = function(pos1, size1, rate1, pos2, size2, rate2){
		if (datas.game.debugMode)
			return false;
		(typeof(size1.w) !== 'undefined') && (size1 = size1.w);
		(typeof(size2.w) !== 'undefined') && (size2 = size2.w);
		size1 *= rate1 * 0.5;
		size2 *= rate2 * 0.5;
		var dist = Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
		if (dist >= size1 + size2)
			return false;
		return true;
	};
	return {
		// 初始化游戏
		init: function(){
			// 初始化视图尺寸
			datas.view.w = $(window).width(),
			datas.view.h = $(window).height(),
			datas.view.scale = datas.view.w / 400.0;
			// 初始化画布并绑定鼠标事件
			canvas = $('canvas#gameView');
			canvas.attr({
				width: datas.view.w,
				height: datas.view.h
			}).on('vclick', function(e){
				e.preventDefault();
				main.onMouseClick(e);
			}).on('vmousedown', function(e){
				e.preventDefault();
				main.onMouseDown(e);
			}).on('vmouseup', function(e){
				e.preventDefault();
				main.onMouseUp(e);
			}).on('vmousemove', function(e){
				e.preventDefault();
				main.onMouseMove(e);
			});
			canvas = canvas[0];
			graph = canvas.getContext("2d");

			datas.sounds.bg = document.getElementById('a-bg');
			// datas.sounds.bullets = document.getElementById('a-bullets');
			// datas.sounds.bomb = document.getElementById('a-bomb');
			// datas.sounds.explode = document.getElementById('a-explode');

			rewardTip = $('section.game .rewardTip');
			dlgGameOver = $('section.game .gameOver');
			dlgGameOver.css({height: datas.view.h});
			$('section.game .gameOver .retry').on('vclick', function(){
				main.startGame();
			});
			// 预加载资源，加载结束后启动游戏
			this.loadImages(function() {
				console.log('image loading finished.');
				main.startGame();
			});

			this.playBkMusic(true);
		},
		// 加载资源：入口
		loadImages: function(callbk) {
			// 统计要加载的资源
			for (var r in datas.res){
				reses.push(datas.res[r]);
			}
			// 加载第一个资源
			this.loadNextImage(0, callbk);
		},
		// 加载资源：显示进度
		updateLoadingTip: function(idx){
			var c = idx + 1;
			$('section.loading .progress').text('正在加载(' + c + '/' + reses.length + ')……');
		},
		// 加载资源：加载下一个
		loadNextImage: function(idx, doneCallbk) {
			this.updateLoadingTip(idx);
			var info = reses[idx];
			info.img = new Image();
			info.img.onload = function(){
				console.log('image' + (idx+1) + ' loaded');
				if (idx >= reses.length - 1){
					reses.length = 0;
					doneCallbk && doneCallbk();
				}else{
					main.loadNextImage(idx + 1, doneCallbk);
				}
			}
			info.img.src = 'img/' + info.file;
		},
		// 开始游戏
		startGame: function(){
			$('section.loading').hide();
			$('section.game').show();
			dlgGameOver.hide();
			// 重置玩家、敌机、子弹、宇宙
			var r = datas.res.roles;
			datas.player.reset({x: datas.view.w * 0.5, y: datas.view.h * 0.9}, this.getUnitViewSize(r, r.player.cx, r.player.cy));
			datas.enemies.reset();
			datas.bullets.reset();
			datas.universe.reset();
			datas.emitters.reset();
			datas.game.elapsedTime = 0;
			this.playBulletsSound(true);

			// 初始化宇宙
			while (datas.universe.stars.length < datas.universe.maxCountOnScreen * 0.6)
				this.bornStar(true);
			// 开始主循环
			datas.game.state = 1;
			main.tick();
		},
		// 结束游戏
		finishGame: function() {
			datas.game.state = 2;
			datas.player.dragging.on = false;
			dlgGameOver.show();
		},
		playBulletsSound: function(play){
			// if (!funcBulletSound && play){
			// 	funcBulletSound = setInterval(function(){
			// 		datas.sounds.bullets.load();
			// 		datas.sounds.bullets.play();
			// 	}, 250);
			// }else if (funcBulletSound && !play){
			// 	clearInterval(funcBulletSound);
			// }
		},
		playBkMusic: function(play){
			if (play)
				datas.sounds.bg.play();
			else
				datas.sounds.bg.pause();
		},
		showRewardTip: function(){
			var tip = rewardTip;
			var idx = datas.player.curRewards.length - 1;
			if (idx < 0)
				return;
			idx = datas.player.curRewards[idx];
			if (idx < 0 || idx >= datas.game.bossRewardsNames.length)
				return;
			var name = datas.game.bossRewardsNames[idx];
			tip.text('你获得了' + name + '！');
			tip.animate({opacity: 1}, 'slow');
			setTimeout(function(){
				tip.animate({opacity: 0}, 'slow');
			}, 3000);
		},
		// 视图绘制：入口
		draw: function(){
			graph.clearRect(0, 0, canvas.width, canvas.height);
			// 解决有些手机clearRect无效的问题（但开启以下代码会卡）
			// canvas.style.display = 'none';// Detach from DOM
			// canvas.offsetHeight; // Force the detach
			// canvas.style.display = 'inherit'; // Reattach to DOM
			this.drawUniverse();
			this.drawCapsules();
			this.drawEnemies();
			this.drawPlayer();
			this.drawHud();
		},
		// 视图绘制：玩家
		drawPlayer: function(){
			if (datas.player.state >= 0)
				this.drawUnit(datas.res.roles, datas.res.roles.player, datas.player);
			this.drawBullets();
			if (datas.player.state === 0){
				var exp = datas.res.explode;
				var x = datas.player.dyingFrame % datas.res.explode.nx;
				var y = Math.floor(datas.player.dyingFrame / datas.res.explode.nx);
				this.drawUnit(exp, {x: x, y: y, cx: 1, cy: 1}, datas.player);
			}
		},
		// 视图绘制：子弹
		drawBullets: function(){
			for (var i = 0; i < datas.bullets.objs.length; ++i){
				var obj = datas.bullets.objs[i];
				this.drawUnit(datas.res.icons, datas.res.icons.bullets[datas.player.bulletLv], obj);
			}
		},
		// 视图绘制：药丸
		drawCapsules: function(){
			for (var i = 0; i < datas.capsules.objs.length; ++i){
				var obj = datas.capsules.objs[i];
				if (obj.active){
					this.drawUnit(datas.res.icons, datas.res.icons.capsules[i], obj);
				}
			}
		},
		// 视图绘制：敌机和BOSS
		drawEnemies: function(){
			for (var i = 0; i <= datas.enemies.planes.length; ++i){
				var obj = null, unit = null;
				if (i < datas.enemies.planes.length){
					obj = datas.enemies.planes[i];
					unit = datas.res.roles.enemies[obj.resIndex];
				}
				else{
					obj = datas.enemies.boss;
					unit = datas.res.roles.boss;
				}
				if (obj.state < 0)
					continue;
				this.drawUnit(datas.res.roles, unit, obj);
				if (obj.maxHp > 2){
					var rcHp = {
						x: Math.floor(obj.pos.x - obj.size * 0.5), y: Math.floor(obj.pos.y - obj.size * 0.5),
						w: Math.floor(obj.size), h: Math.floor(obj.size * 0.05)
					};
					graph.fillStyle = "#f00";
					graph.fillRect(rcHp.x, rcHp.y, Math.floor(rcHp.w * (obj.hp / obj.maxHp)), rcHp.h);
				}
				if (obj.state === 0 || obj.state === 2){
					var exp = datas.res.explode;
					var x = obj.dyingFrame % datas.res.explode.nx;
					var y = Math.floor(obj.dyingFrame / datas.res.explode.nx);
					var o = {size: obj.size, pos: {x: obj.pos.x, y: obj.pos.y}};
					if (obj.state === 2)
						o.pos.y += obj.size * 0.5;
					this.drawUnit(exp, {x: x, y: y, cx: 1, cy: 1}, o);
				}
			}
		},
		// 视图绘制：宇宙背景
		drawUniverse: function(){
			for (var i = 0; i < datas.universe.stars.length; ++i){
				var obj = datas.universe.stars[i];
				this.drawUnit(datas.res.stars, datas.res.stars.units[obj.resIndex], obj);
			}
		},
		// 视图绘制：界面
		drawHud: function(){
			var rewSize = this.getUnitViewSize(datas.res.icons, 1, 1).w;
			this.drawUnit(datas.res.roles, datas.res.roles.enemies[0], {
				pos: {x: rewSize * 0.75, y: rewSize * 0.60},
				size: rewSize * 1.5
			});
			graph.font = "20px Verdana";
			graph.fillStyle = "#fff";
			graph.fillText(datas.player.score, Math.floor(rewSize * 1.4), Math.floor(rewSize * 0.8));

			var rcnt = 3, rgap = 2;
			var bgnX = datas.view.w - (rewSize - rgap) * rcnt;
			var icons = datas.res.icons;
			for (var i = 0; i < datas.player.curRewards.length; ++i){
				var offset = bgnX + i * (rewSize + rgap);
				var idx = datas.player.curRewards[i];
				if (idx < 0 || idx >= icons.rewards.count - 1)
					continue;
				var row = Math.floor(idx / icons.nx);
				var col = idx % icons.nx;
				var unit = {x: col, y: row, cx: icons.rewards.size, cy: icons.rewards.size};
				this.drawUnit(icons, unit, {
					pos: {x: offset, y: rgap * 2 + rewSize * 0.5},
					size: rewSize
				});
			}

			var rbomb = 0.8;
			datas.hud.bomb.size = this.getUnitViewSize(datas.res.roles, datas.res.roles.bomb.cx, datas.res.roles.bomb.cy).w * rbomb;
			datas.hud.bomb.pos.x = datas.view.w - datas.hud.bomb.size / rbomb * 0.5;
			datas.hud.bomb.pos.y = datas.view.h - datas.hud.bomb.size / rbomb * 0.5;
			this.drawUnit(datas.res.roles, datas.res.roles.bomb, datas.hud.bomb);

			graph.font = "20px Verdana";
			graph.fillStyle = datas.player.restBombs <= 0 ? "#f00" : "#ff0";
			graph.fillText(datas.player.restBombs, 
							Math.floor(datas.hud.bomb.pos.x + datas.hud.bomb.size * 0.15),
							Math.floor(datas.hud.bomb.pos.y - datas.hud.bomb.size * 0.15));
		},
		// 视图绘制：单个物体
		drawUnit: function(res, unit, obj){
			var sz = obj.size;
			if (typeof(sz.w) === "undefined")
				sz = {w: sz, h: sz};
			var di = {
				sx: Math.floor(unit.x / res.nx * res.img.width),
				sy: Math.floor(unit.y / res.ny * res.img.height),
				sw: Math.floor(unit.cx / res.nx * res.img.width),
				sh: Math.floor(unit.cy / res.ny * res.img.height),
				x: Math.floor(obj.pos.x - sz.w * 0.5),
				y: Math.floor(obj.pos.y - sz.h * 0.5),
				w: Math.floor(sz.w),
				h: Math.floor(sz.h),
			};
			graph.drawImage(res.img, di.sx, di.sy, di.sw, di.sh, di.x, di.y, di.w, di.h);
		},
		// 逻辑：入口
		tick: function(){
			var me = main;
			if (datas.game.state != 1)
				return;
			var tick = new Date().getTime();
			var deltaTime = !datas.game.lastTick ? 0 : (tick - datas.game.lastTick);  
			me.tickUniverse(deltaTime);
			me.tickEmitters(deltaTime);
			me.tickEnemies(deltaTime);
			me.tickBoss(deltaTime);
			me.tickPlayer(deltaTime);
			me.tickCapsules(deltaTime);
			me.draw();
			if (datas.game.restFinishTime > 0){
				datas.game.restFinishTime -= deltaTime * 0.001;
				if (datas.game.restFinishTime <= 0){
					me.finishGame();
				}
			}
			datas.game.lastTick = tick;
			datas.game.elapsedTime += deltaTime;
			requestAnimationFrame(me.tick);
		},
		// 逻辑：宇宙推移
		tickUniverse: function(deltaTime){
			var du = datas.universe;
			for (var i = 0; i < du.stars.length; ++i){
				var s = du.stars[i];
				s.pos.y += s.speed;
				if (s.pos.y - s.size * 0.5 > datas.view.h){
					// console.log('star dead:' + s.resIndex);
					du.stars.splice(i--, 1);
				}
			}
			if (du.restBornTime > 0){
				du.restBornTime -= deltaTime;
				if (du.restBornTime <= 0){
					du.restBornTime = 0;
					this.bornStar();
				}
			}
			else if (du.stars.length < du.maxCountOnScreen){
				du.restBornTime = 1000 * (Math.random() * (du.bornTimeSpan.max - du.bornTimeSpan.min) + du.bornTimeSpan.min); 
			}
		},
		// 逻辑：敌机发射器
		tickEmitters: function(deltaTime){
			var index = datas.emitters.progressIndex;
			var configFinished = index < 0;
			if (!configFinished){
				var config = datas.emitters.configs[datas.emitters.progress[index]];
				var inst = datas.emitters.instances[config.mode];
				var xr = -1, speed = 0, sizer = 1, resIdx = undefined;
				inst.spanTime += deltaTime;
				switch (config.mode){
					case 0: {
						if (inst.spanTime >= inst.freq * 1000){
							inst.freq = config.reset.freq - datas.game.difficultyRate.freqCutPS * datas.game.elapsedTime * 0.001;
							inst.spanTime = 0;
							!inst.lastXr && (inst.lastXr = 0);
							xr = inst.lastXr + Math.random() * 0.3 + 0.3;//0.3 ~ 0.6
							while(xr > 1) xr -= 1;
							speed = config.reset.speed + datas.game.difficultyRate.speedAddPS * datas.game.elapsedTime * 0.001;
							speed = speed * 0.7 + (speed * 0.3 * (2 * Math.random() - 1));
							sizer = Math.random();
							inst.lastXr = xr;
						}
					} break;
					case 1: {
						inst.cursor += inst.moveRatio * 0.001 * deltaTime * inst.dir;
						if (inst.dir > 0 && inst.cursor > 1)
							configFinished = true;
						if (inst.dir < 0 && inst.cursor < 0)
							configFinished = true;
						if (!configFinished && inst.spanTime >= inst.freq * 1000){
							inst.spanTime = 0;
							xr = inst.cursor;
							speed = config.reset.speed + datas.game.difficultyRate.speedAddPS * datas.game.elapsedTime * 0.001;
							sizer = 0.5;
							resIdx = 0;
						}
					} break;
				}
				if (xr >= 0){
					this.bornEnemy(xr, speed, sizer, resIdx);
				}
				if (!configFinished && !isNaN(config.untilScore)){
					if (config.untilScore <= datas.player.score - inst.beginScore)
						configFinished = true;
				}
			}
			if (configFinished){
				if (++datas.emitters.progressIndex >= datas.emitters.progress.length)
					datas.emitters.progressIndex = 0;
				var idx = datas.emitters.progress[datas.emitters.progressIndex];
				var config = datas.emitters.configs[idx];
				var inst = datas.emitters.instances[config.mode];
				inst.beginScore = datas.player.score;
				datas.emitters.instances[config.mode] = $.extend({}, inst, config.reset);
				console.log('enter progress: ' + datas.emitters.progressIndex);
			}
		},
		// 逻辑：敌人推移
		tickEnemies: function(deltaTime){
			var de = datas.enemies;
			for (var i = 0; i < de.planes.length; ++i){
				var s = de.planes[i];
				s.pos.y += s.speed;
				if (s.state === 0 && ++s.dyingFrame >= datas.res.explode.frameCnt)
					s.state = -1;
				if (s.state === 2)
					s.state = 1;
				if (s.pos.y - s.size * 0.5 > datas.view.h){
					// console.log('enemy flyover:' + s.resIndex);
					s.state = -1;
				}else{
					this.checkBulletCollision(s, datas.res.roles.enemies[s.resIndex].hotRate);
				}
				if (s.state < 0){
					de.planes.splice(i--, 1);
				}
			}
		},
		// 逻辑：BOSS行为
		tickBoss: function(deltaTime){
			var de = datas.enemies;
			if (de.boss.state < 0) {
				if (de.boss.nextBornScore < 0){
					var rge = Math.random() * (de.bossBornScoreRange.range * 2) - de.bossBornScoreRange.range;
					de.boss.nextBornScore = de.bossBornScoreRange.base + rge;
				}else if (datas.player.score >= de.boss.nextBornScore){
					this.bornBoss();
				}
			}else if (de.boss.state == 0){
				if (++de.boss.dyingFrame >= datas.res.explode.frameCnt){
					de.boss.state = -1;
				}
			}else {
				if (de.boss.state === 2)
					de.boss.state = 1;
				de.boss.pos.y += de.boss.speed;
				if (de.boss.pos.y - de.boss.size * 0.5 > datas.view.h){
					// console.log('boss flyover:' + de.boss.index);
					de.boss.state = -1;
					// 没打死，本BOSS会重新出现
					--de.boss.level;
					// this.decideNextBossBornScore(de.boss.index + 1);
				}else{
					if (this.checkBulletCollision(de.boss, datas.res.roles.boss.hotRate) && de.boss.state === 0){
						if (de.boss.level < datas.game.bossRewards.length){
							datas.player.curRewards.push(datas.game.bossRewards[de.boss.level]);
							this.showRewardTip();
						}
					}
				}
			}
		},
		// 逻辑：玩家碰撞检测、吐子弹、吃奖
		tickPlayer: function(deltaTime){
			var plr = datas.player;
			var de = datas.enemies;
			if (plr.state > 0){
				for (var i = 0; i <= de.planes.length; ++i){
					var e = null, r = 1;
					if (i < de.planes.length){
						e = de.planes[i];
						r = datas.res.roles.enemies[e.resIndex].hotRate;
					}
					else{
						e = de.boss;
						r = datas.res.roles.boss.hotRate;
					}
					if (e.state > 0 && checkCollision(plr.pos, plr.size, datas.res.roles.player.hotRate, e.pos, e.size, r)){
						plr.state = 0;
						plr.dyingFrame = 2;
						// datas.sounds.explode.load();
						// datas.sounds.explode.play();
					}
				}
			}else if (plr.state == 0){
				if (++plr.dyingFrame >= datas.res.explode.frameCnt){
					plr.state = -1;
					this.playBulletsSound(false);
					datas.game.restFinishTime = 1;
				}
			}
			this.tickBullets(deltaTime);
		},
		// 逻辑：子弹碰撞检测
		tickBullets: function(deltaTime){
			var db = datas.bullets;
			for (var i = 0; i < db.objs.length; ++i){
				var b = db.objs[i];
				b.pos.y -= b.speed;
				if (b.pos.y + b.size * 0.5 < 0){
					db.objs.splice(i--, 1);
				}
			}
			if (datas.player.state > 0){
				db.restBornTime -= deltaTime;
				if (db.restBornTime <= 0){
					db.restBornTime = db.bornInterval * 1000;
					this.bornBullet();
				}
			}
		},
		// 逻辑：药丸
		tickCapsules: function(deltaTime){
			var dc = datas.capsules;
			var plr = datas.player;
			// 推移活动中的药丸
			for (var i = 0; i < dc.objs.length; ++i){
				var cap = dc.objs[i];
				if (!cap.active)
					continue;
				cap.pos.y += datas.capsules.speed;
				if (cap.pos.y - cap.size * 0.5 > datas.view.h){
					cap.active = false;
				}else if (checkCollision(plr.pos, plr.size, datas.res.roles.player.hotRate, cap.pos, cap.size, 1)){
					this.applyCapsule(i);
				}
			}
			// 检测产生新的子弹升级药丸
			var obj = dc.objs[0];
			if (!obj.active && datas.player.bulletLv === 0){
				if (obj.nextBornScore === 0){
					obj.nextBornScore = Math.random() * (dc.upBulletScore.range * 2) - dc.upBulletScore.range + dc.upBulletScore.base;
				}else if (datas.player.score >= obj.nextBornScore) {
					obj.nextBornScore = 0;
					this.bornCapsule(0);
				}
			}
			// 检测产生新的核弹药丸
			obj = dc.objs[1];
			if (!obj.active && datas.player.restBombs < datas.game.maxBombCount){
				var cfg = datas.capsules.upBombWaitTimes[datas.player.restBombs];
				if (obj.restBornTime > 0){
					obj.restBornTime -= deltaTime;
					if (obj.restBornTime <= 0){
						obj.restBornTime = 0;
						this.bornCapsule(1);
					}
				}else{
					obj.restBornTime = (Math.random() * (cfg.range * 2) - cfg.range + cfg.span) * 1000;
				}
			}
		},
		// 主角子弹与敌机的碰撞检测
		checkBulletCollision: function(enemy, hotRate){
			var db = datas.bullets;
			for (var i = 0; i < db.objs.length; ++i){
				var b = db.objs[i];
				if (checkCollision(enemy.pos, enemy.size, hotRate, b.pos, b.size, 1)){
					if (enemy.state > 0){
						enemy.hp -= db.damages[datas.player.bulletLv]; 
						if (enemy.hp <= 0){
							enemy.hp = 0;
							enemy.state = 0;
							datas.player.score += enemy.score;
							// datas.sounds.explode.load();
							// datas.sounds.explode.play();
							// console.log('enemy dead');
						}else{
							enemy.state = 2;
							enemy.dyingFrame = 0;
						}
					}
					db.objs.splice(i--, 1);
					return true;
				}
			}
			return false;
		},
		// 出现一个星球
		bornStar: function(comeout){
			var du = datas.universe;
			if (du.stars.length >= du.maxCountOnScreen)
				return;
			var index = Math.floor(Math.random() * datas.res.stars.units.length);
			var star = datas.res.stars.units[index];
			var sizeRate = Math.random() * (du.scaleRange.max - du.scaleRange.min) + du.scaleRange.min;
			var size = this.getUnitViewSize(datas.res.stars, star.cx, star.cy).w * sizeRate;
			var x = Math.floor(Math.random() * datas.view.w);
			var y = !comeout ? -size : (Math.random() * datas.view.h);
			var speed = Math.random() * (du.speedRange.max - du.speedRange.min) + du.speedRange.min;
			du.stars.push({
				resIndex: index,
				pos: { x: x, y: y },
				size: size,
				speed: speed
			});
			// console.log('star born:' + index);
		},
		// 出现一架敌机
		bornEnemy: function(xr, speed, sizer, resIdx){
			var de = datas.enemies;
			if (de.planes.length >= de.maxCountOnScreen)
				return;
			var obj = {pos: {x:0, y:0}, state: 1, dyingFrame: -1};
			obj.resIndex = isNaN(resIdx) ? Math.floor(Math.random() * datas.res.roles.enemies.length) : resIdx;
			var plane = datas.res.roles.enemies[obj.resIndex];
			var sizeRate = sizer * (de.scaleRange.max - de.scaleRange.min) + de.scaleRange.min;
			obj.size = this.getUnitViewSize(datas.res.roles, plane.cx, plane.cy).w * sizeRate;
			obj.pos.x = Math.floor(xr * (datas.view.w - obj.size * 0.5)) + obj.size * 0.25;
			obj.pos.y = -obj.size * 0.5;
			obj.speed = speed;
			obj.score = datas.enemies.killScore;
			obj.maxHp = obj.resIndex + 1;
			obj.hp = obj.maxHp;
			de.planes.push(obj);
			// console.log('enemy born:' + obj.resIndex);
		},
		// 出现BOSS
		bornBoss: function(){
			var de = datas.enemies;
			if (de.boss.level >= de.bossCount - 1)
				return;
			++de.boss.index;
			++de.boss.level;
			var plane = datas.res.roles.boss;
			de.boss.size = this.getUnitViewSize(datas.res.roles, plane.cx, plane.cy).w;
			de.boss.pos.x = Math.floor(Math.random() * (datas.view.w - de.boss.size * 0.5)) + de.boss.size * 0.25;
			de.boss.pos.y = -de.boss.size * 0.5;
			de.boss.speed = Math.random() * (de.bossSpeedRange.max - de.bossSpeedRange.min) * 0.4 + de.bossSpeedRange.min;
			de.boss.maxHp = de.boss.hp = de.bossHpRange.base + de.boss.level * de.bossHpRange.step;
			de.boss.state = 1;
			de.boss.dyingFrame = -1;
			var rge = Math.random() * (de.bossBornScoreRange.range * 2) - de.bossBornScoreRange.range;
			de.boss.nextBornScore = de.bossBornScoreRange.base * (de.boss.index + 2) + de.bossBornScoreRange.step * (de.boss.index + 1) + rge;
			// console.log('boss born:' + de.boss.index);
		},
		// 发射子弹
		bornBullet: function(){
			var blt = datas.res.icons.bullets[datas.player.bulletLv];
			var size = this.getUnitViewSize(datas.res.icons, blt.cx, blt.cy).w;
			var x = datas.player.pos.x;
			var y = datas.player.pos.y - datas.player.size.h * 0.5;
			datas.bullets.objs.push({
				pos: { x: x, y: y },
				size: size,
				speed: datas.bullets.speed
			});
		},
		// 产生第index种药丸
		bornCapsule: function(index){
			var obj = datas.capsules.objs[index];
			var res = datas.res.icons.capsules[index];
			obj.size = this.getUnitViewSize(datas.res.icons, res.cx, res.cy).w;
			obj.pos.x = Math.floor(Math.random() * datas.view.w);
			obj.pos.y = -obj.size;
			obj.active = true;
		},
		// 使用第index种药丸
		applyCapsule: function(index){
			var obj = datas.capsules.objs[index];
			if (index === 0){
				datas.player.bulletLv++;
			}else if (index === 1){
				datas.player.restBombs++;
			}
			obj.active = false;
		},
		// 使用核弹，普通敌人被秒，BOSS血量减少一半
		useBomb: function(){
			if (datas.player.restBombs <= 0)
				return;
			datas.player.restBombs--;
			for (var i = 0; i < datas.enemies.planes.length; ++i){
				var enemy = datas.enemies.planes[i];
				enemy.hp = 0;
				enemy.state = 0;
			}
			if (datas.enemies.boss.state > 0){
				datas.enemies.boss.hp -= Math.floor(datas.enemies.boss.maxHp * 0.5);
				if (datas.enemies.boss.hp <= 0){
					datas.enemies.boss.hp = 0;
					datas.enemies.boss.state = 0;
				}
			}
			// datas.sounds.bomb.play();
		},
		// 事件：点击屏幕
		onMouseClick: function(e){
			if (datas.player.restBombs > 0){
				var rc = getBoundRect(datas.hud.bomb.pos, datas.hud.bomb.size);
				if (pointInRect(rc, e.pageX, e.pageY)){
					this.useBomb();
				}
			}
		},
		// 事件：鼠标按下
		onMouseDown: function(e){
			if (datas.game.state !== 1) return;
			var drg = datas.player.dragging;
			var rc = getBoundRect(datas.player.pos, datas.player.size);
			drg.on = pointInRect(rc, e.pageX, e.pageY);
			if (drg.on){
				drg.offset.x = e.pageX - datas.player.pos.x;
				drg.offset.y = e.pageY - datas.player.pos.y;
				// console.log('touching player...');
			}
		},
		// 事件：鼠标释放
		onMouseUp: function(e){
			if (datas.game.state !== 1) return;
			datas.player.dragging.on = false;
		},
		// 事件：鼠标移动
		onMouseMove: function(e){
			if (datas.game.state !== 1) return;
			if (datas.player.dragging.on){
				var x = e.pageX - datas.player.dragging.offset.x;
				var y = e.pageY - datas.player.dragging.offset.y;
				(x < 0) && (x = 0);
				(x > datas.view.w) && (x = datas.view.w);
				(y < datas.player.size.h) && (y = datas.player.size.h);
				(y > datas.view.h) && (y = datas.view.h);
				datas.player.pos.x = x;
				datas.player.pos.y = y;
			}
		},
		// 根据资源定义、格子占用信息以及视图比例，获取元素当前视图大小
		getUnitViewSize: function(res, cx, cy){
			if (!res.img)
				return {w: 0, h: 0};
			return {
				w: res.img.width * (cx / res.nx) * datas.view.scale,
				h: res.img.height * (cy / res.ny) * datas.view.scale,
			};
		}
	}
})();

$(function(){
	if (!main.init())
		return;
});
