var sw=20,//一个小方块的宽度
	sh=20,//一个小方块的高度
	tr=30,//行数
	td=30;//列数

var snake=null;//蛇的实例
var food=null;//食物的实例
var game=null;//游戏的实例


//方块构造函数
function Square(x,y,classname){
	this.x=x*sw;
	this.y=y*sh;
	this.class=classname;

	this.viewcontent=document.createElement('div');//方块对应的dom元素
	this.viewcontent.className=this.class;
	this.parent=document.getElementById('snakeWrap');
}
Square.prototype.create=function(){
 	this.viewcontent.style.position='absolute';
 	this.viewcontent.style.width=sw+'px';
 	this.viewcontent.style.height=sh+'px';
 	this.viewcontent.style.left=this.x+'px';
 	this.viewcontent.style.top=this.y+'px';

 	this.parent.appendChild(this.viewcontent);//向节点添加最后一个子节点

 };
Square.prototype.remove=function(){
	this.parent.removeChild(this.viewcontent);//删除方块


};
//蛇
function Snake(){
	this.head=null;
	this.tail=null;
	this.pos=[];//存储蛇身上的每一个方块的位置

	this.directionNum={
		left:{
			x:-1,
			y:0,
			rotate:-180//蛇头在不同方向进行旋转，要不然蛇头是始终向右的
		},
		right:{
			x:1,
			y:0,
			rotate:0
		},
		up:{
			x:0,
			y:-1,
			rotate:-90

		},
		down:{
			x:0,
			y:1,
			rotate:90
		}

	}

};
Snake.prototype.init=function(){
	//创建蛇头
	var snakeHead=new Square(2,0,'snakeHead');//实例化蛇头
	snakeHead.create();//创建蛇头
	this.head=snakeHead;//存储蛇头信息
	this.pos.push([2,0]);//把蛇头的位置存起来

	//创建蛇身体1
	var snakeBody1=new Square(1,0,'snakeBody');
	snakeBody1.create();
	this.pos.push([1,0]);

	//创建蛇身体2
	var snakeBody2=new Square(0,0,'snakeBody');
	snakeBody2.create();
	this.tail=snakeBody2;//存储蛇尾信息
	this.pos.push([0,0]);

	//形成链表关系
	snakeHead.last=null;
	snakeHead.next=snakeBody1;

	snakeBody1.last=snakeHead;
	snakeBody1.next=snakeBody2;

	snakeBody2.last=snakeBody1;
	snakeBody2.next=null;

	//给蛇添加一条属性，用来表示蛇走的方向
	this.direction=this.directionNum.right;//默认让蛇往右走

};
//这个方法用来获取蛇头的下一个位置对应的元素，要根据元素做不同的事情
Snake.prototype.getNextPos=function(){
	var nextPos=[//蛇头要走的下一个点的坐标
	this.head.x/sw+this.direction.x,
	this.head.y/sh+this.direction.y];
	
	//下个点是自己，游戏结束
	var selfcolied=false;
	this.pos.forEach(function(value){
		if(value[0]==nextPos[0]&&value[1]==nextPos[1]){
			selfcolied=true;
		}
	});
	if(selfcolied){

		this.strategies.die.call(this);

		return;
	}
	//下个点是墙，游戏结束
	if(nextPos[0]<0||nextPos[1]<0||nextPos[0]>tr-1||nextPos[1]>td-1){

		this.strategies.die.call(this);//this.strategies.die()指向的是this.strategies,不是Snake

		return;
	}
	//下个点是苹果，吃
	if(food&&food.pos[0]==nextPos[0]&&food.pos[1]==nextPos[1]){//如果这个条件成立，说明蛇要走的下一个点的坐标就是食物的坐标，那就吃
		this.strategies.eat.call(this);

		//food.create();
		createFood();

		return;
	}

	//下个月什么都不是，走
	this.strategies.move.call(this);
};

