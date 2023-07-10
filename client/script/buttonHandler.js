$("button[name='loginButton']").click(function() {
	socket.emit('login', {
		password: $("input[name='loginInput']").val()
	});
});