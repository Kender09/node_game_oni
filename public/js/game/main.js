enchant();

var WIDTH = 500;
var HEIGHT = 500;

var MOVE_SPEED = 5;

var playerData = {
    player: 0,
    x: 0,
    y: 0,
    frame: 0,
    scalex: 1
};
var socket;

var gameStartFlag = 0;
var con_player = -1;

var players = [];
var players_num = 2;

var now_oni = 0;

var game;

var sec;
var label2;

var dash_flag = 0;
var dash_count = 0;

var DASH_MAX = 50;

function game_plogram() {
    game = new Core(WIDTH, HEIGHT);
    game.fps = 10;
    game.preload("/js/game/chara0.png");
    game.preload("/js/game/chara0_2.png"); //鬼
    game.preload("/js/game/map.png");

    game.onload = function(){
        var bg1 = new Sprite(500, 500);
        bg1.image = game.assets["/js/game/map.png"];
        game.rootScene.addChild(bg1);

        var label = new Label();
        label.x = (WIDTH/2) + 50;
        label.y = 5;
        label.color = 'white';
        label.opacity = 0.5;
        label.font = '14px "Arial"';
        label.text = "0";
        label.on('enterframe',function() {
            label.text = "time: " + (game.frame / game.fps).toFixed(1);
        });
        var label3 = new Label();
        label3.x = (WIDTH/2) - 50;
        label3.y = 5;
        label3.color = 'red';
        label3.font = '14px "Arial"';
        label3.text = dash_count;

        label2 = new Label();
        label2.color = 'black';
        label2.font = '30px "Arial"';
        

        players[0] = new Sprite(32, 32);
        players[0].image = game.assets["/js/game/chara0_2.png"];
        players[0].x = WIDTH/2 - 32;
        players[0].y = HEIGHT/2 -32;
        players[0].frame = 0;
        game.rootScene.addChild(players[0]);

        for(var i = 1;i < players_num; i++){
            players[i] = new Sprite(32, 32);
            players[i].image = game.assets["/js/game/chara0.png"];
            players[i].x = (((WIDTH-32)/3)* (i-1))%(WIDTH-32);
            players[i].y = (((HEIGHT-32)*2/3)* (i-1))%(HEIGHT-32);
            players[i].frame = 0;
            game.rootScene.addChild(players[i]);
        }

        game.rootScene.addChild(label);
        game.rootScene.addChild(label2);
        game.rootScene.addChild(label3);


        var dash = function(){
            label3.text = dash_count;
            if(dash_count >= DASH_MAX){
                dash_count = DASH_MAX;
                dash_flag = 0;
                return;
            }
            dash_flag = 1;
        };
        var fin_dash = function(){
            dash_flag = 0;
        };

        game.keybind(32, "space");  // space
        game.addEventListener("spacebuttondown", dash);
        game.addEventListener("spacebuttonup", fin_dash);

         for(i = 0;i < players_num; i++){
            if(con_player == i){

                players[i].addEventListener("enterframe", function(){
                
                    if(game.input.left){
                        this.x -= MOVE_SPEED;
                        if(dash_flag == 1){
                            this.x -= MOVE_SPEED;
                            dash_count = dash_count + 2;
                            if(dash_count >= DASH_MAX){
                                dash_count = DASH_MAX;
                                dash_flag = 0;
                            }
                            label3.text = dash_count;
                        }else{
                            dash_count--;
                            if(dash_count <= 0){
                                dash_count = 0;
                            }
                            label3.text = dash_count;
                        }
                        this.frame = this.age % 2 + 0;
                        this.scaleX = -1;
                        if(this.x<0) this.x = 0;
                        playerData.x = this.x;
                        playerData.y = this.y;
                        playerData.frame = this.frame;
                        playerData.scalex = -1;
                        socket.emit('check put', playerData);
                    }else if(game.input.right){
                        this.x += MOVE_SPEED;
                        if(dash_flag == 1){
                           this.x += MOVE_SPEED;
                            dash_count = dash_count + 2;
                            if(dash_count >= DASH_MAX){
                                dash_count = DASH_MAX;
                                dash_flag = 0;
                            }
                            label3.text = dash_count;
                        }else{
                            dash_count--;
                            if(dash_count <= 0){
                                dash_count = 0;
                            }
                            label3.text = dash_count;
                        }
                        this.frame = this.age % 2 + 0;
                        this.scaleX = 1;
                        if(this.x>WIDTH - 32) this.x = WIDTH - 32;

                        playerData.x = this.x;
                        playerData.y = this.y;
                        playerData.frame = this.frame;
                        playerData.scalex = 1;
                        socket.emit('check put', playerData);
                    }else if(game.input.up){
                        this.y -= MOVE_SPEED;
                        if(dash_flag == 1){
                            this.y -= MOVE_SPEED;
                            dash_count = dash_count + 2;
                            if(dash_count >= DASH_MAX){
                                dash_count = DASH_MAX;
                                dash_flag = 0;
                            }
                            label3.text = dash_count;
                        }else{
                            dash_count--;
                            if(dash_count <= 0){
                                dash_count = 0;
                            }
                            label3.text = dash_count;
                        }
                        if(this.y<0) this.y = 0;
                        playerData.x = this.x;
                        playerData.y = this.y;
                        playerData.frame = this.frame;
                        socket.emit('check put', playerData);
                    }else if(game.input.down){
                         this.y += MOVE_SPEED;
                         if(dash_flag == 1){
                            this.y += MOVE_SPEED;
                            dash_count = dash_count + 2;
                            if(dash_count >= DASH_MAX){
                                dash_count = DASH_MAX;
                                dash_flag = 0;
                            }
                            label3.text = dash_count;
                        }else{
                            dash_count--;
                            if(dash_count <= 0){
                                dash_count = 0;
                            }
                            label3.text = dash_count;
                        }
                         if(this.y>HEIGHT - 32) this.y = HEIGHT - 32;
                         playerData.x = this.x;
                         playerData.y = this.y;
                         playerData.frame = this.frame;
                         socket.emit('check put', playerData);
                     }else{
                         this.frame = 2;
                         dash_count = dash_count -2;
                         if(dash_count <= 0){
                            dash_count = 0;
                         }
                         label3.text = dash_count;
                    }

                    if(this.within(players[now_oni],10) && now_oni != con_player){
                        // label2.text = "HIT";
                        console.log('Hit');
                        socket.emit('send gameset');
                    }
                });
            }
        }
    };

    game.start();
}



