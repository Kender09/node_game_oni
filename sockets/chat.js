var crypto = require('crypto');
var player_num = 0;
var player_no = 0;
var teki_pos = {
  player: 0,
  x: 0,
  y: 0,
  frame: 0,
  scalex: 1
};

var oni_flag = 0;

var sec;

var socket;

var num_players = 2;


// 指定したroomIdに属するクライアントすべてに対しイベントを送信する
function emitToRoom(roomId, event, data, fn) {
  if (socketsOf[roomId] === undefined) {
    return;
  }
  var sockets = socketsOf[roomId];
  Object.keys(sockets).forEach(function (key) {
    sockets[key].emit(event, data, fn);
  });
}

function isOut (x, y){
  if(x<0 || y<0 || x>7 || y>7) return 1;
  else return 0;
}


// socket.ioのソケットを管理するオブジェクト
var socketsOf = {};

// socket.ioのコネクション設定
exports.onConnection = function (socket) {

  // コネクションが確立されたら'connected'メッセージを送信する
  socket.emit('connected', {});

  socket.on('Rady', function(){
    console.log("player_num: " + player_num);
    player_no = player_num;
    socket.emit('player num', player_no);
    player_num++;
  });
 socket.on('startPushed', function (){
  console.log("startPushed!!!!!!!");
  socket.broadcast.emit('game start', player_num);
  socket.emit('game start', player_num);
 });

  // socket.on('startPushed', function (){
  //   console.log("startPushed!!!!!!!");
  //   for (var i = 0; i < num_players; i++) {
  //     if(player_num == i){
  //       console.log('player_num');
  //       console.log(player_num);
  //       player_no = i;
  //       socket.emit('player num', player_no);
  //     }
  //   }
  //   player_num++;
    
  //   if(player_num == num_players){
  //     socket.broadcast.emit('game start', {});
  //     socket.emit('game start', {});
  //   }
  // });

  socket.on('check put', function (putData){
    startTime = new Date();
    teki_pos.player = putData.player;
    teki_pos.x = putData.x;
    teki_pos.y = putData.y;
    teki_pos.frame = putData.frame;
    teki_pos.scalex = putData.scalex;

    stopTime = new Date();
    console.log("passing time >>>>>>");
    console.log((stopTime-startTime) + "ms");
    // おけない

    console.log(teki_pos.x + ":" + teki_pos.y + ":" + teki_pos.player );
    socket.broadcast.emit('send teki_pos1', teki_pos);
  });

  socket.on('send onitime', function () {
    console.log("oni: " + oni_flag);
    oni_flag = (oni_flag + 1) % player_num;
    socket.broadcast.emit('send oni', oni_flag);
    socket.emit('send oni', oni_flag);
  });

  socket.on('send gameset', function (){
    // console.log('gameset');
    socket.broadcast.emit('send fin');
    socket.emit('send fin');
  });
};


