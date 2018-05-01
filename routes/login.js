var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();

var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

/**
 * Autentificacion Google
 **/
const { OAuth2Client } = require('google-auth-library');
var CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
app.post('/google', async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no Valido'
            });
        })

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al Buscar Usuario',
                    errors: err
                });
            }
            if (usuarioDB) {
                if (usuarioDB.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe de usar su autentificacion Normal',
                        errors: err
                    });
                } else {
                    var token = jwt.sign({ Usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 Horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB.id
                    });
                }
            } else {
                // Usuario no existe
                var usuario = new Usuario();
                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true;
                usuario.password = ':)';
                usuario.save((err, usuarioDB) => {
                    var token = jwt.sign({ Usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 Horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB.id
                    });
                })
            }
        })
        /* return res.status(200).json({
            ok: true,
            googleUser: googleUser
        }) */
});

/**
 * Autentificacion Normal
 **/
app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, UsuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Buscar Usuario',
                errors: err
            });
        }

        if (!UsuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, UsuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - password',
                errors: err
            });
        }
        UsuarioDB.password = ':)';
        //Crear un Token
        var token = jwt.sign({ Usuario: UsuarioDB }, SEED, { expiresIn: 14400 }); // 4 Horas

        res.status(200).json({
            ok: true,
            usuario: UsuarioDB,
            token: token,
            id: UsuarioDB.id
        });
    })
});

module.exports = app;