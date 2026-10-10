import application from "../models/application.model.js";
export const applyJob = async (req, res) => {
    try{
        const userId = req.id;
        const jobId = req.params.id;
        if(!jobId){
            return res.status(400).json({
                message: "Invalid job id",
                success: false,
            });
        }
        //check the user has already applied for this job
        const existingApplication = await application.findOne({ job:jobId});
        if
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server Error",
            success: false,
        });
    }

};