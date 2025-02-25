const promptInput = document.getElementById("prompt-input");
const goButton = document.getElementById("go-button");
const newQuestionButton = document.getElementById("new-question-button");
const drawer = document.getElementById("drawer");
const background = document.getElementById("main");
const answers = document.getElementById("answers");
const loadingAnimation = document.getElementById("loading-animation");
const answerTemplate = document.getElementById("answer-template");

const socket = io();

goButton.onclick = () => {
    if (promptInput.value.length < 3) return;

    drawer.style.bottom = "0";
    background.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

    loadingAnimation.style.opacity = 1;

    socket.emit("prompt_jace", { prompt: promptInput.value });

    setTimeout(() => {
        promptInput.value = "";
    }, 750);
};

newQuestionButton.onclick = () => {
    drawer.style.bottom = "-100%";
    background.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    loadingAnimation.style.opacity = 0;

    setTimeout(() => {
        answers.innerHTML = "";
    }, 750);
};

const imageURLs = {
    "deepseek-r1:7b": "/static/images/models/deepseek.webp",
    "llama3.2:3b": "/static/images/models/llama.webp",
    "llama3.2:1b": "/static/images/models/llama.webp",
    "gemma:2b": "/static/images/models/gemma.webp",
    "alibayram/erurollm-9b-instruct": "/static/images/models/eurollm.webp",
};

const modelNames = {
    "deepseek-r1:7b": "DeepSeek",
    "llama3.2:3b": "LLaMA (Meta)",
    "llama3.2:1b": "LLaMA (Meta)",
    "gemma:2b": "Gemma (Google)",
    "alibayram/erurollm-9b-instruct": "EuroLLM (EU)",
}

function createAnswerElement(resp) {
    const clone = answerTemplate.content.cloneNode(true);

    clone.querySelector("#message-model").innerText = modelNames[resp.model];

    if (resp.type == "approval") {
        clone.querySelector("#message-text").innerText = "approves"
    } else {
        clone.querySelector("#message-text").innerHTML = marked.parse(resp.text);
    }

    clone.querySelector("#message-image").src = imageURLs[resp.model];

    clone.querySelector("#answer-element").style.backgroundColor = {
        "proposal": "rgb(250, 250, 250)",
        "approval": "rgb(214, 255, 209)",
        "criticism": "rgb(255, 217, 217)",
        "final_answer": "rgb(211, 231, 255)"
    }[resp.type];

    answers.appendChild(clone);
    answers.children[answers.children.length - 1].scrollIntoView({ behavior: "smooth" })
}

socket.on("new_message", (m) => {
    console.log(m.type, m.final);
    if (m.final || m.type == "final_answer") {
        console.log("hide!");
        loadingAnimation.style.opacity = 0;
    }

    createAnswerElement(m);
})
