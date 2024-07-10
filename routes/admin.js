//############################################# IMPORTS:
import express from "express"
const router = express.Router()
import passport from "passport"
import bcrypt from "bcrypt"
import { Employee } from "../modules/Employee.js"
import { Salary } from "../modules/Salary.js"



//############################################# SETUP:

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


//############################################# ROUTES:
// ********** home routes: 
router.get('/', checkAuthenticated, (req, res) => {
    res.redirect("/admin/dashboard")
})
router.get('/dashboard', checkAuthenticated, (req, res) => {
    console.log("dashboard admin: req.user: ", req.user)
    console.log("dashboard admin: req.session.passport: ", req.session.passport)
    res.render("admin_dashboard", { "name": (req.user.admin_id).toUpperCase() })
})







// ********** add-employee routes: 
router.get('/add-employee', checkAuthenticated, (req, res) => {
    res.render("add_employee")
})
router.post('/add-employee', checkAuthenticated, async (req, res) => {
    let { vender_id, employee_name, father_name, phone_no, email, aadharcard_no, pancard_no, dob, doj, gender, address, qualification, branch, password, confirmpassword } = req.body;
    // Importnant change in data
    vender_id = vender_id.toLowerCase();

    // Checking that pass and confirm pass match or not
    if (password != confirmpassword) {
        // req.flash('passNotMatch', 'Password not match!!'); // flash ki value session me store hoti he
        // res.render("add_employee", {passNotMatch: flash("passNotMatch")}) // flash ki value ko ek bar hi access kiya ja skta he 
        let error = "Password not match!!"
        res.render("add_employee", { error })
        return;
    }

    // Checking that user already exist or not
    try {
        let employee = await Employee.findOne({ vender_id: vender_id })
        if (employee != null) {
            res.render("add_employee", { error: `This user already exists. VenderId: ${employee.vender_id}!!` })
            return;
        }
    } catch (error) {
        res.render("add_employee", { error: "Some error while finding this user(dev)" })
        return;
    }

    //Hashing password
    let hashPassword;
    try {
        hashPassword = await bcrypt.hash(password, 10);
    } catch (error) {
        res.render("add_employee", { error: "Error while hashing password (dev)" })
        return;
    }

    // creating and saving the new employee
    try {
        let employee = new Employee({ vender_id, employee_name, father_name, phone_no, email, aadharcard_no, pancard_no, dob, doj, gender, address, qualification, branch, password: hashPassword })
        await employee.save();
    } catch (error) {
        if (error.name === 'ValidationError') {
            // errorMessages = Object.values(error.errors).map(err => err.message); // it will add all error message to the errorMessages variabl in an array
            let error = "Invalid credentials please check the values again!!"
            res.render("add_employee", { error })
        } else {
            error = "Some Error while creating new employee!!"
            res.render("add_employee", { error })
        }
        return;
    }

    res.render("add_employee", { success: "Employee add successfully!!" })
})








// ********* view-all-employees routes: 
router.get('/view-all-employees', checkAuthenticated, async (req, res) => {
    let vender_id = req.query.id
    console.log("vender_id: ", vender_id)
    if (vender_id) {
        let from_month = req.query.from;
        let to_month = req.query.to;
        let salaries = [];
        let employee;
        try{
            employee = await Employee.findOne({vender_id: vender_id})
            if (employee == null){
                res.redirect("/admin/view-all-employees")
                return;
            }
        }
        catch(e){
            console.log("Some error: ", e)
            res.redirect("/admin/view-all-employees")
            return;
        }
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
        catch (error) {
            console.log("some error: ", error)
            res.render("view_one_employee", { employee, salaries, error })
            return;
        }
        res.render("view_one_employee", { employee, salaries, error: false })
    }
    else {
        let AllEmployeeInfos = await Employee.find()
        res.render("view_all_employees", { AllEmployeeInfos })
    }
})







