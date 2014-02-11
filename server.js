var dbclient=null;
var scores = new Array();
scores[0] = 0;
scores[1] = 0;

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
        } else if (event.data == "TABLE") {
          wss.broadcast(JSON.stringify(["TABLE"]));
        } else if (event.data == "VIEW") {
          wss.broadcast(JSON.stringify(["VIEW"]));
        } else {
          var query = event.data.split(':');
          if (query.length > 1)
          {
            var key = query[0];
            var value = query[1];
            dbclient.set(key,value);
            wss.broadcast(JSON.stringify(query));

          dbclient.get(key, function(err, reply) {
             // reply is null when the key is missing
             console.log(reply);
          });

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
