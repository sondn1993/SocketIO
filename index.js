var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

const AWS = require('aws-sdk');
const config = {
    region: 'local',
    endpoint: 'http://localhost:8000'
}
AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

    var userList = [];
var maxId = 1;

io.on("connection", function(socket){
    console.log(socket.id + " connected");
    socket.emit("server-send-connected", socket.id);
    socket.Room = {roomId: 'PublicRoom' , roomName : 'PublicRoom'};
    socket.join('PublicRoom');
    console.log(io.sockets.adapter.rooms['PublicRoom'].length);

    socket.on('disconnect', function(){ 
        console.log(socket.id + " disconnected");
        userList.forEach(function(element, index) {
            if(element.username == socket.username){
                userList.splice(index, 1);
                return;
            }
        });
    });

    socket.on("client-send-register", function(data){
        var check = false;
        userList.forEach(function(element) {
            if(element.username == data.username && element.password == data.password){
                check = true;
                return;
            }
        });
        if(check){
            socket.emit("server-send-register-fail");
        }else{
            userList.push({username : data.username, socketId: data.socketId, password: data.password});
            socket.username = data.username;
            socket.emit("server-send-register-success", data.username);
            socket.emit("server-send-new room", socket.Room);
            io.sockets.emit("server-send-userlist", userList);
        }
    });

    socket.on("client-send-login", function(data){
        var check = false;
        userList.forEach(function(element) {
            if(element.username == data.username && element.password == data.password){
                check = true;
                return;
            }
        });
        if(check){
            socket.username = data.username;
            socket.emit("server-send-login-success", data.username);
            socket.emit("server-send-new room", socket.Room);
            io.sockets.emit("server-send-userlist", userList);
        }else{
            socket.emit("server-send-login-fail");
        }
    });

    socket.on("client-send-logout", function(){
        userList.splice(userList.indexOf(socket.username), 1);
        socket.username = "";
        socket.broadcast.emit("server-send-userlist", userList);
    });

    socket.on("client-send-create-room", function(data){
        socket.Room = {roomId: data.roomName , roomName : data.roomName};
        //console.log(io);
        socket.join(data.name);
        data.listSocket.forEach(function(element, index) {
            io.sockets.connected[element].join(data.roomName);
        });
        io.sockets.in(data.roomName).emit("server-send-new room", {roomId: data.roomName, roomName: data.roomName});
    });

    socket.on("client-send-message", function(data){
        socket.broadcast.in(data.roomId).emit("server-send-message", {sender: socket.username, message: data.message, roomId : data.roomId});
    });

    socket.on("client-start-typing", function(data){
        socket.broadcast.in(data).emit("server-send-start-typing", {username: socket.username, roomId : data});
    });

    socket.on("client-stop-typing", function(data){
        socket.broadcast.in(data).emit("server-send-stop-typing", {username: socket.username, roomId : data});
    });
});

app.get("/", function(req, res){
    res.render("login", {messageLogin : ''});
});

app.post("/login", function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    var params = {
        TableName: 'User',
        FilterExpression:'UserName = :UserName',
        ExpressionAttributeValues: {
          ":UserName": username
        }
    };
    docClient.scan(params, function(err, data) {
        if (err) {
            console.log(err);
            res.render("login", {messageLogin : 'co loi xay ra'});
        } else if( data.Count == 0){
            res.render("login", {messageLogin : 'ten dang nhap hoac mat khau khong dung'});
        } else {
            res.render("home", {messageLogin : '123'});
        }
    });
    
});

app.post("/register", function(req, res){
    var username = req.body.username;
    var email = req.body.email;

    var paramCheck = {
        TableName: 'User',
        FilterExpression:'UserName = :UserName',
        ExpressionAttributeValues: {
          ":UserName": username
        }
    };

    var paramPut = {
        TableName: 'User',
        Item: { // a map of attribute name to AttributeValue
          UserID: "User_" + username,
          UserName: username,
          Email: email,
          Status: 0,
          Type: 0,
          SocketIDs: "[]",
          RoomIDs: "[]"
        },
    
        ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
        ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
        ReturnItemCollectionMetrics: 'NONE' // optional (NONE | SIZE)
    };
    docClient.scan(paramCheck, function(err, data) {
        if (err) {
            console.log(err);
            res.render("login", {messageRegister : "co loi xay ra"});
        } else if(data.Count >0){
            res.render("login", {messageRegister : "username da ton tai "});
        } else {
            docClient.put(paramPut, function(err, data) {
                if (err) {
                    console.log(err);
                    res.render("login", {messageRegister : "co loi xay ra"});
                } else {
                    res.render("home", {messageRegister : '123'});
                }
            });
        }
    });
});