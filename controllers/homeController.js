const Url = require('../models/Url')
const { nanoid } = require('nanoid');

const leerUrls = async (req, res) => {
    try {
        const urls = await Url.find({user: req.user.id}).lean()
        return res.render('home', {urls: urls});
    } catch (error) {
        // console.log(error)
        // res.send("fallo algo")
        req.flash("mensajes", [{msg:error.message}]);
        return res.redirect("/");
    }
}

const agregarUrl = async(req, res) => {

    const {origin} = req.body

    try {
        const url = new Url({origin: origin, shortURL: nanoid(8), user: req.user.id});
        await url.save();
        req.flash("mensajes", [{msg: "ShortURL generada con éxito"}]);
        return res.redirect('/');
    } catch (error) {
        req.flash("mensajes", [{msg:error.message}]);
        return res.redirect("/");
    }

};

const eliminarUrl = async(req, res) => {
    const {id} = req.params;

    try {

        // await Url.findByIdAndDelete(id);
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)){
            throw new Error('Esa URL no es tuya');
        }
        await url.remove()
        req.flash("mensajes", [{msg: "URL eliminada"}]);
        return res.redirect('/');

    } catch (error) {
        req.flash("mensajes", [{msg:error.message}]);
        return res.redirect("/");
    }
}

const editarUrlForm = async(req, res) => {
    const {id} = req.params
    try{
        const url = await Url.findById(id).lean();
        if(!url.user.equals(req.user.id)){
            throw new Error('Esa URL no es tuya');
        }
        return res.render('home', {url});
    }catch(error){
        req.flash("mensajes", [{msg:error.message}]);
        return res.redirect("/");
    }
}

const editarUrl = async (req, res) => {
    const {id} = req.params;
    const {origin} = req.body;

    try {
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)){
            throw new Error('Esa URL no es tuya');
        }
        await url.updateOne({origin})
        req.flash("mensajes", [{msg: "URL editada"}])
    //    await Url.findByIdAndUpdate(id, {origin: origin});
       return res.redirect('/');
    } catch (error) {
        req.flash("mensajes", [{msg:error.message}]);
        return res.redirect("/");
    }
}

const redireccionamiento = async(req, res) => {
    const {shortUrl} = req.params
    try{
        const urlDB = await Url.findOne({shortURL: shortUrl})
        return res.redirect(urlDB.origin)

    } catch(error) {
        req.flash("mensajes", [{msg: "No existe esa short URL"}]);
        return res.redirect("/");
    }
}

module.exports = {
    leerUrls,
    agregarUrl,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    redireccionamiento
}