const mongoose = require("mongoose");

mongoose.set("strictQuery", true);



// let url = "mongodb://localhost:27017/kms_db"
let url = "mongodb://dbkmsusr:KK6TMsEE7s!!9@103.231.8.86:27017/dbkms?authSource=dbkms"
mongoose.connect(url,
{useNewUrlParser : true},(err,result)=>{
    if(err){
        console.log("not Connected",err)
    }else{
    console.log("db Connected")
    }

});

