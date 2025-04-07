const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true }
    }],
    createdAt: { type: Date, default: Date.now }
});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;