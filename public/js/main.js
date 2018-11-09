var socket = io("http://localhost:3000");

var listUser = [];
socket.on("server-send-connected", function(data){
    $('#socketId').val(data);
});

socket.on("server-send-login-fail", function(data){
    $('#login-message').html('Đăng nhập thất bại !!!');
});

socket.on("server-send-login-success", function(data){
    $('#currentUser').html(data);
    $('#loginForm').hide();
    $('#chatForm').show();
    $('#listMessages').html('');
});

socket.on("server-send-register-fail", function(data){
    $('#register-message').html('Đăng ký thất bại !!!');
});

socket.on("server-send-register-success", function(data){
    $('#currentUser').html(data);
    $('#loginForm').hide();
    $('#chatForm').show();
    $('#listMessages').html('');
});

socket.on("server-send-userlist", function(data){
    listUser = data;
});

socket.on("server-send-new room", function(data){
    $('#currentRoom').html("<span style='font-size: 16px; font-weight: bold'>" + data.name + "<i class='fa fa-angle-down'></i></span>");
    $('#listRooms > tbody  > tr').each(function() {
        $(this).css({backgroundColor: 'white'});
    });
    $('#listRooms tbody').prepend("<tr style='background-color: #def3e3;'><td><img src='../images/room_icon.png' class='img-circle' width='40px' height='40px' style='float:left; margin-right: 5px;'><div style='margin-top: 10px;'><strong> " + data.name + "</strong></div></td></tr>");
    $('#listMessages').html('');
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

    $('#btnCreateRoom').click(function(){
        $('#listUser').html('');
        listUser.forEach(function(element, index) {
            if(element.username != $('#currentUser').text()){
                $('#listUser').append("<div class='form-check'><input type='checkbox' class='form-check-input' id='" + element.socketid +"'><label class='form-check-label' for='" + element.socketid +"'>" + element.username + "</label></div>");
            }
        });
        $('#createRoomModal').modal();
    });

    $('#btnClose').click(function(){
        var groupName = $('#txtGroupName').val();
        var listSocket = [];
        listSocket.push($('#socketId').val());
        $('input:checkbox.form-check-input').each(function () {
            if(this.checked){
                listSocket.push(this.getAttribute("id"));
            }
        });
        $('#createRoomModal').modal('hide');
        socket.emit("client-send-create-room", {name: groupName, listSocket : listSocket});
    });
});