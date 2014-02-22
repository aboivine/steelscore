var dbclient=null;
var round = 1;
var scores = new Array();
scores[0] = 0;
scores[1] = 0;
scores[2] = -1;
var judges = new Array();
judges[0] = 0;
judges[1] = 0;
judges[2] = -2;
var savedJ = new Array();
savedJ[0] = 0;
savedJ[1] = 0;
savedJ[2] = 1;
savedJ[3] = 1;
var f0name = "";
var f1name = "";
var catname = "";

function sendAllI()
{
   for (var i = 1; i <=3; i++) {
   for (var j = 1; j <=3; j++) {
   for (var k = 1; k <=3; k++) {
   for (var l = 1; l <=2; l++) {

     var key = "";
     if (l == 1) {
       key = "1-" + i.toString()+"-"+j.toString()+"-"+k.toString()+"-n";
     } else {
       key = i.toString()+"-"+j.toString()+"-"+k.toString()+"-t";
     }
      dbclient.get(key, function(err, reply) {
       if (reply!=null){
         var snd = reply.split(":");
         if (snd[0].slice(-1) == "n"){
            snd[0] = "1-" + snd[0];
         }
         wss.broadcast(JSON.stringify(snd));
      }});

   }}}}

}

function sendAllII()
{
   for (var i = 1; i <=3; i++) {
   for (var j = 1; j <=3; j++) {
   for (var k = 1; k <=3; k++) {
   for (var l = 1; l <=2; l++) {

     var key = "";
     if (l == 1) {
       key = "2-" + i.toString()+"-"+j.toString()+"-"+k.toString()+"-n";
     } else {
       key = i.toString()+"-"+j.toString()+"-"+k.toString()+"-t";
     }
      dbclient.get(key, function(err, reply) {
       if (reply!=null){
         var snd = reply.split(":");
         if (snd[0].slice(-1) == "n"){
            snd[0] = "2-" + snd[0];
         }
         wss.broadcast(JSON.stringify(snd));
      }});

   }}}}
}

function sendAllIII()
{
   for (var i = 1; i <=3; i++) {
   for (var j = 1; j <=3; j++) {
   for (var k = 1; k <=3; k++) {
   for (var l = 1; l <=2; l++) {

     var key = "";
     if (l == 1) {
       key = "3-" + i.toString()+"-"+j.toString()+"-"+k.toString()+"-n";
     } else {
       key = i.toString()+"-"+j.toString()+"-"+k.toString()+"-t";
     }
      dbclient.get(key, function(err, reply) {
       if (reply!=null){
         var snd = reply.split(":");
         if (snd[0].slice(-1) == "n"){
            snd[0] = "3-" + snd[0];
         }
         wss.broadcast(JSON.stringify(snd));
      }});

   }}}}
}