//处理碰撞后要做的事
Snake.prototype.strategies={
	move:function(format){//这个参数用于决定是不是要删除最后一个方块，如果用户不传参数，则为undefined，为flase，当传了参数之后，就表示要干的事为吃
		var newbody=new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
		//更新链表关系
		newbody.next=this.head.next;
		newbody.next.last=newbody;
		newbody.last=null;


		this.head.remove();//把蛇头从原来的位置删除
		newbody.create();

		//创建一个新蛇头（蛇头下一个要走的点）
		var newHead=new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead');
		//更新链表关系
		newHead.last=null;
		newHead.next=newbody;
		newbody.last=newHead;
		newHead.viewcontent.style.transform='rotate('+this.direction.rotate+'deg)';
		newHead.create();


		//蛇身上的每一个坐标都要更新
		this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y]);
		this.head=newHead//更新蛇头信息

		if(!format){//如果format的值为false，表示需要删除
			this.tail.remove();
			this.tail=this.tail.last;

			this.pos.pop();//把数组最后一个数据删除

		}

	},
	eat:function(){
		this.strategies.move.call(this,true);//第一个参数为call要传入的改变this指向的对象，第二个参数为move函数传入的参数
		// createFood();
		game.score++;

	},
	die:function(){
		game.over();
		
	}
};

snake=new Snake();


//创建食物
function createFood(){
	//食物小方块的随机坐标
	var x=null;
	var y=null;

	var include=true;//循环跳出的条件，true表示食物的坐标在蛇身上（需要继续循环），false表示食物不在蛇身上，不需要循环了
	while(include){
		x=Math.round(Math.random()*(td-1));
		y=Math.round(Math.random()*(tr-1));

		snake.pos.forEach(function(value){
			if(x!=value[0]&&y!=value[1]){//这个条件成立说明随机出来的坐标并没有在蛇蛇身上

				include=false;

			}
		});
	}
	food=new Square(x,y,'food');
	food.pos=[x,y];//存储一下食物的坐标，用于跟蛇头要走的下一个点做对比
	var foodDom=document.querySelector('.food');//Css选择器
	if(foodDom){
		foodDom.style.left=x*sw+'px';
		foodDom.style.top=y*sh+'px';
	}
	else{
		food.create();
	}
}


//创建游戏逻辑
function Game(){
	this.timer=null;
	this.score=0;

};
Game.prototype.init=function(){
	snake.init();
	//snake.getNextPos();
	createFood();

	document.onkeydown=function(ev){
		if(ev.which==37&&snake.direction!=snake.directionNum.right){//当用户按下左键时，蛇不能正在往右走
			snake.direction=snake.directionNum.left;
		}else if(ev.which==38&&snake.direction!=snake.directionNum.down){
			snake.direction=snake.directionNum.up;

		}else if(ev.which==39&&snake.direction!=snake.directionNum.left){
			snake.direction=snake.directionNum.right;

		}else if(ev.which==40&&snake.direction!=snake.directionNum.up){
			snake.direction=snake.directionNum.down;

		}
	};

	this.start();

};
Game.prototype.pause=function(){
	clearInterval(this.timer);
};

Game.prototype.start=function(){
	this.timer=setInterval(function(){
		snake.getNextPos();
	},200);
};

Game.prototype.over=function(){
	clearInterval(this.timer);
	alert('你的得分为：'+this.score);
	//游戏回到最初的位置
	var snakeWrap=document.getElementById('snakeWrap');
	snakeWrap.innerHTML='';

	snake=new Snake();
	game=new Game();

	var startBtnWrap=document.querySelector('.startBtn');
	startBtnWrap.style.display='block';

}
//开启游戏
game=new Game();
var startBtn=document.querySelector('.startBtn button');
startBtn.onclick=function(){
	startBtn.parentNode.style.display='none';
	game.init();

}

//暂停游戏
var snakeWrap=document.getElementById('snakeWrap');
var pauseBtn=document.querySelector('.pauseBtn button');
snakeWrap.onclick=function(){
	game.pause();
	pauseBtn.parentNode.style.display='block';


}
pauseBtn.onclick=function(){
	game.start();
	pauseBtn.parentNode.style.display='none';

}