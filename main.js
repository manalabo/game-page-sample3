//ディレイ　http://wise9.jp/archives/7418

enchant();

var game;
var score = 0;
var bear;
var scoreLabel;

var CHARA_IMAGE_NAME = "http://enchantjs.com/assets/images/chara1.gif";
var ICON0_IMAGE_NAME = "http://enchantjs.com/assets/images/icon0.gif";
var GROUND_IMAGE_NAME  =  "http://www.shoeisha.co.jp/book/shuchu/enchantsample/chapter03/floor.png"//'http://jsrun.it/assets/W/X/h/S/WXhSX.png';
var CLEAR_IMAGE = 'http://enchantjs.com/assets/images/clear.png';;
var GOKIBURI_IMAGE  = "http://www.shoeisha.co.jp/book/shuchu/enchantsample/chapter03/bug.png";

var BUG_SPEED = 10;  
var BUG_MAX_NUM = 10;
var BUG_MOVE_TIME   = 10;   // 虫の移動時間
var BUG_WAIT_TIME   = 10;   // 虫の待ち時間

function rand(num){
    return Math.floor(Math.random() * num);
}


Bear = Class.create(Sprite, //
                   {
                       //初期化
                       initialize: function(){
                           Sprite.call(this, 32, 32);
                           this.image =  game.assets[GOKIBURI_IMAGE]; 
                           this.frame = 0;
                           this.x = rand(288);
                           this.y = rand(288);
                           this.rotation= rand(360);
                           this.timer = rand(BUG_MOVE_TIME);
                           this.update = this.move;
                        },
                        move: function() {
                            var angle = (this.rotation+270)*Math.PI/180;
                            this.x += Math.cos(angle)*BUG_SPEED;
                            this.y += Math.sin(angle) *BUG_SPEED;
                            if(this.rotation>360)this.rotation-=360;
                            
                           // 待ちモードに切り替える
                           if (this.timer > BUG_MOVE_TIME) {
                               this.timer  = 0;
                               this.update = this.wait;
                           }
                        },
                       // 待ち処理
                       wait: function() {
                           // 移動モードに切り替える
                           if (this.timer > BUG_WAIT_TIME) {
                               this.rotation = rand(360);
                               this.timer = 0;
                               this.update = this.move;
                           }
                       },
                        onenterframe: function(){
                            this.update();//this.move();のままだと変わらない
                            this.timer += 1;//これがないと変わらない

                            this.frame = 1 - this.frame;
                            
                            var left    = 0;
                            var right   = 288;
                            var top     = 0;
                            var bottom  = 288;
                            
                            if (left > this.x) {
                                this.x = left;
                                this.rotation += rand(180);
                            }
                            else if (right < this.x) {
                                this.x = right;
                                this.rotation += rand(180);
                            }
                            if (top > this.y) {
                                this.y = top;
                                this.rotation += rand(180);
                            }
                            else if (bottom < this.y) {
                                this.y = bottom;
                                this.rotation += rand(180);
                            }

                            /*
                            if(this.scaleX == 1){
                                if(this.x < 320-32){
                                    this.rotation = 90;
                                    this.x += 3;
                                }else{
                                    this.rotation = 180;
                                    this.y += 3;
                                }
                                if(this.y > 320-32) this.scaleX = -1;
                            }
                            else{
                                if(this.x > 0){
                                    this.rotation = 270;
                                    this.x -=3;
                                }else{
                                    this.rotation = 0;
                                    this.y -=3;
                                }
                                if(this.y < 0) this.scaleX = 1;
                            }
                            */
                            
                       },
                       destroyWait: function(){
                           if (this.timer > BUG_WAIT_TIME) {
                               //this.parentNode.removeChild(this);
                               game.rootScene.removeChild(this);
                           }
                       },
                        ontouchstart: function() {
                            this.timer = 0;
                            this.frame  = 2;
                            this.update = this.destroyWait;
                            this.ontouchstart = null;
                            score += 1;
                        }
                   }
);

Apple = Class.create(Sprite, //
                   {
                       //初期化
                       initialize: function(){
                           Sprite.call(this, 16, 16);
                           this.image =  game.assets[ICON0_IMAGE_NAME]; 
                           this.frame = 16;
                           this.x = rand(320 - 16);
                           this.y = rand(320 - 16);
                       },
                       onenterframe: function(){
                           //くまさんと衝突
                           
                           //if(this.within(bear)){
                              //score ++;
                              //game.rootScene.removeChild(this);
                            if(score >= BUG_MAX_NUM){
                                game.rootScene.tl.delay(45).then(function () {
                                    game.end('SCORE:',null,game.assets[CLEAR_IMAGE]);
                                       //game.end();
                                       //document.writeln("ゲームクリア！！");
                                });
                            }
                         //}  
                       }
                     }
);

window.onload = function() {
    game = new Game();
    game.preload(GOKIBURI_IMAGE, CHARA_IMAGE_NAME, ICON0_IMAGE_NAME, GROUND_IMAGE_NAME, CLEAR_IMAGE);    // 画像読み込み
    score = 0;
    
    game.onload = function() {
        
        //背景を色で作る
	    //var scene = game.rootScene;
	    //scene.backgroundColor =  '#7ecef4'//"yellow";
        
		//背景をスプライトで作る
		var ground = new Sprite(320,320);
		ground.image = game.assets[GROUND_IMAGE_NAME];
		ground.x = 0;
		ground.y = 0;
		game.rootScene.addChild(ground);
    
        scoreLabel = new ScoreLabel('score:    0');
        scoreLabel.x = 10;
        scoreLabel.y = 10;
        scoreLabel.text = 'SCORE: 0';
        game.rootScene.addChild(scoreLabel);
        game.rootScene.onenterframe = function() {
            scoreLabel.text = 'SCORE: ' + score;
        }

        timeLabel = new TimeLabel(160,10);
        timeLabel.time = 0;
        game.rootScene.addChild(timeLabel);

        for (var i=0; i<BUG_MAX_NUM; ++i) {
            bear = new Bear(); 
            game.rootScene.addChild(bear);
        }

        //ゲーム画面をタッチしたときの処理
        game.rootScene.ontouchend = function(){
            
            bear.tx = event.x; //移動先xにタッチしたtx座標を入力
            bear.ty = event.y; //
        };

                //りんごを作る
        for (i = 0; i < 10; i++){
            var apple = new Apple();
            game.rootScene.addChild(apple);
        }


	
    };
    
    game.start();
};


