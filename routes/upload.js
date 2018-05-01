var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una Imagen' }
        });
    }

    //Obtener Nombre del Archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1].toLowerCase();

    //Solo Estas extensionas acecptadas
    var extensionesValidas = ['png', 'jpg', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensiones Validas',
            errors: { message: 'Las Extensiones validas son: ' + extensionesValidas.join(', ') }
        });
    }
    // Nombre del Archivo personalizados
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    //Movel el achivo del temporal al path
    var path = `./uploads/${tipo}/${nombreArchivo}`
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover achivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


    })


});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo == 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            var pathViejo = './uploads/usuarios/' + usuario.img;
            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuarioActualizado: usuarioActualizado
                });
            });
        })
    }
    if (tipo == 'medicos') {
        Medico.findById(id, (err, medico) => {
            var pathViejo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Medico actualizado',
                    medicoActualizado: medicoActualizado
                });
            })
        })

    }
    if (tipo == 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al encontrar Hospital',
                    errors: err
                });
            }
            var pathViejo = './uploads/hospital/' + hospital.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Hospital actualizado',
                    hospitalActualizado: hospitalActualizado
                });
            })
        })

    }
}
module.exports = app;