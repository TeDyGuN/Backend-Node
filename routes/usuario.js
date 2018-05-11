var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();

var Usuario = require('../models/usuario');

var jwt = require('jsonwebtoken');
var mdAutentificacion = require('../middlewares/autenticacion');

// Rutas
/**
 * Obtener Todos los Usuarios
 */
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error cargando Usuarios',
                        errors: err
                    });
                }
                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    })
                })

            })

});

/*
 * Actualizar Nuevo Usuario
 */
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Buscar Usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Usuario no existe',
                errors: { mensaje: 'No existe un usuario con ese ID' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        if (body.role != null) {
            usuario.role = body.role;
        }
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar Usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            })
        })
    });
});

/**
 * Crear un Nuevo Usuario
 */
app.post('/', (req, res, next) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    })

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        })
    })

});
/*
 * Borrar un Usuario por el ID
 */
app.delete('/:id', [mdAutentificacion.verificaToken, mdAutentificacion.verificaAdmin], (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, ususarioEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Eliminar Usuario',
                errors: err
            });
        }
        if (!ususarioEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al Eliminar Usuario',
                errors: { message: 'Error al Eliminar Usuario con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: ususarioEliminado
        })
    })
});
module.exports = app;