// ********** add-salary:
router.get('/add-salary', checkAuthenticated, async (req, res) => {
    const today = new Date();
    const yyyy_mm = today.toISOString().slice(0, 7);
    res.redirect(`add-salary/${yyyy_mm}`)
})
router.get('/add-salary/:date', checkAuthenticated, async (req, res) => {
    // important variable 
    let date = req.params.date
    let year = date.slice(0, 4)
    let month = date.slice(5, 7)

    let allEmployees = await Employee.find({}, { _id: 1, employee_name: 1, vender_id: 1 });

    let promises = allEmployees.map(async (employee) => {
        let issubmitted = true;
        let m = month;
        let y = year;
        for (let i = 0; i < 5; i++) {
            if (i >= 1) {
                issubmitted = false;
            }
            let salary = await Salary.findOne({ employee_id: employee._id, month: m, year: y });
            if (salary == null) {
                if (i >= 4) {
                    return ({
                        employee_name: employee.employee_name,
                        vender_id: employee.vender_id,
                        pay_basic: 0,
                        grade_pay: 0,
                        dearness_allowance: 0,
                        hra_earning: 0,
                        nps_departmentshare: 0,
                        income_tax: 0,
                        professional_tax: 0,
                        hra_deduction: 0,
                        other_recovery: 0,
                        nps_employeeshare: 0,
                        issubmitted: issubmitted
                    });
                } else {
                    m -= 1;
                    if (m <= 0) {
                        m = 12;
                        y -= 1;
                    }
                    continue;
                }
            }
            return ({
                employee_name: employee.employee_name,
                vender_id: employee.vender_id,
                pay_basic: salary.pay_basic,
                grade_pay: salary.grade_pay,
                dearness_allowance: salary.dearness_allowance,
                hra_earning: salary.hra_earning,
                nps_departmentshare: salary.nps_departmentshare,
                income_tax: salary.income_tax,
                professional_tax: salary.professional_tax,
                hra_deduction: salary.hra_deduction,
                other_recovery: salary.other_recovery,
                nps_employeeshare: salary.nps_employeeshare,
                issubmitted: issubmitted
            });
        }
    });

    Promise.all(promises)
        .then((allEmployeeSalaries) => {
            let sameSalaryData = {
                isAnySalryIsSubmitted: false,
                same_da: null,
                same_nps_ds: null,
                same_nps_es: null
            }
            if (allEmployeeSalaries.length > 0) {
                sameSalaryData = {
                    isAnySalryIsSubmitted: false,
                    same_da: allEmployeeSalaries[0].dearness_allowance,
                    same_nps_ds: allEmployeeSalaries[0].nps_departmentshare,
                    same_nps_es: allEmployeeSalaries[0].nps_employeeshare
                }
                for (let salary of allEmployeeSalaries) {
                    if (salary.issubmitted) {
                        sameSalaryData.isAnySalryIsSubmitted = true;
                    }
                    if (salary.dearness_allowance != sameSalaryData.same_da) {
                        sameSalaryData.same_da = null;
                    }
                    if (salary.nps_departmentshare != sameSalaryData.same_nps_ds) {
                        sameSalaryData.same_nps_ds = null;
                    }
                    if (salary.nps_employeeshare != sameSalaryData.same_nps_es) {
                        sameSalaryData.same_nps_es = null;
                    }
                }
            }
            res.render("add_salary", { allEmployeeSalaries: allEmployeeSalaries, error: false, sameSalaryData: sameSalaryData })
        })
        .catch((err) => {
            console.error("Some error:", err);
            res.render("add_salary", {
                error: err, allEmployeeSalaries: [], sameSalaryData: {
                    isAnySalryIsSubmitted: false,
                    same_da: null,
                    same_nps_ds: null,
                    same_nps_es: null
                }
            })
        });

})
router.post('/add-salary/:date', checkAuthenticated, express.json(), async (req, res) => {
    let date = req.params.date
    let year = date.slice(0, 4)
    let month = date.slice(5, 7)

    try {
        let salaryDetail = req.body;
        let empId = await Employee.findOne({ vender_id: salaryDetail.vender_id }, { _id: 1 });
        let salary = new Salary({
            employee_id: empId._id,
            month: month,
            year: year,
            vender_id: salaryDetail.vender_id,
            pay_basic: salaryDetail.pay_basic,
            grade_pay: salaryDetail.grade_pay,
            dearness_allowance: salaryDetail.dearness_allowance,
            hra_earning: salaryDetail.hra_earning,
            nps_departmentshare: salaryDetail.nps_departmentshare,
            income_tax: salaryDetail.income_tax,
            professional_tax: salaryDetail.professional_tax,
            hra_deduction: salaryDetail.hra_deduction,
            other_recovery: salaryDetail.other_recovery,
            nps_employeeshare: salaryDetail.nps_employeeshare,
        })
        console.log(salary)
        await salary.save()
    }
    catch (error) {
        res.send({ "error": error.message })
        return;
    }
    res.send({ "redirect": true })
})
router.delete('/add-salary/:date', checkAuthenticated, express.json(), async (req, res) => {
    let date = req.params.date
    let year = date.slice(0, 4)
    let month = date.slice(5, 7)
    let empDetail = req.body;
    let empId = await Employee.findOne({ vender_id: empDetail.vender_id }, { _id: 1 })

    try {
        await Salary.deleteOne({ employee_id: empId._id, month: month, year: year })
    }
    catch (error) {
        res.send({ "error": error.message })
        return;
    }
    res.send({ "redirect": true })
})







