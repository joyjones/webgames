
COMMONCONFIGS.WX_APPID = COMMONCONFIGS.WX_APPID_XYGAME;
var EVT_TOUCH = 'touchstart';

var configs = {
	mpurl: 'http://mp.weixin.qq.com/s?__biz=MjM5NjI1NDUzNQ==&mid=200617553&idx=1&sn=e64038ed336a0d0fe10775ddfdbe5914#rd',
	back: {
		size: {w: 0, h: 0},
		kinds: 15
	},
	board: {
		startsize: 1,
		margin: 8,
		blockmargin: 0,
		blockborder: 1,
		animspeed: 400,
	},
	words:{
		wxtitle: '【中秋拼图大挑战】这个游戏可不容易哦，你能玩到第几层呢？',
		wxdesc: '拼起层层关卡中的美图，给你的中秋节带来好运吧！',
		wxtitle_share: '【中秋拼图大挑战】我杀到了第[[LEVEL]]层！你能到第几层？',
		finishs: [
			'美图看完了，那么让我们开始吧！注意拼图有技巧的哦！',//1->2
			'超简单吧，只是让你试试身手，下面真正的挑战开始了！',//2->3
			'看来你上道了，不过接下来第4层会难倒一大批人哦！',//3->4
			'大神NB啊！不转到朋友圈炫耀一下还等什么呢？',//4->5
			'大神真棒！很少有人能到这里，再接再厉！',//5-6
			'大神太腻害了！下一层更难了哦！',//6->...
		],
		welcome: '乐于观察 勤于思考',
		clicktip: '请点击要移动的板块！',
		title: '中秋拼图大挑战 第[[LEVEL]]层'
	}
};

