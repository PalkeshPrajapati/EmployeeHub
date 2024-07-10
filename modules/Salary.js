import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    month: {
        type: Number,
        required: true,
        min: 1, 
        max: 12,
        enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    year: {
        type: Number,
        required: true,
    },
    pay_basic: {
        type: Number,
        required: true,
    },
    grade_pay: {
        type: Number,
        required: true,
    },
    dearness_allowance: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
    hra_earning: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
    nps_departmentshare: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
    income_tax: {
        type: Number,
        required: true,
    },
    professional_tax: {
        type: Number,
        required: true,
    },
    hra_deduction: {
        type: Number,
        required: true,
    },
    other_recovery: {
        type: Number,
        required: true,
    },
    nps_employeeshare: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
    date_created:{
        type: Date, 
        required: true, 
        trim: true,
        default: Date.now()
    }
});





salarySchema.index({ employee_id: 1, month: 1, year: 1 }, { unique: true });




// Virtual fields for calculated values (remove unnecessary ones)
salarySchema.virtual('dearnessAllowanceCalculated').get(function () {
    return Math.round(((100 + this.dearness_allowance)/100) * (this.pay_basic + this.grade_pay));
});

salarySchema.virtual('hraEarningCalculated').get(function () {
    return Math.round((this.hra_earning / 100) * (this.pay_basic + this.grade_pay));
});

salarySchema.virtual('npsDepartmentShareCalculated').get(function () {
    return Math.round((this.nps_departmentshare / 100) * (this.pay_basic + this.grade_pay + this.dearnessAllowanceCalculated));
});

salarySchema.virtual('grossAmountCalculated').get(function () {
    return Math.round(this.pay_basic + this.grade_pay + this.dearnessAllowanceCalculated + this.hraEarningCalculated + this.npsDepartmentShareCalculated);
});

salarySchema.virtual('npsEmployeeShareCalculated').get(function () {
    return Math.round((this.nps_employeeshare / 100) * (this.pay_basic + this.grade_pay + this.dearnessAllowanceCalculated));
});

salarySchema.virtual('totalNpsCalculated').get(function () {
    return Math.round(this.npsDepartmentShareCalculated + this.npsEmployeeShareCalculated);
});

salarySchema.virtual('netPaymentAfterDeductionCalculated').get(function () {
    return Math.round(this.grossAmountCalculated - this.income_tax - this.professional_tax - this.hra_deduction - this.other_recovery - this.totalNpsCalculated)
});




export const Salary = mongoose.model('Salary', salarySchema);