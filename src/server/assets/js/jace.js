/*
This file contains all the client-side JavaScript code needed to provide a good experience for Jace.
*/


// All image files for the specific models
const IMAGE_URLS = {
    "deepseek-r1:7b": "/static/images/models/deepseek.webp",
    "llama3.2:3b": "/static/images/models/llama.webp",
    "llama3.2:1b": "/static/images/models/llama.webp",
    "gemma:2b": "/static/images/models/gemma.webp",
    "mistral:7b": "/static/images/models/mistral.webp",
    "alibayram/erurollm-9b-instruct": "/static/images/models/eurollm.webp",
};

// Human-readable versions of the model names
const MODEL_NAMES = {
    "deepseek-r1:7b": "DeepSeek",
    "llama3.2:3b": "LLaMA (Meta)",
    "llama3.2:1b": "LLaMA (Meta)",
    "gemma:2b": "Gemma (Google)",
    "mistral:7b": "Mistral",
    "alibayram/erurollm-9b-instruct": "EuroLLM (EU)",
}

// All elements we want to address in the DOM
const elements = {
    promptInput: document.getElementById("prompt-input"),
    goButton: document.getElementById("go-button"),
    newQuestionButton: document.getElementById("new-question-button"),
    drawer: document.getElementById("drawer"),
    background: document.getElementById("main"),
    answers: document.getElementById("answers"),
    loadingAnimation: document.getElementById("loading-animation"),
    answerTemplate: document.getElementById("answer-template"),
};

// The Socket.IO connection to the server
const socket = io();

function startCouncilSession() {
    // Starts a council session for a specific question on the server.

    if (elements.promptInput.value.length < 3) return;

    elements.drawer.style.bottom = "0";
    elements.background.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

    elements.loadingAnimation.style.opacity = 1;

    // Send prompt to the server via socket
    socket.emit("prompt_jace", { prompt: elements.promptInput.value });

    // After the drawer opens, we can clear the question input field
    setTimeout(() => {
        elements.promptInput.value = "";
    }, 750);
}

function newQuestion() {
    // Closes the drawer, so a new question can be asked

    elements.drawer.style.bottom = "-100%";
    elements.background.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    elements.loadingAnimation.style.opacity = 0;

    // Same thing goes for here: we can clear the 
    setTimeout(() => {
        elements.answers.innerHTML = "";
    }, 750);
}

elements.newQuestionButton.onclick = newQuestion;
elements.goButton.onclick = startCouncilSession;

// Hotkey support
document.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
        case "enter":
            // Enter sends the question to the server
            startCouncilSession();
            break;
        case "escape":
            // Escape closes the answer drawer.
            newQuestion();
            break;

        default:
            break;
    }
})

function createAnswerElement(resp) {
    /*
    This function creates an answer element from the template inside of index.html.
    It then renders it onto the drawer.
    */

    const clone = elements.answerTemplate.content.cloneNode(true);

    clone.querySelector("#message-model").innerText = MODEL_NAMES[resp.model];

    if (resp.type == "approval") {
        clone.querySelector("#message-text").innerText = "approves"
    } else {
        clone.querySelector("#message-text").innerHTML = marked.parse(resp.text);
    }

    clone.querySelector("#message-image").src = IMAGE_URLS[resp.model];
    clone.querySelector("#answer-element").style.backgroundColor = {
        "proposal": "rgb(250, 250, 250)",
        "approval": "rgb(214, 255, 209)",
        "criticism": "rgb(255, 217, 217)",
        "final_answer": "rgb(211, 231, 255)"
    }[resp.type];

    elements.answers.appendChild(clone);
    elements.answers.children[elements.answers.children.length - 1].scrollIntoView({ behavior: "smooth" })
}

socket.on("new_message", (m) => {
    // When a new message is retrieved from the council, render it.

    if (m.final || m.type == "final_answer") {
        // If it's a final answer, hide the loading skeleton
        elements.loadingAnimation.style.opacity = 0;
    }

    createAnswerElement(m);
})
