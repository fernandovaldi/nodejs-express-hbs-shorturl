const { URL } = require('url')
const urlValidar = (req, res, next) =>{
    try {
        const { origin } = req.body;
        const urlFrontend = new URL(origin);
        if (urlFrontend.origin !== "null"){
            if(
                urlFrontend.protocol === "http:" ||
                urlFrontend.protocol === "https:"
              ){
                  return next();
              }
              throw new Error("Tiene que ser http:// o https://")
        }
        throw new Error('Url no válida');
            
    } catch (error) {
        if(error.message === "Invalid URL"){
            req.flash("mensajes", [{msg:"URL no válida"}])
        }else{
            req.flash("mensajes", [{msg:error.message}])
        }
        return res.redirect("/");
    }
}

module.exports = urlValidar;