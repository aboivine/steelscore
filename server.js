var dbclient=null;
var round = 1;
var scores = new Array();
scores[0] = 0;
scores[1] = 0;

function sendAll() {
   for (var i = 1; i <=3; i++) {
   for (var j = 1; j <=3; j++) {
   for (var k = 1; k <=3; k++) {
   for (var l = 1; l <=2; l++) {

     var key = "";
     if (l == 1) {
       key = round.toString() + "-" + i.toString()+"-"+j.toString()+"-"+k.toString()+"-n";
     } else {
       key = i.toString()+"-"+j.toString()+"-"+k.toString()+"-t";
     }
      dbclient.get(key, function(err, reply) {
         var snd = reply.split(":");
         console.log("New req");
         console.log(JSON.stringify(snd));
         wss.broadcast(JSON.stringify(snd));
      });
   
   }}}}
}

var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

//app.all("*", function(request, response, next) {
//  response.writeHead(200, { "Content-Type": "html" });
//  next();
//});

app.get("/counter?:who", function(request, response) {
  response.sendfile('counter.html');
});

app.get("/viewer", function(request, response) {
  response.sendfile('viewer.html');
});

app.get("/table", function(request, response) {
  response.sendfile('table.html');
});

app.get("/master", function(request, response) {
  response.sendfile('master.html');
});


app.get("*", function(request, response) {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("This page doesn't exist.");
});

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');

wss.broadcast = function(data) {
    for(var i in this.clients)
        this.clients[i].send(data);
};

wss.on('connection', function(ws) {
    var id = setInterval(function() {
        wss.broadcast(JSON.stringify(scores));
    }, 300);

    console.log('websocket connection open');

    ws.onmessage = function (event) {
        //ws.send(JSON.stringify(new Date()), function() {  });
        if (event.data == "Reset") {
          scores[0] = 0;
          scores[1] = 0;
        } else if (event.data == "0") { 
          scores[0]++;
        } else if (event.data == "1") {
          scores[1]++;
        } else if (event.data == "ROUND1") {
          wss.broadcast(JSON.stringify(["ROUND1"]));
          round = 1;
        } else if (event.data == "ROUND2") {
          wss.broadcast(JSON.stringify(["ROUND2"]));
          round = 2;
        } else if (event.data == "ROUND3") {
          wss.broadcast(JSON.stringify(["ROUND3"]));
          round = 3;
        } else if (event.data == "GET") {
          sendAll();
        } else if (event.data == "VIEW") {
          wss.broadcast(JSON.stringify(["VIEW"]));
        } else {
          var query = event.data.split(':');
          if (query.length > 1)
          {
            var key = query[0];
            var value = query[1];
            if(value == "?")
            {
            dbclient.get(key, function(err, reply) {
               var snd = new Array();
               snd[0] = key;
               snd[1] =reply ;
            console.log("New request");
            console.log(JSON.stringify(snd));
               wss.broadcast(JSON.stringify(snd));
            });
            }else{
            var res = key+":"+value;
            if (key.slice(-1) == "n")
            {
              res = res.substring(2);
            }
            dbclient.set(key,res);
            console.log("set "+key+"="+res);
            wss.broadcast(JSON.stringify(query));
           }
          }
        }

        //wss.broadcast(score.toString());
    };

    ws.on('close', function() {
        console.log('websocket connection close');
        //clearInterval(id);
    });

    ws.send(JSON.stringify(scores));
});

//REDIS
var redis = require("redis");
var url = require("url");

if (process.env.REDISCLOUD_URL) {
//REDISCLOUD_URL: redis://rediscloud:vX7OPQEOXIKi7zgm@pub-redis-14432.us-east-1-3.1.ec2.garantiadata.com:14432

  console.log('connecting to Redis');
  var rtg   = url.parse(process.env.REDISCLOUD_URL);
  dbclient = redis.createClient(rtg.port, rtg.hostname);

  dbclient.on("error", function (err) {
        console.log("Redis Error " + err);
    });
  dbclient.auth(rtg.auth.split(":")[1]);
} else {
  console.log('local redis');
  dbclient = redis.createClient();
  dbclient.on("error", function (err) {
        console.log("Redis Error " + err);
    });
}
