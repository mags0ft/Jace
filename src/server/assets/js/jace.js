/*
This file contains all the client-side JavaScript code needed to provide a good experience for Jace.
*/

const IMAGE_URLS = {
    "deepseek-r1:7b": "/static/images/models/deepseek.webp",
    "llama3.2:3b": "/static/images/models/llama.webp",
    "llama3.2:1b": "/static/images/models/llama.webp",
    "gemma:2b": "/static/images/models/gemma.webp",
    "mistral:7b": "/static/images/models/mistral.webp",
    "alibayram/erurollm-9b-instruct": "/static/images/models/eurollm.webp",
};

const MODEL_NAMES = {
    "deepseek-r1:7b": "DeepSeek",
    "llama3.2:3b": "LLaMA (Meta)",
    "llama3.2:1b": "LLaMA (Meta)",
    "gemma:2b": "Gemma (Google)",
    "mistral:7b": "Mistral",
    "alibayram/erurollm-9b-instruct": "EuroLLM (EU)",
}

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

const socket = io();

function startCouncilSession() {
    if (elements.promptInput.value.length < 3) return;

    elements.drawer.style.bottom = "0";
    elements.background.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

    elements.loadingAnimation.style.opacity = 1;

    socket.emit("prompt_jace", { prompt: elements.promptInput.value });

    setTimeout(() => {
        elements.promptInput.value = "";
    }, 750);
}

function newQuestion() {
    elements.drawer.style.bottom = "-100%";
    elements.background.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    elements.loadingAnimation.style.opacity = 0;

    setTimeout(() => {
        elements.answers.innerHTML = "";
    }, 750);
}

elements.newQuestionButton.onclick = newQuestion;
elements.goButton.onclick = startCouncilSession;

document.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
        case "enter":
            startCouncilSession();
            break;
        case "escape":
            newQuestion();
            break;

        default:
            break;
    }
})

function createAnswerElement(resp) {
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
    if (m.final || m.type == "final_answer") {
        elements.loadingAnimation.style.opacity = 0;
    }

    createAnswerElement(m);
})
