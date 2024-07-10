//############################################# IMPORTS:
import express from "express"
const router = express.Router()
import passport from "passport"
import bcrypt from "bcrypt"
import { Employee } from "../modules/Employee.js"
import { Salary } from "../modules/Salary.js"



//############################################# SETUP:
router.use(express.static('public'))




//############################################# ROUTES:
// ********** home routes: 
const is_date_correct = (date) => {
    let date_pattern = /\d{4}-(0|1)\d/
    let result = date.match(date_pattern)
    if(result){
        return true
    }
    else{
        return false
    }
}
router.get('/', checkAuthenticated, (req, res) => {
    res.redirect("/employee/dashboard")
})
router.get('/dashboard', checkAuthenticated, async (req, res) => {
    let employee = req.user;
    let employee_session = req.session.passport;
    // console.log("dashboard employee: req.user: ", employee)
    // console.log("dashboard employee: req.session.passport: ", employee_session)

    let from_month = req.query.from;
    let to_month = req.query.to;
    let salaries = [];
    try {
        if (from_month && is_date_correct(from_month) && to_month && is_date_correct(to_month)){
            let fromDate = { year: from_month.slice(0, 4), month: from_month.slice(5, 7) };
            let toDate = { year: to_month.slice(0, 4), month: to_month.slice(5, 7) };

            salaries = await Salary.find({employee_id: employee._id, $and: [
                { $or: [{ year: { $gt: fromDate.year } }, { year: fromDate.year, month: { $gte: fromDate.month } }] },
                { $or: [{ year: { $lt: toDate.year } }, { year: toDate.year, month: { $lte: toDate.month } }] }
            ]})

        }
        else if (from_month && is_date_correct(from_month)){
            let fromDate = { year: from_month.slice(0, 4), month: from_month.slice(5, 7) };

            salaries = await Salary.find({employee_id: employee._id, $or: [
                { year: { $gt: fromDate.year } }, 
                { year: fromDate.year, month: { $gte: fromDate.month } }
            ]})
        }
        else if (to_month && is_date_correct(to_month)){
            let toDate = { year: to_month.slice(0, 4), month: to_month.slice(5, 7) };

            salaries = await Salary.find({employee_id: employee._id, $or: [
                { year: { $lt: toDate.year } }, 
                { year: toDate.year, month: { $lte: toDate.month } }
            ]})
        }
        else {
            salaries = await Salary.find({ employee_id: employee._id })
        }
    }
    catch(error){
        console.log("some error: ", error)
        res.render("employee_dashboard", {employee, salaries, error})
        return;
    }
    res.render("employee_dashboard", {employee, salaries, error: false})
})




// ************** Edit Employee:
router.get('/edit-info', checkAuthenticated, async (req, res) => {
    // let vender_id = req.session.passport.user.id;
    let employee = req.user
    res.render("edit_info", {employee})
})
router.post('/edit-info', checkAuthenticated, async (req, res) => {
    console.log("WORKING>>>>>>>>")
    let vender_id = req.session.passport.user.id;
    let employee
    try{
        let {employee_name, father_name, phone_no, email, aadharcard_no, pancard_no, dob, doj, gender, address, qualification, branch} = req.body;
        employee = await Employee.findOneAndUpdate({vender_id: vender_id}, {employee_name, father_name, phone_no, email, aadharcard_no, pancard_no, dob, doj, gender, address, qualification, branch}, {new: true})
    }
    catch (e){
        console.log("Some Error: ", e)
        res.redirect("/employee/dashboard")
        return;
    }
    
    res.render("edit_info", {employee, success: "Information Edited Successfully!!"})
})




// ************** Change Password:
router.get('/change-password', checkAuthenticated, async (req, res) => {
    res.render("change_password")
})
router.post('/change-password', checkAuthenticated, async (req, res) => {
    let current_hash_pass = req.user.password;
    let vender_id = req.user.vender_id;
    let {current_pass, new_pass, confirm_pass} = req.body;
    let isMatch = await bcrypt.compare(current_pass, current_hash_pass)
    if (isMatch){
        if (new_pass == confirm_pass){
            let new_hash_password = await bcrypt.hash(new_pass, 10);
            await Employee.findOneAndUpdate({vender_id: vender_id}, {password: new_hash_password})
            res.send(res.render("change_password", {success: "Password Updated Successfully!!"}))
            return;
        }
        else{
            res.render("change_password", {error: "New password and Confirm password not match!! Please try again!!"})
            return;
        }
    }
    else{
        res.render("change_password", {error: "Your current password is wrong!! Please try again!!"})
    }
})








// ********** login routes: 
router.get('/login', checkNotAuthenticated, (req, res) => {
    // let messages = req.flash();
    // console.log("in login get: ", req.locals.messages)
    res.render("employee_login")
})
router.post('/login', checkNotAuthenticated, passport.authenticate('employee-local', {
    successRedirect: '/employee/dashboard',
    failureRedirect: '/employee/login',
    failureFlash: true
}))

// ############################################# important function
function checkAuthenticated(req, res, next) {
    if (req.session.passport?.user.role == "employee") {
        return next()
    }
    res.redirect('/employee/login')
}
function checkNotAuthenticated(req, res, next) {
    if (req.session.passport?.user.role == "admin") {
        return res.redirect('/admin/dashboard')
    }
    else if(req.session.passport?.user.role == "employee"){
        return res.redirect('/employee/dashboard')
    }
    next()
}
export default router;