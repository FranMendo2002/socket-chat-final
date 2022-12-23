var socket = io();

var params = new URLSearchParams(window.location.search);

if (!params.has("nombre") || !params.has("sala")) {
	window.location = "index.html";
	throw new Error("El nombre y sala son necesarios");
}

var usuario = {
	nombre: params.get("nombre"),
	sala: params.get("sala"),
};

socket.on("connect", function () {
	console.log("Conectado al servidor");

	socket.emit("entrarChat", usuario, resp => {
		console.log("Usuarios conectados: ", resp);
	});
});

// escuchar
socket.on("disconnect", function () {
	console.log("Perdimos conexión con el servidor");
});

// Enviar información
// socket.emit(
// 	"crear-mensaje",
// 	{
// 		usuario: "Fernando",
// 		mensaje: "Hola Mundo",
// 	},
// 	function (resp) {
// 		console.log("respuesta server: ", resp);
// 	}
// );

// Escuchar persona borrada
socket.on("crear-mensaje", payload => {
	console.log(payload);
});

// Se ejecuta cada vez que una persona entra o sale del chat
socket.on("lista-personas", personas => {
	console.log("Servidor - personas: ", personas);
});

// Mensajes privados
socket.on("mensajePrivado", mensaje => {
	console.log("Mensaje privado: ", mensaje);
});
