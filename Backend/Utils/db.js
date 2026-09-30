import mongoose from "mongoose";
import mongoosefro from "mongoose";

const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{

        });
        console.log("MongoDB connected...");
    } catch (error) {
        console.log("Error connecting to MongoDB:", error.message);
        proocess.exit(1);

    }
};

export default connectDB;