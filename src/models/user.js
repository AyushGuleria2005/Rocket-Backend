import mongoose from "mongoose";

//We will define schema for User

const userSchema = mongoose.Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String
    },
    password:{
        type:String
    },
    rollNo:{
        type:String
    },
    year:{
        type:Number
    }
});

//Now lets create a user model using schema

export const User = mongoose.model("User",userSchema)