function connect_socket() {
  console.log("room.js");
  var messageLogs = {};

  // ページロード時の処理
  $(document).ready(function () {
    // ユーザー名、ルーム名、パスワードを送信
    // url引数で指定されたSocket.IOサーバーへの接続。

// ローカルテスト用
    // socket = io.connect('http://localhost');
// 本番用
    socket = io.connect();


    // スタートの合図受信
    socket.on('game start', function (player_num) {
        // ３秒カウントダウンしてからとか
        $("#GameStart").val("Game started");
        players_num = player_num;
        gameStartFlag = 1;
        console.log("game startttttttttt");
        game_plogram();

        sec = setTimeout(timeHnd,10000);
    });


    socket.on('player num', function (player_no){
        playerData.player = player_no;
        con_player = player_no;
        console.log("player_no: ");
        console.log(playerData.player);
    });

    socket.on('send teki_pos1', function (teki_pos) {
        players[teki_pos.player].x = teki_pos.x;
        players[teki_pos.player].y = teki_pos.y;
        players[teki_pos.player].frame = teki_pos.frame;
        players[teki_pos.player].scaleX = teki_pos.scalex;
        console.log(players[teki_pos.player].x + ":" + players[teki_pos.player].y);
    });

    socket.on('send oni', function (oni_flag) {
        players[now_oni].image = game.assets["/js/game/chara0.png"];
        now_oni = oni_flag;
        players[now_oni].image = game.assets["/js/game/chara0_2.png"];
    });

    socket.on('send fin', function (){
        if(now_oni == con_player){
            label2.color = 'red';
            label2.text = "WIN";
            label2.moveTo((WIDTH - label2._boundWidth)/2, HEIGHT/2);
        }else{
            label2.color = 'blue';
            label2.text = "LOSE";
            label2.moveTo((WIDTH - label2._boundWidth)/2, HEIGHT/2);
        }
        setTimeout(del,5000);
    });

  }); // document.ready()ここまで
}

function del(){
    label2.text = '';
}

function timeHnd(){
    console.log("run timeHnd: " + con_player);
    if(con_player == 0){
        socket.emit('send onitime');
    }
     sec = setTimeout(timeHnd,10000);
}

window.onload = function(){

    connect_socket();
    document.getElementById('Rady').onclick = function(){
      $("#Rady").val("waiting…");

        socket.emit('Rady', function () {
            console.log("RadyPushed");
        });
        document.getElementById('Rady').disabled = true;
    };
    document.getElementById('GameStart').onclick = function(){
      $("#GameStart").val("waiting opponent");
        socket.emit('startPushed', function () {
            console.log("startPushed");
        });
    };
};
