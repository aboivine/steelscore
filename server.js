var score = 0;

var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

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
        wss.broadcast(score.toString());
    }, 300);

    console.log('websocket connection open');

    ws.onmessage = function (event) {
        //ws.send(JSON.stringify(new Date()), function() {  });
        if (event.data == "Reset") {
          score = 0;
        } else {
          score++;
        }
        //wss.broadcast(score.toString());
    };

    ws.on('close', function() {
        console.log('websocket connection close');
        //clearInterval(id);
    });

    ws.send(score.toString());
});
