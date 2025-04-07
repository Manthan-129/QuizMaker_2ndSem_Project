// Check if user is logged in
function checkAuth() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.href = "login.html";
        return false;
    }
    return userId;
}

let questions = [];
let userAnswers = [];
let currentQuestionIndex = 0;
let historyStack = [];
let quizSubmitted = false;
let currentQuizId = null;

// Start Quiz Setup
function startQuizSetup() {
    const userId = checkAuth();
    if (!userId) return;

    let numQuestions = document.getElementById("numQuestions").value;
    if (numQuestions > 0) {
        localStorage.setItem("numQuestions", numQuestions);
        localStorage.setItem("quizTitle", document.getElementById("quizTitle").value || "Untitled Quiz");
        localStorage.setItem("tempQuestions", JSON.stringify([]));
        window.location.href = "numberQuestion.html";
    } else {
        alert("Enter a valid number of questions.");
    }
}

// Save Question
function saveQuestion() {
    const userId = checkAuth();
    if (!userId) return;

    let storedQuestions = JSON.parse(localStorage.getItem("tempQuestions")) || [];
    let totalQuestions = localStorage.getItem("numQuestions");

    if (storedQuestions.length >= totalQuestions) {
        alert(`You can only enter ${totalQuestions} questions.`);
        return;
    }

    let questionText = document.getElementById("question").value.trim();
    let options = [
        document.getElementById("option1").value.trim(),
        document.getElementById("option2").value.trim(),
        document.getElementById("option3").value.trim(),
        document.getElementById("option4").value.trim()
    ];
    let correctAnswer = parseInt(document.getElementById("correctOption").value);

    if (!questionText || options.some(opt => opt === "")) {
        alert("Fill all fields before saving.");
        return;
    }

    storedQuestions.push({ question: questionText, options, correctAnswer });
    localStorage.setItem("tempQuestions", JSON.stringify(storedQuestions));
    document.getElementById("questionForm").reset();
    updateProgress();
}

// Update Progress
function updateProgress() {
    if (!document.getElementById("currentQ") || !document.getElementById("totalQ")) return;
    
    let storedQuestions = JSON.parse(localStorage.getItem("tempQuestions")) || [];
    let totalQuestions = localStorage.getItem("numQuestions");
    document.getElementById("currentQ").innerText = storedQuestions.length;
    document.getElementById("totalQ").innerText = totalQuestions;
}

// Finish Quiz Setup
async function finishQuizSetup() {
    const userId = checkAuth();
    if (!userId) return;

    let storedQuestions = JSON.parse(localStorage.getItem("tempQuestions")) || [];
    let totalQuestions = localStorage.getItem("numQuestions");
    let quizTitle = localStorage.getItem("quizTitle");

    if (storedQuestions.length < totalQuestions) {
        alert(`You must enter exactly ${totalQuestions} questions.`);
        return;
    }

    try {
        // Save quiz to database
        const response = await axios.post('http://localhost:5000/quizzes', {
            userId: userId,
            title: quizTitle,
            questions: storedQuestions
        });
        
        if (response.status === 201) {
            // Store quiz ID for attempting
            localStorage.setItem("currentQuizId", response.data.quizId);
            alert("Quiz created successfully!");
            window.location.href = "dashboard.html";
        }
    } catch (error) {
        console.error("Error saving quiz:", error);
        alert("Failed to save quiz. Please try again.");
    }
}

// Load Quiz
document.addEventListener("DOMContentLoaded", async function () {
    const userId = checkAuth();
    if (!userId) return;

    // Initialize for number questions page
    if (window.location.pathname.includes("numberQuestion.html")) {
        updateProgress();
        return;
    }

    // Initialize for attempt quiz page
    if (window.location.pathname.includes("attemptQuiz.html")) {
        currentQuizId = localStorage.getItem("currentQuizId");
        if (!currentQuizId) {
            alert("No quiz selected!");
            window.location.href = "dashboard.html";
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/quiz/${currentQuizId}`);
            questions = response.data.questions;
            userAnswers = new Array(questions.length).fill(null);
            displayQuestion(0);
            
            // Make sure buttons are properly visible
            const prevBtn = document.getElementById("prevBtn");
            const nextBtn = document.getElementById("nextBtn");
            const submitBtn = document.getElementById("submitBtn");
            
            if (prevBtn) prevBtn.style.display = "inline-block";
            if (nextBtn) nextBtn.style.display = "inline-block";
            if (submitBtn) submitBtn.style.display = "inline-block";
        } catch (error) {
            console.error("Error loading quiz:", error);
            alert("Failed to load quiz. Please try again.");
            window.location.href = "dashboard.html";
        }
    }

    // Initialize for result page
    if (window.location.pathname.includes("result.html")) {
        showResult();
    }
});

// Display Question
function displayQuestion(index) {
    if (!questions[index]) {
        console.error("Question not found at index:", index);
        return;
    }

    const questionEl = document.getElementById("questionText");
    const optionsContainer = document.getElementById("optionsContainer");
    
    if (!questionEl || !optionsContainer) {
        console.error("Question elements not found in the DOM");
        return;
    }

    let question = questions[index];
    questionEl.innerText = question.question;
    
    let optionsHTML = question.options.map((option, i) => `
        <label>
            <input type="radio" name="answer" value="${i}" ${userAnswers[index] === i ? "checked" : ""}>
            ${option}
        </label><br>
    `).join("");

    optionsContainer.innerHTML = optionsHTML;
}

// Next Question
function nextQuestion() {
    if (quizSubmitted) return;
    saveUserAnswer();
    if (currentQuestionIndex < questions.length - 1) {
        historyStack.push(currentQuestionIndex);
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    }
}

// Previous Question
function prevQuestion() {
    if (quizSubmitted) return;
    saveUserAnswer();
    if (historyStack.length > 0) {
        currentQuestionIndex = historyStack.pop();
        displayQuestion(currentQuestionIndex);
    }
}

// Save User Answer
function saveUserAnswer() {
    let selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
        userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    }
}

// Submit Quiz
function submitQuiz() {
    saveUserAnswer();
    
    // Check if all questions are answered
    const unanswered = userAnswers.findIndex(answer => answer === null);
    if (unanswered !== -1) {
        if (!confirm(`You haven't answered question ${unanswered + 1}. Submit anyway?`)) {
            return;
        }
    }
    
    quizSubmitted = true;

    let correctCount = 0;
    questions.forEach((q, i) => {
        if (userAnswers[i] === q.correctAnswer) {
            correctCount++;
        }
    });

    localStorage.setItem("quizScore", correctCount);
    localStorage.setItem("quizTotal", questions.length);
    window.location.href = "result.html";
}

// Show Result
function showResult() {
    let score = parseInt(localStorage.getItem("quizScore") || 0);
    let total = parseInt(localStorage.getItem("quizTotal") || 0);
    let percentage = (score / total) * 100;
    let emoji = "😢"; 

    if (percentage >= 75) {
        emoji = "🥳";
        triggerConfetti();
    } else if (percentage >= 50) {
        emoji = "😊";
    }

    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.innerHTML = `<h2>You scored ${score} out of ${total}! ${emoji}</h2>`;
    }
}

// Confetti Effect
function triggerConfetti() {
    if (typeof ConfettiGenerator === 'undefined') {
        console.error("Confetti library not loaded");
        return;
    }
    
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        const confettiSettings = { target: 'confetti-canvas' };
        const confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();
    }
}

// Dashboard navigation
function goToDashboard() {
    window.location.href = "dashboard.html";
}