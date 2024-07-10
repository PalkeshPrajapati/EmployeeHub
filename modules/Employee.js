import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    vender_id: {
        type: String,
        required: true,
        unique: true,
    },
    employee_name: {
        type: String,
        required: true,
        match: /^[a-zA-Z\s]+$/,
        minlength: 3,
        maxlength: 50,
        trim: true,
    },
    father_name: {
        type: String,
        required: true,
        match: /^[a-zA-Z\s]+$/,
        minlength: 3,
        maxlength: 50,
        trim: true,
    },
    phone_no: {
        type: String,
        required: true,
        match: /^\d{10}$/,
        minlength: 10,
        maxlength: 10,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, // Valid email format
        trim: true,
    },
    aadharcard_no: {
        type: String,
        required: true,
        match: /^\d{12}$/,
        minlength: 12,
        maxlength: 12,
        trim: true,
    },
    pancard_no: {
        type: String,
        required: true,
        match: /^\d{10}$/,
        minlength: 10,
        maxlength: 10,
        trim: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    doj: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'],
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    qualification: {
        type: String,
        required: true,
        trim: true,
    },
    branch: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    date_created:{
        type: Date, 
        required: true, 
        trim: true,
        default: Date.now()
    }
});


export const Employee = mongoose.model('Employee', EmployeeSchema);