var express = require('express');
var app = express();

const fs = require('fs');
const path = require('path');
// Rutas
app.get('/:tipo/:img', (req, res) => {
    var img = req.params.img;
    var tipo = req.params.tipo;
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${img}`);
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImagen);
    }
});

module.exports = app;