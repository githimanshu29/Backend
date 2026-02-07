import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
        },

        password:{
            type: String,
            required: true,
            minlength: 6,
            select: false, // hide password from queries
        },

        role:{
            type:String,
            enum:["customer","admin","delivery"],
            default:"customer",
        },
        refreshToken:{
            type:String,
            default:null,
        }
    },

    {timestamps:true}
);

//Hash password before saving .pre() means: Run this function BEFORE a certain event happens. This is called a pre middleware (hook).  ✅✅Before saving a user to database, run this function. "save" is a Mongoose document lifecycle event.So save is event here


userSchema.pre("save", async function(){
   if(!this.isModified("password")) // if password not changed skip hashing beacuse when user-> updates email this happens -> user.save(); but in case we dont want to hash it again.
     return ;

   const salt = await bcrypt.genSalt(10);
   this.password=await bcrypt.hash(this.password, salt);

});


// compare password during login

//Now you’re adding a method to this class.✅Equivalent to:
// class User {
//     comparePassword() { }
//  }

// Why Normal Function (Not Arrow)
// 👉 Mongoose binds 'this' to the current document
// 👉 Arrow functions break 'this'

userSchema.methods.comparePassword=async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;