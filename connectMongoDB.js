require('dotenv').config();   // load environment variable


// with env crudentials are not exposed..
const mongoose= require('mongoose')

const connectDb= async()=>{
    try{

        const MongoURI= process.env.MONGO_URI

        await mongoose.connect(MongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    catch(err){
        console.log("error:", err)
        process.exit(1)
    }
}

module.exports= connectDb