// ********** view-salary:
router.get('/view-salary-monthly', async (req, res) => {
    const today = new Date();
    const yyyy_mm = today.toISOString().slice(0, 7);
    res.redirect(`view-salary-monthly/${yyyy_mm}`)
})
router.get('/view-salary-monthly/:date', checkAuthenticated, async (req, res) => {
    let date = req.params.date
    let year = date.slice(0, 4)
    let month = date.slice(5, 7)

    let allEmployeeSalaries = [];
    let sameSalaryData = {
        same_da: null,
        same_nps_ds: null,
        same_nps_es: null
    }

    try {
        let allEmployees = await Employee.find({}, { vender_id: 1, employee_name: 1, _id: 1 })
        let allSalaries = await Salary.find({ month: month, year: year })
        console.log("allEmployee: ", allEmployees)
        console.log("allSalaries: ", allSalaries)
        allEmployees.forEach((employee) => {
            let matchingSalary = allSalaries.find(salary => salary.employee_id.toString() === employee._id.toString());
            if (matchingSalary) {
                allEmployeeSalaries.push({
                    vender_id: employee.vender_id,
                    employee_name: employee.employee_name,
                    issubmitted: true,
                    pay_basic: matchingSalary.pay_basic,
                    grade_pay: matchingSalary.grade_pay,
                    dearness_allowance: matchingSalary.dearness_allowance,
                    hra_earning: matchingSalary.hra_earning,
                    nps_departmentshare: matchingSalary.nps_departmentshare,
                    income_tax: matchingSalary.income_tax,
                    professional_tax: matchingSalary.professional_tax,
                    hra_deduction: matchingSalary.hra_deduction,
                    other_recovery: matchingSalary.other_recovery,
                    nps_employeeshare: matchingSalary.nps_employeeshare,
                    date_created: matchingSalary.date_created
                });
            } else {
                allEmployeeSalaries.push({
                    vender_id: employee.vender_id,
                    employee_name: employee.employee_name,
                    issubmitted: false
                });
            }
        })

        if (allEmployeeSalaries.length > 0) {
            sameSalaryData = {
                same_da: allEmployeeSalaries[0].dearness_allowance,
                same_nps_ds: allEmployeeSalaries[0].nps_departmentshare,
                same_nps_es: allEmployeeSalaries[0].nps_employeeshare
            }
            for (let salary of allEmployeeSalaries) {
                if (salary.dearness_allowance != sameSalaryData.same_da) {
                    sameSalaryData.same_da = null;
                }
                if (salary.nps_departmentshare != sameSalaryData.same_nps_ds) {
                    sameSalaryData.same_nps_ds = null;
                }
                if (salary.nps_employeeshare != sameSalaryData.same_nps_es) {
                    sameSalaryData.same_nps_es = null;
                }
            }
        }

        console.log("allEmployeeSalaries", allEmployeeSalaries)
        console.log("sameSalary", sameSalaryData)
    }
    catch (error) {
        res.render("view_salary_monthly", { allEmployeeSalaries: allEmployeeSalaries, error: error, sameSalaryData: sameSalaryData })
        return
    }
    res.render("view_salary_monthly", { allEmployeeSalaries: allEmployeeSalaries, error: false, sameSalaryData: sameSalaryData })
})





