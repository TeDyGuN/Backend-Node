var express = require('express');
var app = express();

var Medico = require('../models/medico');

var mdAutentificacion = require('../middlewares/autenticacion');

/*
 * Obtener Medicos
 */
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error cargando Medicos',
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    })
                })

            }
        )
});
/*
 * Actualizar Medicos
 */
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Buscar Medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Medico no existe',
                errors: { mensaje: 'No existe un Medico con ese ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar Medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: medicoGuardado
            })
        })
    })
});
/**
 * Crear un Nuevo Medico
 **/
app.post('/', mdAutentificacion.verificaToken, (req, res, next) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: null,
        usuario: req.usuario._id,
        hospital: body.hospital
    })
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Medico',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        })
    })
});
/**
 * Eliminar Medico
 **/
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Eliminar Medico',
                errors: err
            });
        }
        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al Eliminar Medico',
                errors: { message: 'Error al Eliminar Medico con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoEliminado
        })
    })
});
module.exports = app;