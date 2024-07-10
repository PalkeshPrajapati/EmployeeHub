import LocalStrategy from "passport-local"
import passport from "passport";
import { Employee } from "../modules/Employee.js"
import bcrypt from "bcrypt"
const admin_env = {"admin_id": process.env.ADMIN_ID, "admin_pass": process.env.ADMIN_PASS};

function autho() {
    // ############################################# function for admin autho
    const authenticateAdmin = async (admin_id, admin_pass, done) => {

        console.log("admin: post: ", admin_id, admin_pass)
        console.log("admin: env: ", admin_env)

        // if admin name is wrong
        if (admin_env.admin_id != admin_id) {
            console.log("in admin: name is wrong")
            return done(null, false, { message: 'Invalid Admin Name' })
        }
        
        // comparing and checking password
        try {
            if (admin_pass == admin_env.admin_pass) {
                return done(null, {data: admin_env, who: "admin"})
            } else {
                console.log("in admin: pass is wrong")
                return done(null, false, { message: 'Incorrrect Password' })
            }
        } catch (e) {
            return done(e)
        }
    }

    // ############################################# function for user autho
    const authenticateEmployee = async (employee_id, employee_pass, done) => {

        console.log("employee: post: ", employee_id, employee_pass)
        // Important changee in data
        employee_id = employee_id.toLowerCase();

        try {
            // fatching data form database
            let employee = await Employee.findOne({vender_id: employee_id})
            console.log("employee: DB: ", employee)

            // If user not exist
            if (employee == null) {
                console.log("in employee: name is wrong")
                return done(null, false, { message: 'Invalid Employee Name' })
            }
            
            // comparing and checking password
            let ismatch = await bcrypt.compare(employee_pass, employee.password);
            if (ismatch) {
                return done(null, {data: employee, who: "employee"})
            } else {
                console.log("in employee: pass is wrong")
                return done(null, false, { message: 'Incorrrect Password' })
            }

        } catch (e) {
            return done(e)
        }
    }



    
    passport.use('admin-local', new LocalStrategy({ usernameField: 'admin_id', passwordField: "admin_pass"}, authenticateAdmin))
    passport.use('employee-local', new LocalStrategy({ usernameField: 'employee_id', passwordField: "employee_pass"}, authenticateEmployee))



    passport.serializeUser((user, done) => {
        if (user.who == "admin"){
            console.log("admin serializer: ", user)
            return done(null, {id: user.data.admin_id, role: "admin"})
        }
        else if(user.who == "employee"){
            console.log("employee serializer: ", user)
            return done(null, {id: user.data.vender_id, role: "employee"})
        }
    })
    
    passport.deserializeUser(async (user, done) => {
        if (user.role == "admin"){
            console.log("admin deserializer: ", user)
            return done(null, admin_env)
        }
        else if(user.role == "employee"){
            console.log("employee deserializer: ", user)
            Employee.findOne({vender_id: user.id})
            .then((data) => {
                return done(null, data)
            })
            .catch((err) => {
                return done(err, false, { message: "User not found!!"})
            })
        }
    })
}

export default autho;