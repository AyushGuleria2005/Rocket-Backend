import mongoose from "mongoose";

//College Schema 

const collegeSchema = mongoose.Schema({
    college_name:{
        type:String
    }
});

// Now we will create User model that will use this Schema

export const College = mongoose.model("College",collegeSchema);
