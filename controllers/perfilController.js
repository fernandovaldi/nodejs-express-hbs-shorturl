const formidable = require('formidable');
const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');
const User = require('../models/User');

module.exports.formPerfil = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);
        return res.render("perfil", {user: req.user, imagen: user.imagen});

    } catch (error) {
        req.flash("mensajes", [{msg: 'Error al leer el usuario'}]);
        return res.redirect("/perfil");
    }
}

module.exports.editarFotoPerfil = async (req, res) => {
    
    const form = new formidable.IncomingForm();
    form.MaxFileSize = 5 * 1024 * 1024 //50MB

    form.parse(req, async(err, fields, files) => {

        try {
            if(err){
                throw new Error("Falló la subida de imagen");
            }

            // console.log(files);
            // validaciones de imagenes perfil
            const file = files.myFile

            if(file.originalFilename === ''){
                throw new Error('Agrega una imagen primero');
            }

            const imageTypes = ['image/jpeg', 'image/png'];

            if (!imageTypes.includes(file.mimetype)){
                throw new Error('Formatos admitidos .jpg y .png');
            }

            if(file.size > 50 * 1024 * 1024){
                throw new Error('La imagen debe ser menor a 50MB');
            }
            // guardar en servidor
            const extension = file.mimetype.split("/")[1];
            const dirFile = path.join(__dirname, `../public/img/perfiles/${req.user.id}.${extension}`);
            // console.log(dirFile);

            fs.renameSync(file.filepath, dirFile);

            const image = await Jimp.read(dirFile);
            image.resize(200, 200).quality(90).writeAsync(dirFile);

            // guardar nombre de imagen referencia en la BD
            const user = await User.findById(req.user.id);
            user.imagen = `${req.user.id}.${extension}`;
            await user.save();


            req.flash("mensajes", [{msg: "Imagen subida con éxito"}]);

        } catch (error) {
            console.log(error);
            req.flash("mensajes", [{msg: error.message}]);
        } finally {
            return res.redirect("/perfil");
        }

    });

};