router.get('/edit-employee', checkAuthenticated, async (req, res) => {
    let vender_id = req.query.id;
    if(vender_id){
        let employee
        try{
            employee = await Employee.findOne({vender_id: vender_id})
            if (employee == null){
                res.redirect("/admin/dashboard")
                return;
            }
        }
        catch(e){
            console.log("Some error: ", e)
            res.redirect("/admin/dashboard")
            return;
        }
        res.render("edit_employee", {employee})
    }
    else{
        res.redirect("/admin/dashboard")
    }
})
router.post('/edit-employee', checkAuthenticated, async (req, res) => {
    let vender_id = req.query.id;
    let employee
    if(vender_id){
        try{
            let {employee_name, father_name, phone_no, email, aadharcard_no, pancard_no, dob, doj, gender, address, qualification, branch} = req.body;
            employee = await Employee.findOneAndUpdate({vender_id: vender_id}, {employee_name, father_name, phone_no, email, aadharcard_no, pancard_no, dob, doj, gender, address, qualification, branch}, {new: true})
            if (employee == null){
                res.redirect("/admin/dashboard")
                return;
            }
        }
        catch (e){
            res.redirect("/admin/dashboard")
            return;
        }
        
        res.render("edit_employee", {employee, success: "Information Edited Successfully!!"})
    }
    else{
        res.render("/admin/dashboard")
    }
})
router.delete('/delete-employee/:id', checkAuthenticated, async (req, res) => {
    let vender_id = req.params.id;
    if(vender_id){
        let employee
        try{
            employee = await Employee.findOne({vender_id: vender_id})
            if (employee == null){
                res.send({id: vender_id, Fail: `Some error: ${e}`})
                return;
            }
        }
        catch(e){
            console.log("Some error: ", e)
            res.send({id: vender_id, Fail: `Some error: ${e}`})
            return;
        }
        try{
            await Salary.deleteMany({employee_id: employee._id})
            await Employee.deleteOne({vender_id: vender_id})
            res.send({id: vender_id, success: "Employee Deleted Successfully"})  
            return;
        }
        catch (e){
            res.send({id: vender_id, Fail: `Some error: ${e}`})  
            return;
        }
    }
    else{
        res.redirect("/admin/dashboard")
    }
})










// ********** login routes: 
router.get('/login', checkNotAuthenticated, (req, res) => {
    // let messages = req.flash();
    // console.log("in login get: ", req.locals.messages)
    res.render("admin_login")
})
router.post('/login', checkNotAuthenticated, passport.authenticate('admin-local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login',
    failureFlash: true
}))

// ############################################# important function
function checkAuthenticated(req, res, next) {
    if (req.session.passport?.user.role == "admin") {
        return next()
    }
    res.redirect('/admin/login')
}
function checkNotAuthenticated(req, res, next) {
    if (req.session.passport?.user.role == "admin") {
        return res.redirect('/admin/dashboard')
    }
    else if (req.session.passport?.user.role == "employee") {
        return res.redirect('/employee/dashboard')
    }
    next()
}
export default router;