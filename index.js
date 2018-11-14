var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

var userList = [];
var maxId = 1;

io.on("connection", function(socket){
    console.log(socket.id + " connected");
    socket.emit("server-send-connected", socket.id);
    socket.Room = {roomId: 'PublicRoom' , roomName : 'PublicRoom'};
    socket.join('PublicRoom');

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
    res.render("home");
});