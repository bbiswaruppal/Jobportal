import mongoose, { Schema } from "mongoose";
const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    logo:{
        type:String, //url for logo
    },
    userId:{
        typr: mongoose.Schema.Types.ObjectId,
        ref: 'UserId',
        required: true
    },


    address:{
        type:String,
        required:true,
    }

},{timestamps: true});

export const Company = mongoose.model("Company", Schema)