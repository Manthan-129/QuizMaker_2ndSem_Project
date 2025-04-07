const express = require('express')
const morgan = require('morgan')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./module/User')
const Quiz = require('./module/Quiz') 
const connectDb = require('./connectMongoDB')
const cors = require('cors')
const axios= require('axios')

connectDb();

const app = express()

app.use(cors())

app.use(morgan("dev"))
app.use(express.static('./public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())


app.post('/login', async (req,res) => {
    try {
        const {username, password} = req.body

        const user = await User.findOne({username})
        if(!user) {
            return res.status(400).json({ error: "Username or Password is incorrect" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({error: "Username or Password is incorrect"})
        }

        // Return user ID to store in localStorage
        res.json({
            status: 200, 
            message: "Login successfully", 
            userId: user._id
        })
    }
    catch(error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

app.post('/signup', async (req,res) => {
    try {
        const {username, password} = req.body

        const existingUser = await User.findOne({username})

        if(existingUser) {
            return res.status(400).json({ error: "Username is already Taken" });
        }
        const hashPass = await bcrypt.hash(password, 10)

        // Create new user
        const newUser = new User({username, password: hashPass})
        await newUser.save()

        res.json({
            status: 200, 
            message: "SignUp successfully", 
            userId: newUser._id
        })
    }
    catch(error) {
        console.log(error)
        res.status(500).json({error: "Internal server Error"})
    }
})

// Create a new quiz
app.post('/quizzes', async (req, res) => {
    try {
        const { userId, title, questions } = req.body;
        
        if (!userId || !questions || questions.length === 0) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newQuiz = new Quiz({
            userId,
            title: title || "Untitled Quiz",
            questions
        });

        await newQuiz.save();
        res.status(201).json({ 
            message: "Quiz created successfully", 
            quizId: newQuiz._id 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all quizzes for a specific user
app.get('/quizzes/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const quizzes = await Quiz.find({ userId }).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get a specific quiz by ID
app.get('/quiz/:quizId', async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        
        res.json(quiz);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(5000, () => console.log("localHost is running at 5000"))