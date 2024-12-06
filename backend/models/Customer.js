const mongoose = require("mongoose");

CustomerSchema = new mongoose.Schema({
    fName:{
        type : String , required :true
    },

    lName:{
        type:String,required:true
    },
    email: {
        type:String, required: true
    }, password :{
        type:String, required: true
    },
    adresse:{
        type:String 
    },
    order:[{
        type:mongoose.Types.ObjectId,
        ref:"Order"
    }]
});
const CustomerModel = mongoose.model("Customer", CustomerSchema)
module.exports=CustomerModel;