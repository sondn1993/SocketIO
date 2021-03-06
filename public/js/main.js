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
    $('#currentRoom').html("<span style='font-size: 16px; font-weight: bold'>" + data.roomName + "<i class='fa fa-angle-down'></i></span><input type='hidden' id='currentRoomId' value='" + data.roomId +"' />");
    $('#listRooms > tbody  > tr').each(function() {
        $(this).css({backgroundColor: 'white'});
    });
    $('#listRooms tbody').prepend("<tr id='" + data.roomId +"' style='background-color: #def3e3;' onclick='changeRoom(this);'><td><img src='../images/room_icon.png' class='img-circle' width='40px' height='40px' style='float:left; margin-right: 5px;'><div style='margin-top: 10px;'><strong> "+ data.roomName +"</strong></div></td></tr>");
    $('#listMessages').html('');
});

socket.on("server-send-message", function(data){
    $('#listMessages').append("<div class='chat-me'>" + data.sender + ": " + data.message +"</div>");
    $('#currentRoom').html("<span style='font-size: 16px; font-weight: bold'>" + data.roomId + "<i class='fa fa-angle-down'></i></span><input type='hidden' id='currentRoomId' value='" + data.roomId +"' />");
    $('#listRooms > tbody  > tr').each(function() {
        if(this.getAttribute("id") == data.roomId){
            $(this).remove();
        }else{
            $(this).css({backgroundColor: 'white'});
        }
    });
    $('#listRooms tbody').prepend("<tr id='" + data.roomId +"' style='background-color: #def3e3;' onclick='changeRoom(this);'><td><img src='../images/room_icon.png' class='img-circle' width='40px' height='40px' style='float:left; margin-right: 5px;'><div style='margin-top: 10px;'><strong> " + data.roomId + "</strong></div></td></tr>");
});

socket.on("server-send-start-typing", function(data){
    if($('#currentRoomId').val() == data.roomId){
        $('#chat-notification').html("<div class='chat-notification'>" + data.username +" is typing</div>");
    }
});

socket.on("server-send-stop-typing", function(data){
    if($('#currentRoomId').val() == data.roomId){
        $('#chat-notification').html('');
    }
});

$(document).ready(function(){

    $('#btnLogout').click(function(){
        socket.emit("client-send-logout");
        $('#loginForm').show();
        $('#chatForm').hide();
    });

    $('#btnSendMessage').click(function(){
        if($('#txtMessage').val() == ''){
            return;
        }
        var message = $('#txtMessage').val();
        var roomId = $('#currentRoomId').val();
        $('#listMessages').scrollTop($('#listMessages')[0].scrollHeight - $('#listMessages')[0].clientHeight);
        socket.emit("client-send-message", {message : message , roomId : roomId});
        $('#listMessages').append("<div class='chat-you'>" +   $('#txtMessage').val() + " :" +$('#currentUser').text() +"</div>");
        $('#txtMessage').val('');
        $('#txtMessage').blur(); 
    });

    $('#txtMessage').keypress(function (e) {
        if (e.which == 13){
            if($('#txtMessage').val() == ''){
                return;
            }
            var message = $('#txtMessage').val();
            var roomId = $('#currentRoomId').val();
            $('#listMessages').scrollTop($('#listMessages')[0].scrollHeight - $('#listMessages')[0].clientHeight);
            socket.emit("client-send-message", {message : message , roomId : roomId});
            $('#listMessages').append("<div class='chat-you'>" +   $('#txtMessage').val() + " :" +$('#currentUser').text() +"</div>");
            $('#txtMessage').val(''); 
            $('#txtMessage').blur(); 
        }
    });

    $('#txtMessage').click(function(){
        var roomId = $('#currentRoomId').val();
        socket.emit("client-start-typing", roomId);
    });

    $('#txtMessage').focusout(function(){
        var roomId = $('#currentRoomId').val();
        socket.emit("client-stop-typing", roomId);
    });

    $('#btnCreateRoom').click(function(){
        $('#listUser').html('');
        listUser.forEach(function(element, index) {
            if(element.username != $('#currentUser').text()){
                $('#listUser').append("<div class='form-check'><input type='checkbox' class='form-check-input' id='" + element.socketId +"'><label class='form-check-label' for='" + element.socketId +"'>" + element.username + "</label></div>");
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
        $('#txtGroupName').val('');
        $('#createRoomModal').modal('hide');
        socket.emit("client-send-create-room", {roomName: groupName, listSocket : listSocket});
    });
});

function changeRoom(room){
    var roomId = room.getAttribute("id");
    $('#listMessages').append("");
    $('#currentRoom').html("<span style='font-size: 16px; font-weight: bold'>" + roomId + "<i class='fa fa-angle-down'></i></span><input type='hidden' id='currentRoomId' value='" + roomId +"' />");
    $('#listRooms > tbody  > tr').each(function() {
        if(this.getAttribute("id") == roomId){
            $(this).remove();
        }else{
            $(this).css({backgroundColor: 'white'});
        }
    });
    $('#listRooms tbody').prepend("<tr id='" + roomId +"' style='background-color: #def3e3;' onclick='changeRoom(this);'><td><img src='../images/room_icon.png' class='img-circle' width='40px' height='40px' style='float:left; margin-right: 5px;'><div style='margin-top: 10px;'><strong> " + roomId + "</strong></div></td></tr>");
}