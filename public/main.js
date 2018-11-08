var socket = io("http://localhost:3000");

socket.on("server-send-login-fail", function(data){
    alert("Đăng nhập thất bại!!!");
});

socket.on("server-send-login-success", function(data){
    $('#currentUser').html(data);
    $('#loginForm').hide();
    $('#chatForm').show();
});

socket.on("server-send-register-fail", function(data){
    alert("Đăng ký thất bại!!!");
});

socket.on("server-send-register-success", function(data){
    $('#currentUser').html(data);
    $('#loginForm').hide();
    $('#chatForm').show();
});

socket.on("server-send-userlist", function(data){
    $('#boxContent').html("");
    data.forEach(function(element) {
        $('#boxContent').append("<div class='useronline'>" + element + "</div");
    });
    
});

socket.on("server-send-message", function(data){
    $('#listMessages').append("<div class='ms'>" + data.sender + ": " + data.message +"</div>");
});

socket.on("server-send-start-typing", function(data){
    $('#notification').html(data);
});

socket.on("server-send-stop-typing", function(){
    $('#notification').html('');
});

$(document).ready(function(){
    $('#loginForm').show();
    $('#chatForm').hide();

    $('#btnRegister').click(function(){
        var username = $('#txtName').val();
        var password =  $('#txtPass').val();
        socket.emit("client-send-register", {username: username, password: password});
    });

    $('#btnLogin').click(function(){
        var username = $('#txtUsername').val();
        var password =  $('#txtPassword').val();
        socket.emit("client-send-login", {username: username, password: password});
    });

    $('#btnLogout').click(function(){
        socket.emit("client-send-logout");
        $('#loginForm').show();
        $('#chatForm').hide();
    });

    $('#btnSendMessage').click(function(){
        if($('#txtMessage').val() == ''){
            alert('plz enter message!!!');
            return;
        }
        socket.emit("client-send-message", $('#txtMessage').val());
    });

    $('#txtMessage').focusin(function(){
        socket.emit("client-start-typing");
    });

    $('#txtMessage').focusout(function(){
        socket.emit("client-stop-typing");
    });

    $('.message a').click(function(){
        $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
     });
});