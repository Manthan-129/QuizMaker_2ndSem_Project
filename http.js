    const express= require('express')
    const morgan= require('morgan')
    const bcrypt= require('bcrypt')
    const mongoose = require('mongoose')
    const User = require('./module/User')
    const cors= require('cors')

    const app= express()

    app.use(cors())

    app.use(morgan("dev"))
    app.use(express.static('./public'))
    app.use(express.urlencoded({extended: true}))
    app.use(express.json())

    mongoose.connect('mongodb://localhost:27017/yourDatabase', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("MongoDB Connected"))
        .catch(err => console.log(err));


    app.post('/login', async (req,res)=>{

        try{
        const {username, password}= req.body

            const user = await User.findOne({username})
            if(!user){
                return res.status(400).json({ error: "Username or Password is incorrect" });
            }
            const isMatch= await bcrypt.compare(password,user.password);
            if(!isMatch){
                return res.status(400).json({error: "Username or Password is incorrect"})
            }

            res.json({message: "Login successfully", redirect: "/index1.html"})
        }
        catch(error){
            console.log(error)
            res.status(500).json({error: "Internal server error"})
        }

    })

    app.post('/signup',async (req,res)=>{

        try{
        const {username, password}= req.body

            const existingUser= await User.findOne({username})

            if(existingUser){
                return res.status(400).json({ error: "Username is already Taken" });
            }
            const hashPass= await bcrypt.hash(password,10)

            //new user
            const newUser= new User({username, password: hashPass})
            await newUser.save()

            res.json({message: "SignUp successfully", redirect: "/index.html"})
        }
        catch(error){
            console.log(error)
            res.status(500).json({error: "Internal server Error"})
        }

    })

    app.listen(5000,()=> console.log("localHost is running at 5000"))