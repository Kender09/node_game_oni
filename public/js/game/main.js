enchant();

var WIDTH = 500;
var HEIGHT = 500;

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
var label2;
var dash_flag = 0;
var dash_count = 0;
var DASH_MAX = 50;
var time_count = 3;

function game_plogram() {
    game = new Core(WIDTH, HEIGHT);
    game.fps = 10;
    game.preload("/js/game/chara0.png");
    game.preload("/js/game/chara0_2.png"); //鬼
    game.preload("/js/game/map.png");

    var MOVE_SPEED = 5;

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

                    if(this.within(players[now_oni],30) && now_oni != con_player){
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
  // console.log("room.js");
  var messageLogs = {};

  // ページロード時の処理
  $(document).ready(function () {
    // ユーザー名、ルーム名、パスワードを送信
    // url引数で指定されたSocket.IOサーバーへの接続。

// ローカルテスト用
    // socket = io.connect('http://localhost');
// 本番用
    socket = io.connect();

    socket.on('connected', function(data) {
      socket.emit('check credential', minichat);
    });
    // 認証成功
    socket.on('credential ok', function(data) {
      socket.emit('request log', {});
    });
    // 認証失敗：ルーム名/パスワードの不一致
    socket.on('invalid credential', function(data) {
      authRetry('ルーム名/パスワードが不正です');
    });
    // 認証失敗：同名のルームがすでに存在
    socket.on('room exists', function(data) {
      authRetry('同名のルームがすでに存在します');
    });
    // 認証失敗：ルームに同名のユーザーが存在
    socket.on('userName exists', function(data) {
      authRetry('その名前はすでに使われています');
    });


    // スタートの合図受信
    socket.on('game start', function (player_num) {
        // ３秒カウントダウンしてからとか
        $("#GameStart").val("Game started");
        $("#GameStart").addClass('disabled');
        players_num = player_num;
        // gameStartFlag = 1;
        countDown();
        console.log("game startttttttttt");
        setTimeout('game_plogram();', 3000);
        setTimeout(timeHnd,10000);
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

    socket.on('request log', function(data, callback) {
      callback(messageLogs);
    });
    // チャットログの更新
    socket.on('update log', function(log) {
      Object.keys(log).forEach(function (key) {
        messageLogs[key] = log[key];
      });
      updateMessage();
    });
    // チャットルームへのメンバー追加
    socket.on('update members', function (members) {
      $('#members').empty();
      for (var i = 0; i < members.length; i++) {
        var html = '<li>' + members[i] + '</li>';
        $('#members').append(html);
      }
    });

    // チャットメッセージ受信
    socket.on('push message', function (message) {
      messageLogs[message.id] = message;
      prependMessage(message);
    });

        // チャットメッセージ送信
    $('#post-message').on('click', function () {
      var message = {
        from: minichat.userName,
        body: $('#message').val(),
        roomId: minichat.roomId
      };
      socket.emit('say', message, function () {
        // メッセージの送信に成功したらテキストボックスをクリアする
        $('#message').val('');
      });
    });
    $('#credential-dialog-form').on('submit', function() {
      $('#credentialDialog').modal('hide');
      socket.emit('hash password', $('#new-password').val(), function (hashedPassword) {
        minichat.roomName = $('#new-room').val();
        minichat.userName = $('#new-name').val();
        minichat.password = hashedPassword;
        minichat.roomId = minichat.roomName + minichat.password;
        socket.emit('check credential', minichat);
      });
      return false;
    });

    function authRetry(message) {
        $('#credential-dialog-header').text(message);    
        $('#new-room').val(minichat.roomName);
        $('#new-name').val(minichat.userName);
        $('#credentialDialog').modal('show');
    }

    function prependMessage(message) {
        var html = '<div class="message" id="' + message.id + '">'
          + '<p class="postdate pull-right">' + message.date + '</p>'
          + '<p class="author">' + message.from + '：</p>'
          + '<p class="comment">' + message.body + '</p>'
          + '</div>';
        $('#messages').prepend(html);
    }

    function updateMessage() {
        $('#messages').empty();
        var keys = Object.keys(messageLogs);
        keys.sort();
        keys.forEach(function (key) {
          prependMessage(messageLogs[key]);
        });
    }


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
     setTimeout(timeHnd,10000);
}

function countDown(){
  if(time_count == 0){
    gameStartFlag = 1;
    $("#timetostart").text("Start!!!");
    setTimeout('countDown()', 3000);
    time_count--;
  }else if(time_count == -1){
    time_count = 3;
  }else{
    str_time = "" + time_count;
    $('#timetostart').text(str_time);
    time_count--;
    setTimeout('countDown()', 1000);
  }
}


window.onload = function(){

    connect_socket();
    document.getElementById('Ready').onclick = function(){
      $("#Ready").text("waiting…");

        socket.emit('Ready', function () {
            console.log("ReadyPushed");
        });
         $("#Ready").addClass('disabled');
        // document.getElementById('Ready').disabled = true;
    };
    document.getElementById('GameStart').onclick = function(){
      // $("#GameStart").val("waiting opponent");
        socket.emit('startPushed', function () {
            console.log("startPushed");
        });
    };
};
