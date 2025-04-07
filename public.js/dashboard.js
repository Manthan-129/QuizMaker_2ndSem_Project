document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.href = "login.html";
        return;
    }

    // Display username if available
    const username = localStorage.getItem("username");
    if (username) {
        document.getElementById("username-display").textContent = `Hello, ${username}!`;
    }

    // Button event listeners
    document.getElementById("create-quiz-btn").addEventListener("click", () => {
        window.location.href = "createQuiz.html";
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        window.location.href = "login.html";
    });

    // Fetch and display user's quizzes
    fetchUserQuizzes(userId);
});

async function fetchUserQuizzes(userId) {
    try {
        const response = await axios.get(`http://localhost:5000/quizzes/${userId}`);
        const quizzes = response.data;
        
        document.getElementById("loading-message").style.display = "none";
        
        if (quizzes.length === 0) {
            document.getElementById("no-quizzes-message").style.display = "block";
            return;
        }
        
        const quizListContainer = document.getElementById("quiz-list");
        quizzes.forEach(quiz => {
            const quizCard = document.createElement("div");
            quizCard.className = "quiz-card";
            
            quizCard.innerHTML = `
                <h3>${quiz.title}</h3>
                <p>${quiz.questions.length} Questions</p>
                <p>Created: ${new Date(quiz.createdAt).toLocaleDateString()}</p>
                <div class="quiz-actions">
                    <button class="attempt-btn" data-quiz-id="${quiz._id}">Attempt Quiz</button>
                    <button class="view-btn" data-quiz-id="${quiz._id}">View Results</button>
                </div>
            `;
            
            quizListContainer.appendChild(quizCard);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll(".attempt-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const quizId = e.target.getAttribute("data-quiz-id");
                localStorage.setItem("currentQuizId", quizId);
                window.location.href = "attemptQuiz.html";
            });
        });
        
        document.querySelectorAll(".view-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const quizId = e.target.getAttribute("data-quiz-id");
                localStorage.setItem("currentQuizId", quizId);
                window.location.href = "result.html";
            });
        });
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        document.getElementById("loading-message").textContent = "Error loading quizzes. Please try again later.";
    }
}