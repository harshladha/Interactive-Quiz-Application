// --- Sound Synthesis ---
// These sounds are created using Tone.js for audio feedback.
const correctSound = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
}).toDestination();

const incorrectSound = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.2 }
}).toDestination();

const clickSound = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
}).toDestination();

// --- Quiz Data ---
// An array of objects, where each object represents a question and its answers.
const quizData = [
    { question: "What does HTML stand for?", answers: [ { text: "Hyper Trainer Marking Language", correct: false }, { text: "Hyper Text Markup Language", correct: true }, { text: "Hyperlinks and Text Markup Language", correct: false }, { text: "Home Tool Markup Language", correct: false } ] },
    { question: "Which language is used for styling web pages?", answers: [ { text: "HTML", correct: false }, { text: "JQuery", correct: false }, { text: "CSS", correct: true }, { text: "XML", correct: false } ] },
    { question: "What is the purpose of the `let` keyword in JavaScript?", answers: [ { text: "To declare a block-scoped local variable", correct: true }, { text: "To declare a global variable", correct: false }, { text: "To declare a constant", correct: false }, { text: "To create a function", correct: false } ] },
    { question: "Which company developed the JavaScript language?", answers: [ { text: "Microsoft", correct: false }, { text: "Apple", correct: false }, { text: "Google", "correct": false }, { text: "Netscape", correct: true } ] },
    { question: "What does API stand for?", answers: [ { text: "Application Programming Interface", correct: true }, { text: "Automated Programming Instruction", correct: false }, { text: "Application Process Integration", correct: false }, { text: "Advanced Programming Interface", correct: false } ] }
];

// --- DOM Elements ---
// Caching references to DOM elements for performance and readability.
const flipper = document.getElementById('quiz-flipper');
const questionText = document.getElementById('question-text');
const answerButtons = document.getElementById('answer-buttons');
const scoreElement = document.getElementById('score');
const questionCounterElement = document.getElementById('question-counter');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');
const finalScoreText = document.getElementById('final-score-text');
const resultsFeedback = document.getElementById('results-feedback');
const progressBar = document.getElementById('progress-bar');

// --- State Variables ---
// Variables to track the current state of the quiz.
let currentQuestionIndex = 0;
let score = 0;

/**
 * Initializes or restarts the quiz to its default state.
 */
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    scoreElement.innerText = `Score: 0`;
    nextButton.classList.add('hidden');
    flipper.classList.remove('is-flipped');
    // Wait for the card flip animation to complete before showing the first question.
    setTimeout(showQuestion, 400); 
}

/**
 * Displays the current question, answers, and updates the progress bar.
 */
function showQuestion() {
    resetState();
    const currentQuestion = quizData[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;

    // Update progress bar based on the previous question's completion.
    const progressPercentage = ((questionNumber - 1) / quizData.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    questionText.innerText = currentQuestion.question;
    questionCounterElement.innerText = `Question ${questionNumber} / ${quizData.length}`;

    // Create and append a button for each answer option.
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('answer-btn', 'w-full', 'p-4', 'border', 'border-gray-300', 'dark:border-gray-600', 'rounded-lg', 'text-left', 'hover:bg-gray-100', 'dark:hover:bg-gray-700', 'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-violet-500');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
        answerButtons.appendChild(button);
    });
}

/**
 * Clears the previous question's answer buttons.
 */
function resetState() {
    nextButton.classList.add('hidden');
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

/**
 * Handles the logic when a user selects an answer.
 * @param {Event} e The click event from the answer button.
 */
function selectAnswer(e) {
    Tone.start(); // Required to start audio context in some browsers.
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";

    // Provide feedback and update score.
    if (isCorrect) {
        score++;
        scoreElement.innerText = `Score: ${score}`;
        selectedBtn.classList.add('correct');
        correctSound.triggerAttackRelease("C4", "8n");
    } else {
        selectedBtn.classList.add('incorrect');
        incorrectSound.triggerAttackRelease("G2", "8n");
    }

    // Disable all buttons and reveal the correct answer.
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            if (!button.classList.contains('correct')) {
               button.classList.add('correct');
            }
        }
        button.disabled = true;
    });
    
    // Update progress bar for the current question.
    progressBar.style.width = `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;

    // Decide whether to show the next question or the final results.
    if (quizData.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hidden');
    } else {
        setTimeout(showResults, 1200);
    }
}

/**
 * Displays the final results screen with score and feedback.
 */
function showResults() {
    flipper.classList.add('is-flipped');
    finalScoreText.innerText = `Your final score is ${score} out of ${quizData.length}.`;
    
    const percentage = (score / quizData.length) * 100;
    let feedbackText = '';
    if (percentage === 100) {
        feedbackText = "Perfect! You're a tech wizard! 🧙‍♂️";
        launchConfetti();
    } else if (percentage >= 80) {
        feedbackText = "Excellent work! You really know your stuff. ✨";
        launchConfetti();
    } else if (percentage >= 50) {
        feedbackText = "Good job! A solid effort. 👍";
    } else {
        feedbackText = "Keep practicing! You'll get there. 🚀";
    }
    resultsFeedback.innerText = feedbackText;
}

/**
 * Handles the click of the "Next" button.
 */
function handleNextButton() {
    clickSound.triggerAttackRelease('C2', '8n');
    currentQuestionIndex++;
    showQuestion();
}

/**
 * Creates and launches a confetti animation for high scores.
 */
function launchConfetti() {
    const confettiContainer = document.getElementById('confetti-container');
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confettiContainer.appendChild(confetti);
    }
    // Clean up confetti elements after the animation.
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 5000);
}

// --- Event Listeners ---
// Assigning functions to button click events.
nextButton.addEventListener('click', handleNextButton);
restartButton.addEventListener('click', () => {
     clickSound.triggerAttackRelease('C2', '8n');
     startQuiz();
});

// Start the quiz once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', startQuiz);
