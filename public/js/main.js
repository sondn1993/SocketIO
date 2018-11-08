var socket = io("http://localhost:3000");

var listUser = [];
socket.on("server-send-connected", function(data){
    $('#socketId').val(data);
});

socket.on("server-send-login-fail", function(data){
    alert("Đăng nhập thất bại!!!");
});

socket.on("server-send-login-success", function(data){
    $('#currentUser').html(data);
    $('#loginForm').hide();
    $('#chatForm').show();
    $('#listMessages').html('');
});

socket.on("server-send-register-fail", function(data){
    alert("Đăng ký thất bại!!!");
});

socket.on("server-send-register-success", function(data){
    $('#currentUser').html(data);
    $('#loginForm').hide();
    $('#chatForm').show();
    $('#listMessages').html('');
});

socket.on("server-send-userlist", function(data){
    // $('#boxContent').html("");
    // data.forEach(function(element) {
    //     $('#boxContent').append("<div class='useronline'>" + element + "</div");
    // });
    listUser = data;
    alert(listUser.length);
});

socket.on("server-send-listroom", function(data){
    $('#currentRoom').html("<span style='font-size: 16px; font-weight: bold'>" + data[0].name + "<i class='fa fa-angle-down'></i></span>");
    data.forEach(function(element) {
        $('#listRooms tbody').append("<tr><td><img src='../images/room_icon.png' class='img-circle' width='40' height='40' style='float:left; margin-right: 5px;'><span> " + element.id + "</span></td></tr>");
    });
});

socket.on("server-send-message", function(data){
    $('#listMessages').append("<div class='chat-me'>" + data.sender + ": " + data.message +"</div>");
});

socket.on("server-send-start-typing", function(data){
    $('#chat-notification').html("<div class='chat-notification'>" + data +"</div>");
});

socket.on("server-send-stop-typing", function(){
    $('#chat-notification').html('');
});

$(document).ready(function(){
    $('#loginForm').show();
    $('#chatForm').hide();

    $('#btnRegister').click(function(){
        var username = $('#txtName').val();
        var password =  $('#txtPass').val();
        var socketId =  $('#socketId').val();
        socket.emit("client-send-register", {username: username, password: password, socketid : socketId});
    });

    $('#btnLogin').click(function(){
        var username = $('#txtUsername').val();
        var password =  $('#txtPassword').val();
        var socketId =  $('#socketId').val();
        socket.emit("client-send-login", {username: username, password: password, socketid : socketId});
    });

    $('#btnLogout').click(function(){
        socket.emit("client-send-logout");
        $('#loginForm').show();
        $('#chatForm').hide();
    });

    $('#btnSendMessage').click(function(){
        if($('#txtMessage').val() == ''){
            return;
        }
        $('#listMessages').scrollTop($('#listMessages')[0].scrollHeight - $('#listMessages')[0].clientHeight);
        socket.emit("client-send-message", $('#txtMessage').val());
        $('#listMessages').append("<div class='chat-you'>" +   $('#txtMessage').val() + " :" +$('#currentUser').text() +"</div>");
        $('#txtMessage').val(''); 
    });

    $('#txtMessage').keypress(function (e) {
        if (e.which == 13){
            if($('#txtMessage').val() == ''){
                return;
            }
            $('#listMessages').scrollTop($('#listMessages')[0].scrollHeight - $('#listMessages')[0].clientHeight);
            socket.emit("client-send-message", $('#txtMessage').val());
            $('#listMessages').append("<div class='chat-you'>" +   $('#txtMessage').val() + " :" +$('#currentUser').text() +"</div>");
        }
        $('#txtMessage').val(''); 
    });

    $('#txtMessage').click(function(){
        socket.emit("client-start-typing");
    });

    $('#txtMessage').focusout(function(){
        socket.emit("client-stop-typing");
    });

    $('#toLoginForm').click(function(){
        $('#register-form').hide();
        $('#login-form').show();
    });

    $('#toRegisterForm').click(function(){
        $('#register-form').show();
        $('#login-form').hide();
    });
});