var board = (function(){
	var elm, elmStatus;
	var blocks = [];
	var slots = [];
	var emptyslot = null;
	var curLevel;
	var blockwfull = 0, blockw = 0, backImageSize = 0;
	var movingBlocks = [];
	var statusTicker = 0;
	var status = {t: configs.words.welcome, c: '#000'};
	var finishing = false;
	return {
		init: function(){
			elm = $('#board');
			elmStatus = $('#status');
			$('#rearrange').on(EVT_TOUCH, function(e){
				e.preventDefault();
				board.setSize(board.getCurLevel());
				setTimeout(function(){
					board.start(false);
				}, 2000);
			});
		},
		tick: function(span){
			if (statusTicker > 0){
				statusTicker -= span;
				if (statusTicker < 0){
					statusTicker = 0;
					if (this.inputEnabled())
						status = {t: configs.words.clicktip, c: '#222'};
					else
						status = {t: configs.words.welcome, c: '#222'};
				}
			}
			elmStatus.html(status.t).css('color', status.c);
		},
		reset: function(){
			curLevel = configs.board.startsize;
            var lv = localData.get('xygame_curlv');
            if (lv && lv > 0){
            	curLevel = Math.floor(lv);
            	localData.remove('xygame_curlv');
            }
			this.start(false);
		},
		setSize: function(s){
			finishing = true;
			curLevel = s;
			$('.block').remove();
			blocks.length = 0;
			slots.length = 0;
			var imgurl = game.getGameImage();
			blockwfull = (configs.back.size.w - configs.board.margin * 2) / curLevel;
			blockw = blockwfull - configs.board.blockmargin * 2 - configs.board.blockborder * 2;
			backImageSize = blockw * curLevel;
			var x = 0, y = 0, bi = 0, dx = 0, dy = 0;
			for (var j = 0; j < curLevel; j++) {
				var bs = [];
				for (var i = 0; i < curLevel; i++) {
					var id = 'b'+j+'-'+i;
					var dom = COMMONMETHODS.sprintf('<div id="%s" class="block"></div>', id);
					elm.append(dom);
					var e = $('#'+id)
					.css({
						margin: configs.board.blockmargin,
						width: blockw,
						height: blockw,
						left: x,
						top: y,
						'background-image': 'url('+imgurl+')',
						'background-size': backImageSize+'px '+backImageSize+'px',
						'background-position': dx+'px '+dy+'px'
					});
					blocks.push({
						id: id,
						elm: e,
						size: blockw,
						loc: {i:i, j:j},
						cur: {i:i, j:j}
					});
					bs.push(bi++);
					dx -= blockw;
					x += blockwfull;
				}
				slots.push(bs);
				x = 0;
				y += blockwfull;
				dx = 0;
				dy -= blockw;
			}
			$('.block').on(EVT_TOUCH, function(e){
				e.preventDefault();
				board.moveElement($(this).attr('id'));
			});
			elm.css({
				width: blockwfull * curLevel,
				height: blockwfull * curLevel,
			});
			$('#title').html(configs.words.title.replace('[[LEVEL]]', curLevel));
		},
		start: function(nextlevel) {
			if (nextlevel)
				this.setSize(curLevel + 1);
			else
				this.setSize(curLevel);
			var minc = 2;
			var maxc = slots.length;
			if (maxc == 1){
				setTimeout(function(){
					board.checkFinish();
				}, 2000);
				return;
			}
			var lastelm = blocks[blocks.length - 1].elm;
			lastelm.animate({
				opacity: 0,
				top: blockwfull * maxc
			}, configs.board.animspeed, function(){
				lastelm.hide();
			});
			slots[maxc - 1][maxc - 1] = -1;
			emptyslot = {i: maxc - 1, j: maxc - 1};

			var steps = [];
			for (var i = minc; i <= maxc; i++) {
				steps.push([i,i]);
			};
			var sels = [];
			for (var i = minc; i <= maxc; i++) {
				for (var j = minc; j <= maxc; j++) {
					if (i != j)
						sels.push([i,j]);
				};
			};
			var puzzles = maxc - minc - 1;
			for (var i = 0; i < puzzles && sels.length > 0; i++) {
				var pi = Math.floor(Math.random() * sels.length);
				steps.push([sels[pi][0], sels[pi][1]]);
				sels.splice(pi, 1);
			};
			while (steps.length > 0){
				var idx = Math.floor(Math.random() * steps.length);
				this.moveRound(steps[idx][0], steps[idx][1]);
				steps.splice(idx, 1);
			};
			finishing = false;
		},
		moveElement: function(id){
			if (!this.inputEnabled())
				return;
			var j = Math.floor(id.substr(1, 1));
			var i = Math.floor(id.substr(3, 1));
			var cur = blocks[j * slots.length + i].cur;
			this.move(cur.i, cur.j);
		},
		move: function(i, j) {
			if (i >= slots.length || j >= slots.length)
				return false;
			var bi = slots[j][i];
			if (bi < 0)
				return false;
			var dirs = [[-1,0],[0,-1],[1,0],[0,1]];
			for (var d = 0; d < dirs.length; d++) {
				var ti = i + dirs[d][0];
				var tj = j + dirs[d][1];
				if (ti == emptyslot.i && tj == emptyslot.j){
					slots[j][i] = -1;
					slots[emptyslot.j][emptyslot.i] = bi;
					movingBlocks.push(bi);
					emptyslot = {i: i, j: j};
					blocks[bi].cur = {i: ti, j: tj};
					blocks[bi].elm.animate({
						left: blockwfull * ti,
						top: blockwfull * tj,
					}, configs.board.animspeed, function() {
						board.onBlockReady(bi);
					});
					return true;
				}
			};
			return false;
		},
		moveRound: function(ci, cj) {
			if (emptyslot.i < slots.length - 1 || emptyslot.j < slots.length - 1)
				return;
			if (Math.random() < 0.5){
				for (var i = 1; i < ci; i++)
					this.move(emptyslot.i - 1, emptyslot.j);
				for (var j = 1; j < cj; j++)
					this.move(emptyslot.i, emptyslot.j - 1);
				for (var i = 1; i < ci; i++)
					this.move(emptyslot.i + 1, emptyslot.j);
				for (var j = 1; j < cj; j++)
					this.move(emptyslot.i, emptyslot.j + 1);
			} else {
				for (var i = 1; i < ci; i++)
					this.move(emptyslot.i, emptyslot.j - 1);
				for (var j = 1; j < cj; j++)
					this.move(emptyslot.i - 1, emptyslot.j);
				for (var i = 1; i < ci; i++)
					this.move(emptyslot.i, emptyslot.j + 1);
				for (var j = 1; j < cj; j++)
					this.move(emptyslot.i + 1, emptyslot.j);
			}
		},
		getCurLevel: function(){
			return curLevel;
		},
		onBlockReady: function(idx) {
			movingBlocks.shift();
			if (movingBlocks.length == 0){
				if (!this.checkFinish() && statusTicker == 0)
					status = {t: configs.words.clicktip, c: '#222'};
			}
		},
		inputEnabled: function(){
			return (movingBlocks.length == 0 && !finishing);
		},
		checkFinish: function(){
			for (var i = 0; i < blocks.length; i++) {
				var b = blocks[i];
				if (b.cur.i != b.loc.i || b.cur.j != b.loc.j)
					return false;
			};
			finishing = true;
			blocks[blocks.length - 1].elm.show().animate({
				opacity: 1,
				top: blockwfull * (slots.length - 1)
			}, configs.board.animspeed);
			var tidx = curLevel - 1;
			if (tidx >= configs.words.finishs.length)
				tidx = configs.words.finishs.length - 1;
			var text = configs.words.finishs[tidx];
			$('#finishtip')
			.html('<p>'+text+'</p>')
			.fadeIn(configs.board.animspeed, function(){
				setTimeout(function(){
					$('#finishtip').fadeOut(configs.board.animspeed, function(){
						board.start(true);
					});
				}, 2000);
			});
			game.onFinishLevel(curLevel);
			return true;
		},
		setStatus: function(text,clr){
			status = {t: text, c: clr};
			statusTicker = 7;
		}
	};
})();

