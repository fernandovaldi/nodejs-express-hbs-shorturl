const User = require('../models/User');
const { validationResult } = require('express-validator');
const { nanoid } = require('nanoid');
const nodemailer = require('nodemailer');
require('dotenv').config();

const registerForm = (req, res) => {
    res.render('register');
    // {mensajes: req.flash("mensajes")
    // csrfToken: req.csrfToken()}
}

const registerUser = async (req, res) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array());
        return res.redirect("/auth/register");
    }

    const {userName, email, password} = req.body;

    try {
       let user = await User.findOne({email: email});
       if(user) throw new Error('Ya existe el usuario');

       user = new User({userName, email, password, tokenConfirm: nanoid(6)});
        await user.save();
        // enviando email de confirmación con nodemailer 
            // (emulado en esta app de prueba con mailtrap)
        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.USEREMAIL,
              pass: process.env.PASSEMAIL
            }
          });
        
          await transport.sendMail({
            from: '"Fernando Valdi 👻" <valdi@code.com>',
            to: user.email,
            subject: "verifique cuenta de correo",
            html: `<a href="${process.env.PATHHEROKU || 'http://localhost:5000'}/auth/confirmar/${user.tokenConfirm}">verificar cuenta aquí</a>`,
        });

        req.flash("mensajes", [{msg: "Cuenta creada, revisa tu email para validarla"}]);
        return res.redirect('/auth/login');

    } catch (error) {
        // return res.json({error: error.message});
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/auth/register');
    }
    
}

const confirmarCuenta = async (req, res) => {
    const {token} = req.params;
    
    try {
        const user = await User.findOne({tokenConfirm : token});

        if(!user) throw new Error('No existe este usuario')

        user.cuentaConfirmada = true;
        user.tokenConfirm = null;

        user.save();
        req.flash("mensajes", [{msg: "Cuenta verificada, ya puedes iniciar sesión"}])
        return res.redirect('/auth/login');
    } catch (error) {
        return res.json({error: error.message});
    }
}

const loginForm = (req, res) => {
    return res.render('login');
    // {mensajes: req.flash("mensajes")}
}

const loginUser = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array());
        return res.redirect('/auth/login');
    }

    const {email, password} = req.body;

    try {
        
        const user = await User.findOne({email});
        if(!user) throw new Error('El usuario no está registrado');

        if(!user.cuentaConfirmada) throw new Error('Confirma antes la cuenta en tu email');
        
        if(!await user.comparePassword(password)) throw new Error('Contraseña incorrecta');
        
        // creando la sesión de usuario con PASSPORT
        req.login(user, function(err){
            if(err) throw new Error('Error al crear la sesión');
            return res.redirect('/');
        });

    } catch (error) {
        // console.log(error);
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/auth/login");
        // return res.send(error.message);
    }
}

const logout = (req, res) => {
    req.logout();
    res.redirect('/auth/login');
}

module.exports = {
    registerForm,
    registerUser,
    confirmarCuenta,
    loginForm,
    loginUser,
    logout
}