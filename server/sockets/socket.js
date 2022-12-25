const { Usuarios } = require("../classes/usuarios");
const { io } = require("../server");
const usuarios = new Usuarios();
const { crearMensaje } = require("../utils/utilidades");

io.on("connection", client => {
	client.on("entrarChat", (usuario, callback) => {
		if (!usuario.nombre || !usuario.sala) {
			return callback({
				error: true,
				msg: "El nombre/sala es necesario",
			});
		}

		client.join(usuario.sala);

		usuarios.agregarPersona(client.id, usuario.nombre, usuario.sala);

		client
			.to(usuario.sala)
			.emit("lista-personas", usuarios.getPersonasPorSala(usuario.sala));

		client.broadcast
			.to(usuario.sala)
			.emit(
				"crear-mensaje",
				crearMensaje(
					"Administrador",
					`El usuario ${usuario.nombre} se conectó`
				)
			);

		callback(usuarios.getPersonasPorSala(usuario.sala));
	});

	client.on("crear-mensaje", (data, callback) => {
		let persona = usuarios.getPersona(client.id);
		let mensaje = crearMensaje(persona.nombre, data.mensaje);
		client.broadcast.to(persona.sala).emit("crear-mensaje", mensaje);

		callback(mensaje);
	});

	client.on("disconnect", () => {
		let personaBorrada = usuarios.deletePersona(client.id);

		// Emitir evento con la persona borrada
		client
			.to(personaBorrada.sala)
			.emit(
				"crear-mensaje",
				crearMensaje(
					"Administrador",
					`El usuario ${personaBorrada.nombre} se desconectó`
				)
			);

		client
			.to(personaBorrada.sala)
			.emit(
				"lista-personas",
				usuarios.getPersonasPorSala(personaBorrada.sala)
			);
	});

	// Mensajes privados
	client.on("mensajePrivado", data => {
		let persona = usuarios.getPersona(client.id);
		client.broadcast
			.to(data.receptor)
			.emit("mensajePrivado", crearMensaje(persona.nombre, data.mensaje));
	});
});
