var app = require('express')();
var http = require('http').Server(app);
var pg = require('pg');

var io = require('socket.io')(http);
var fs =  require("fs");
var Twitter = require('node-tweet-stream')
, t = new Twitter({
  consumer_key: '158Fgj18GseAgELfkHET2VptU',
  consumer_secret: 'iA4KqiGGGVPmCn1xf4Fk0rr8npWEffKtJe16nmNEkRenqEtuvN',
  token: '1389298538-6kfhQr4FUFwkH069KjbcING4yHVG2A9lLtnepny',
  token_secret: '2bU4Z8GXG6WUpgEwdfvTCbBQHVAFr7cvDeuVLWId5w33U'
})
t.track(process.env.TRACK)



var port = Number(process.env.PORT || 3000)
var dbres;

app.get('/', function(req, res){
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM bugs', function(err, result) {
      done();
      if (err)
       { console.error("error on loading table: "+err); response.send("Error " + err); }
     else
     {
      console.log("database online");
      dbres = result.rows;
    }
  });
  });
  res.sendfile('index.html');
});





http.listen(port, function(){
  console.log('listening on *:'+port);
});





io.on('connection', function(socket){
  socket.on('dataEntry', function(msg){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      var tw = msg;
      client.query('INSERT INTO bugs (id, name, sym, fix, keywords) VALUES (00,\''+msg.nam+'\',\''+msg.sym+'\',\''+msg.fix+'\',\''+msg.key+'\') ', function(err, result) {
        done();
        if (err)
         { console.error(err); }

     });
    });

  });
  socket.on('getData', function(data){
    if(data.terms.length>0){
      pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query('SELECT * FROM bugs', function(err, result) {
          if(result!=null){
            var sendArr = result.rows;
            if(result.rows != null){
              for(var i = result.rows.length-1; i>=0; i--){
                var toSearch =JSON.stringify(result.rows[i]);
                toSearch = toSearch.replace("fix", "");
                toSearch = toSearch.replace("sym", "");
                toSearch = toSearch.replace("id", "");
                toSearch = toSearch.replace("name", "");
                toSearch = toSearch.replace("key", "");
                console.log(toSearch);
                
                var inthere = toSearch.search(data.terms);
                if(inthere==-1){
                  sendArr.splice(i, 1);
                }
              }
            }

            socket.emit('tableResult', result.rows);
            done();
            if (err)
             { console.error(err); }
         }
       });
      });

      
    } else {
      pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query('SELECT * FROM bugs', function(err, result) {
          socket.emit('tableResult', result.rows);
          if(result!=null)
            console.log(result.rows);
          done();
          if (err)
           { console.error(err); }

       });
      });
    }
  });
});





io.on('formInput', function(data){
  console.log("message"+data);
  io.emit("msg", "message received")

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var tw = data;
/*    client.query('INSERT INTO tweets (id, tweet, date) VALUES (00,\''+tw+'\', \'date\') ', function(err, result) {
      done();
      if (err)
       { console.error(err); }

  */ });
  });
})



t.on('error', function (err) {
  console.log('Oh no')
})
