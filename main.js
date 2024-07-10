//############################################# IMPORTS:
import express from "express"
import ejs from "ejs"
import mongoose from "mongoose" 
import session from "express-session"
import passport from "passport"
import flash from "express-flash"
import methodOverride from "method-override"
import 'dotenv/config'
// ********** My imports:
import admin_routes from "./routes/admin.js"
import employee_routes from "./routes/employee.js"
import autho from "./controllers/autho.js"
autho()






//############################################# SETUP:
const app = express()
const port = 3000
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
const conn = mongoose.connect(process.env.DB_URL)


// ********** My middleware:
app.use((req, res, next) => {
    let whoislogedin = (req.session.passport == undefined)?false:req.session.passport.user.role;
    res.locals.params = process.env
    res.locals.whoislogedin = whoislogedin;
    next();
})
app.use('/admin', admin_routes)
app.use('/employee', employee_routes)








//############################################# ROUTES:
app.get('/', (req, res) => {
    res.render("index")
})






app.delete('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
    })
    res.redirect('/')
})

app.listen(port, () => {
    console.log(`Example app listening on port http://127.0.0.1:${port}`)
})
