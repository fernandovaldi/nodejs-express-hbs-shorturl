const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const flash = require('connect-flash');
const passport = require('passport');
const { create } = require('express-handlebars');
const csrf = require('csurf');
const User = require('./models/User');
require('dotenv').config();
const clientDB = require('./database/db');

const app = express();

const corsOptions = {
    credentials: true,
    origin: process.env.PATHHEROKU || '*',
    methods: ['GET', 'POST']
}

app.use(cors())

// express session - sesiones
app.use(
    session({
        secret: process.env.SECRETSESSION,
        resave: false,
        saveUninitialized: false,
        name: 'session-user',
        store: MongoStore.create({
            clientPromise: clientDB,
            dbName: process.env.DBNAME
        }),
        cookie: { secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 }
    })
);

// connect flash - se usa para enviar alertas al usuario, dura una vez
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, {id: user._id, userName: user.userName})); //req.user
passport.deserializeUser( async (user, done) => {
    const userDB = await User.findById(user.id);
    return done(null, {id: userDB._id, userName: userDB.userName})
});
// configurar handlebars
const hbs = create({
    extname: ".hbs",
    partialsDir: ["views/components"]
})
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

// middlewares
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended: true}));
    // de seguridad - pasa un token para asegurar que la información viene de la app, evitando inyecciones
app.use(csrf());
    // evitar inyecciones maliciosas en la DB
app.use(mongoSanitize());

    //mi propio middleware, para que se pase el token de forma general, guarda en variables globales
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.mensajes = req.flash("mensajes");
    next();
});


app.use("/", require('./routes/home'));
app.use("/auth", require('./routes/auth'));
app.get('/mensaje-flash', (req, res) => {
    res.json(req.flash('mensaje'));
});

app.get('/crear-mensaje', (req, res) => {
    req.flash("mensaje", "Esta sesión el volátil, una vez");
    res.redirect("/mensaje-flash");
});

app.get("/ruta-protegida", (req, res) => {
    res.json(req.session.usuario || "Sin sesión de usuario");
});

app.get("/crear-sesion", (req, res) => {
    req.session.usuario = "fernando";
    res.redirect("/ruta-protegida");
});

app.get("/destruir-sesion", (req, res) => {
    req.session.destroy();
    res.redirect("/ruta-protegida");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("servidor corriendo... en puerto: " + PORT));