var game = (function(){
	var lastTick = 0;
	var funcTick = null;
	var backoffset = 0;
	var curranking = -1;
	var curGameImage;
    return {
    	updatewx: function(){
    		var level = board.getCurLevel() + 1;
    		var title = configs.words.wxtitle;
			if (level > 2)
				title = configs.words.wxtitle_share.replace('[[LEVEL]]', level);
			COMMONMETHODS.setWeixinProperties("assets/images/icon.jpg", title, configs.words.wxdesc);
    	},
		init: function(){
	    	configs.back.size.w = $(window).width();
	    	configs.back.size.h = $(window).height();

	    	if (/Windows/.test(navigator.userAgent))
	    		EVT_TOUCH = 'mousedown';
	    	else
	    		EVT_TOUCH = 'touchstart';
			this.updatewx();
			board.init();

			var imgkind = localData.get('xygame_moonpuzzle_imgkind');
			if (imgkind == null)
				imgkind = Math.floor(Math.random() * configs.back.kinds);
			else if (++imgkind >= configs.back.kinds)
				imgkind = 0;
			localData.set('xygame_moonpuzzle_imgkind', imgkind);
			curGameImage = 'assets/images/'+(imgkind+1)+'.jpg';

			$('#bg').css({
				width: configs.back.size.w,
				height: configs.back.size.h,
			});
			$('#share').on(EVT_TOUCH, function(e){
				e.preventDefault();
				$('#sharetip').show();
				setTimeout('configs.shareflag = 1;', configs.board.animspeed);
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
    		$('#focus').on(EVT_TOUCH, function(e){
				e.preventDefault();
            	localData.set('xygame_curlv', board.getCurLevel());
    			window.location.href = configs.mpurl;
			});

			this.visitServer();
			this.start();
		},
		start: function(){
			lastTick = 0;
			board.reset();
			funcTick = setInterval('game.tick()', 200);
		},
    	onFinishLevel: function(level){
			this.updatewx();
			this.notifyServer(level);
    	},
    	tick: function(){
    		var t = (new Date()).getTime();
    		if (lastTick > 0){
	    		var span = (t - lastTick) * 0.001;
	    		board.tick(span);
    		}
			lastTick = t;
    	},
    	getGameImage: function(){
    		return curGameImage;
    	},
    	setRanking: function(r){
   			curranking = r;
    	},
    	visitServer: function() {
            $.ajax({
            	url: "../lib/php/visits.php",
            	type: "post",
            	data: {
            		proj: "moonpuzzle",
            	},
            	dataType: "html"
            });
        },
    	notifyServer: function(score){
    		$.ajax({
    			url: '../lib/php/records.php',
    			type: 'post',
    			data:{
    				proj: 'moonpuzzle',
    				score: score,
    				gainrank: 'true',
    				ascending: 'true',
    			},
				dataType: 'html',
    			error: function(){},
    			success: function(resp){
					var rst = $.parseJSON(resp);
					if (rst.success){
						game.setRanking(rst.ranking);
						var persons = rst.ranking - 1;
						var text;
						if (persons <= 0)
							text = '到目前为止还没有人闯过这一层！';
						else{
							var tail = (persons == 1 ? '他！' : '他们！');
							text = '能闯过这一层的有'+persons+'人，超过' + tail;
						}
						board.setStatus(text, '#f00');
					}
    			},
    		});
    	}
    };
})();

$(function(){
	game.init();
});
