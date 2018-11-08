var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

var userList = [{username : 'sondn', socketid : '123', password : '123'}, {username : 'son', socketid : '1234', password : '123'}];
var maxId = 1;

io.on("connection", function(socket){
    console.log(socket.id + " connected");
    socket.join('PublicRoom');
    socket.emit("server-send-connected", socket.id);
    socket.ListRoom = [{id: 'PublicRoom' , name : 'PublicRoom'}];

    socket.on('disconnect', function(){
        console.log(socket.id + " disconnected");
        userList.forEach(function(element, index) {
            if(element.username == socket.Username){
                userList.splice(index, 1);
                return;
            }
        });
    });

    socket.on("client-send-register", function(data){
        console.log(data.username);
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
            userList.push({username : data.username, socketid: data.socketid, password: data.password});
            socket.Username = data.username;
            socket.emit("server-send-register-success", data.username);
            socket.emit("server-send-listroom", socket.ListRoom);
            io.sockets.emit("server-send-userlist", userList);
        }
    });

    socket.on("client-send-login", function(data){
        console.log(data.username);
        var check = false;
        userList.forEach(function(element) {
            if(element.username == data.username && element.password == data.password){
                check = true;
                return;
            }
        });
        if(check){
            socket.Username = data.username;
            socket.emit("server-send-login-success", data.username);
            socket.emit("server-send-listroom", socket.ListRoom);
            io.sockets.emit("server-send-userlist", userList);
        }else{
            socket.emit("server-send-login-fail");
        }
    });

    socket.on("client-send-logout", function(){
        userList.splice(userList.indexOf(socket.Username), 1);
        socket.Username = "";
        socket.broadcast.emit("server-send-userlist", userList);
    });

    socket.on("client-send-message", function(data){
        console.log(socket.Username + " chatted " + data);
        socket.broadcast.emit("server-send-message", {sender: socket.Username, message: data});
        //socket.emit("Chat", data);
        //io.broadcast.emit("Chat", data);
    });

    socket.on("client-start-typing", function(){
        socket.broadcast.emit("server-send-start-typing", socket.Username + ' is typing');
        //socket.emit("Chat", data);
        //io.broadcast.emit("Chat", data);
    });

    socket.on("client-stop-typing", function(){
        socket.broadcast.emit("server-send-stop-typing");
        //socket.emit("Chat", data);
        //io.broadcast.emit("Chat", data);
    });
});

app.get("/", function(req, res){
    res.render("home");
});