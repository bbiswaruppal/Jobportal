import mongoose, { Schema } from "mongoose";
const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String,
        required: true
    },
    website:{
        type:String,
        required: true
    },
    location:{
        type: String,
    },
    address:{
        type:String,
        required:true,
    },
    logo:{
        type:String, //url for logo
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },


    address:{
        type:String,
        required:true,
    }

},{timestamps: true});

export const Company = mongoose.model("Company", companySchema);