function sendAll() {
   var blank = new Array();
   blank[0] = "";
   blank[1] = " ";
   for (var i = 1; i <=3; i++) {
   for (var j = 1; j <=3; j++) {
   for (var k = 1; k <=3; k++) {
   for (var l = 1; l <=2; l++) {

     var key = "";
     if (l == 1) {
       key = round.toString() + "-" + i.toString()+"-"+j.toString()+"-"+k.toString()+"-n";
       blank[0]=i.toString()+"-"+j.toString()+"-"+k.toString()+"-n";
       wss.broadcast(JSON.stringify(blank));
     } else {
       key = i.toString()+"-"+j.toString()+"-"+k.toString()+"-t";
     }
      dbclient.get(key, function(err, reply) {
       if (reply!=null){
         var snd = reply.split(":");
         wss.broadcast(JSON.stringify(snd));
      }});
   
   }}}}

   for (var i = 1; i <=3; i++) {
   for (var j = 1; j <=9; j++) {

     var key = "m"+i.toString()+"-"+j.toString();
     dbclient.get(key, function(err, reply) {
       if (reply!=null){
         var snd = reply.split(":");
         wss.broadcast(JSON.stringify(snd));
      }});

   }}

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
server.on('error', function (e) {
  // Handle your error here
  console.log("Http server error:" + e);
});
server.listen(port);

console.log('http server listening on %d', port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');

wss.broadcast = function(data) {
    for(var i in this.clients)
    {
      if(this.clients[i].readyState == 1){
        this.clients[i].send(data);
      }
    }
};

wss.on('error', function(e) {
  console.log("WebSoseckt Error:" + e);
});

wss.on('connection', function(ws) {
    var id = setInterval(function() {
        wss.broadcast(JSON.stringify(scores));
    }, 440);

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
        } else if (event.data == "2") {
          scores[0]--;
        } else if (event.data == "3") {
          scores[1]--;
        }else if (event.data == "MELEE") {
          wss.broadcast(JSON.stringify(["MELEE"]));
        } else if (event.data == "ROUND1") {
          wss.broadcast(JSON.stringify(["ROUND1"]));
          round = 1;
        } else if (event.data == "ROUND2") {
          wss.broadcast(JSON.stringify(["ROUND2"]));
          round = 2;
        } else if (event.data == "ROUND3") {
          wss.broadcast(JSON.stringify(["ROUND3"]));
          round = 3;
        } else if (event.data == "GJ0") {
          var judge = new Array();
           judge[0]=0;
           judge[1]=savedJ[0];
           judge[2]=-2;
           wss.broadcast(JSON.stringify(judge));
        }else if (event.data == "GJ1") {
           var judge = new Array();
           judge[0]=1;
           judge[1]=savedJ[1];
           judge[2]=-2;
           wss.broadcast(JSON.stringify(judge));
        }else if (event.data == "GJ2") {
          var judge = new Array();
           judge[0]=2;
           judge[1]=savedJ[2];
           judge[2]=-2;
           wss.broadcast(JSON.stringify(judge));
        }else if (event.data == "GJ3") {
          var judge = new Array();
           judge[0]=3;
           judge[1]=savedJ[3];
           judge[2]=-2;
           wss.broadcast(JSON.stringify(judge));
        }else if (event.data == "GET") {
          sendAll();
          var info = new Array();
          info[0] = "category";
          info[1] = catname;
          wss.broadcast(JSON.stringify(info));

          info[0] = "side-0";
          info[1] = f0name;
          wss.broadcast(JSON.stringify(info));

          info[0] = "side-1";
          info[1] = f1name;
          wss.broadcast(JSON.stringify(info));
        } else if (event.data == "GETI") {
          sendAllI();
          sendAllII();
          sendAllIII();
        } else if (event.data == "VIEW") {
          wss.broadcast(JSON.stringify(["VIEW"]));
        } else if (event.data == "TABLE") {
          wss.broadcast(JSON.stringify(["TABLE"]));
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
              wss.broadcast(JSON.stringify(snd));
            });
            } else if (key == "jid0"){
               savedJ[0]=value;
               console.log("SAVED A="+value);
               judges[0]=0;
               judges[1]=value;
               wss.broadcast(JSON.stringify(judges));
            }
            else if (key == "jid1"){
               savedJ[1]=value;
               console.log("SAVED B="+value);
               judges[0]=1;
               judges[1]=value;
               wss.broadcast(JSON.stringify(judges));
            }
            else if (key == "jid2"){
               savedJ[2]=value;
               console.log("SAVED C="+value);
               judges[0]=2;
               judges[1]=value;
               wss.broadcast(JSON.stringify(judges));
            }
            else if (key == "jid3"){
               savedJ[3]=value;
               console.log("SAVED D="+value);
               judges[0]=3;
               judges[1]=value;
               wss.broadcast(JSON.stringify(judges));
            }
            else{
              var res = key+":"+value;
              if (key.slice(-1) == "n")
              {
                res = res.substring(2);
                query[0] = key.substring(2);
              } else if (key == "category") {
                catname = value;
              } else if (key == "side-0") {
                f0name = value;
              } else if (key == "side-1") {
                f1name = value;
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
