var crypto = require('crypto');
var RoomData = {};

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

// Dateオブジェクトから日時を表す文字列を生成する
function _formatDate(date) {
  var mm = date.getMonth();
  var dd = date.getDate();
  var HH = date.getHours();
  var MM = date.getMinutes();
  if (HH < 10) {
    HH = '0' + HH;
  }
  if (MM < 10) {
    MM = '0' + MM;
  }
  return mm + '/' + dd + ' ' + HH + ':' + MM;
};

// socket.ioのソケットを管理するオブジェクト
var socketsOf = {};

// socket.ioのコネクション設定
exports.onConnection = function (socket) {

  // コネクションが確立されたら'connected'メッセージを送信する
  socket.emit('connected', {});

  // 認証情報を確認する
  socket.on('hash password', function (password, fn) {
    var hashedPassword = '';
    var shasum = crypto.createHash('sha512');

    if (password !== '') {
      shasum.update('initialhash');
      shasum.update(password);
      hashedPassword = shasum.digest('hex');
    }
    fn(hashedPassword);
  });

  // 認証情報を確認する
  socket.on('check credential', function (client) {

    // クライアントはconnectedメッセージを受信したら、
    // minichatオブジェクトを引数にこのメッセージを送信する

    // 認証情報の確認
    if (client.mode == 'create') {
      // modeが'create'の場合、すでに対応するroomIdのチャットルームがないか
      // チェックする
      if (socketsOf[client.roomId] !== undefined) {
        socket.emit('room exists', {});
        return;
      }
      RoomData[client.roomId] = {};
      RoomData[client.roomId] = {
        player_num: 1,
        player_no: 0,
        finish_flag: 0
      };
      socketsOf[client.roomId] = {};
    }

    if (client.mode == 'enter') {
      // 対応するroomIdのチャットルームの存在をチェックする
      if (socketsOf[client.roomId] === undefined) {
        socket.emit('invalid credential', {});
        return;
      }
      // ユーザー名がかぶっていないかチェックする
      if (socketsOf[client.roomId][client.userName] !== undefined) {
        socket.emit('userName exists', {});
        return;
      }
      // すでにルームがいっぱいでないか確認
      if (RoomData[client.roomId].player_num >= 3){
        socket.emit('room full', {});
        return;
      }
      RoomData[client.roomId].player_num++;
    }

    // ソケットにクライアントの情報をセットする
    socket.set('client', client, function () {
      socketsOf[client.roomId][client.userName] = socket;
      // if (client.userName) {
        // console.log('user ' + client.userName + '@' + client.roomId + ' connected');
      // }
    });

    // 認証成功
    socket.emit('credential ok', {});

    // 既存クライアントにメンバーの変更を通知する
    var members = Object.keys(socketsOf[client.roomId]);
    emitToRoom(client.roomId, 'update members', members);

    var shasum = crypto.createHash('sha1');
    var message = {
        from: 'システムメッセージ',
        body: client.userName + 'さんが入室しました',
        roomId: client.roomId
    };
    message.date = _formatDate(new Date());
    shasum.update('-' + message.roomId);
    message.id = (new Date()).getTime() + '-' + shasum.digest('hex');
    emitToRoom(message.roomId, 'push message', message);

  });


  socket.on('Ready', function (){
    console.log("player_num: " + player_num);
    player_no = player_num;
    socket.emit('player num', player_no);
    player_num++;
    socket.get('client', function (err, client) {
      var shasum = crypto.createHash('sha1');
      var message = {
          from: 'システムメッセージ',
          body: client.userName + 'さんがReadyしました。',
          roomId: client.roomId
      };
      message.date = _formatDate(new Date());
      shasum.update('-' + message.roomId);
      message.id = (new Date()).getTime() + '-' + shasum.digest('hex');
      emitToRoom(message.roomId, 'push message', message);
    });
  });

 socket.on('startPushed', function (){
  console.log("startPushed!!!!!!!");
  socket.broadcast.emit('game start', player_num);
  socket.emit('game start', player_num);
 });

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


 

  // ソケットが切断された場合、ソケット一覧からソケットを削除する
  socket.on('disconnect', function () {
    socket.get('client', function (err, client) {
      if (err || !client) {
        return;
      }
      RoomData[client.roomId].player_num--;
      var sockets = socketsOf[client.roomId];
      if(sockets !== undefined) {
        delete sockets[client.userName];
      }
      console.log('user ' + client.userName + '@' + client.roomId + ' disconnected');
      var members = Object.keys(sockets);
      if (members.length === 0) {
        delete socketsOf[client.roomId];
      } else {
        // 既存クライアントにメンバーの変更を通知する
        emitToRoom(client.roomId, 'update members', members);
        var message = {
          from: 'システムメッセージ',
          body: client.userName + 'さんが退室しました',
          roomId: client.roomId
        };
        var shasum = crypto.createHash('sha1');
        message.date = _formatDate(new Date());
        shasum.update('-' + message.roomId);
        message.id = (new Date()).getTime() + '-' + shasum.digest('hex');
        emitToRoom(message.roomId, 'push message', message);
      }
    });
  });

  // クライアントは'say'メッセージとともにチャットメッセージを送信する
  socket.on('say', function (message, fn) {
    var shasum = crypto.createHash('sha1');
    message.date = _formatDate(new Date());
    shasum.update(message.userName + '-' + message.roomId);
    message.id = (new Date()).getTime() + '-' + shasum.digest('hex');
    emitToRoom(message.roomId, 'push message', message);
    // クライアント側のコールバックを実行する
    fn();
  });

  // クライアントはログが必要な場合'request log'メッセージを送信する
  socket.on('request log', function (data) {
    socket.get('client', function (err, client) {
      if (err || client === undefined) {
        return;
      }
      emitToRoom(client.roomId, 'request log', {}, function (log) {
        socket.emit('update log', log);
      });
    });
  });

};

