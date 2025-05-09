/*
This file contains all the client-side JavaScript code needed to provide a good experience for Jace.
*/


// All image files for the specific models
const IMAGE_URLS = {
    "deepseek-r1": "/static/images/models/deepseek.webp",
    "llama3.2": "/static/images/models/llama.webp",
    "gemma3": "/static/images/models/gemma.webp",
    "mistral": "/static/images/models/mistral.webp",
    "qwen3": "/static/images/models/qwen.webp",
};

// Human-readable versions of the model names
const MODEL_NAMES = {
    "deepseek-r1": "DeepSeek",
    "llama3.2": "Llama (Meta)",
    "gemma3": "Gemma (Google)",
    "mistral": "Mistral",
    "qwen3": "Qwen 3",
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
    modeIndicator: document.getElementById("mode-indicator"),
};

// The Socket.IO connection to the server
const socket = io();

// The last prompt that has been made to create a diagram.
let previousSavedPrompt = "";

function startCouncilSession(question = "") {
    // Starts a council session for a specific question on the server.

    let prompt = elements.promptInput.value;

    if (typeof question == "string" && question != "") {
        prompt = question;
    } else {
        previousSavedPrompt = prompt;
    }

    if (prompt.length < 3) return;

    elements.drawer.style.bottom = "0";
    elements.background.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

    elements.loadingAnimation.style.opacity = 1;

    if (mentionsDiagram(prompt)) {
        socket.emit("create_diagram", { prompt: prompt });
    } else {
        // Send prompt to the server via socket
        socket.emit("prompt_jace", {
            prompt: prompt.replaceAll("/no_chart", "")
        });
    }

    // After the drawer opens, we can clear the question input field
    setTimeout(() => {
        elements.promptInput.value = "";
    }, 750);

    setTimeout(() => {
        elements.modeIndicator.style.opacity = 0;
    }, 1000);
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

function mentionsDiagram(value) {
    value = value.toLowerCase();

    let keywords = [
        "diagram",
        "chart",
    ];

    if (value.includes("/no_chart")) return false;

    for (let keyword of keywords) {
        if (value.includes(keyword)) return true;
    }

    return false;
}

elements.promptInput.addEventListener("input", (e) => {
    if (mentionsDiagram(elements.promptInput.value)) {
        elements.modeIndicator.style.opacity = .65;
    } else {
        elements.modeIndicator.style.opacity = 0;
    }
})

function normalizeModelName(model_name) {
    /*
    This function normalizes the model name by removing everything that comes after
    the colon, as anything after it only includes model size information.
    */

    return model_name.split(":")[0];
}

function createAnswerElement(resp) {
    /*
    This function creates an answer element from the template inside of index.html.
    It then renders it onto the drawer.
    */

    const clone = elements.answerTemplate.content.cloneNode(true);

    clone.querySelector("#message-model").innerText = MODEL_NAMES[normalizeModelName(resp.model)];

    if (resp.type == "approval") {
        clone.querySelector("#message-text").innerText = "approves"
    } else if (resp.type == "diagram") {
        let diagram = document.createElement("pre");
        diagram.classList.add("mermaid");
        diagram.innerHTML = resp.text;

        clone.querySelector("#message-text").appendChild(diagram);
    } else {
        clone.querySelector("#message-text").innerHTML = marked.parse(resp.text);
    }

    clone.querySelector("#message-image").src = IMAGE_URLS[normalizeModelName(resp.model)];
    clone.querySelector("#answer-element").style.backgroundColor = {
        "proposal": "rgb(250, 250, 250)",
        "diagram": "rgb(250, 250, 250)",
        "approval": "rgb(214, 255, 209)",
        "criticism": "rgb(255, 217, 217)",
        "final_answer": "rgb(211, 231, 255)"
    }[resp.type];

    elements.answers.appendChild(clone);

    if (resp.type == "diagram") {
        // Render the diagram if necessary:
        mermaid.run().then(() => {
            previousSavedPrompt = "";
        }).catch((_e) => {
            elements.answers.innerHTML = "";

            // Try again:
            startCouncilSession(
                previousSavedPrompt + " Make it simpler. Stick to pure, correct Mermaid syntax. "
                + "Your last attempt failed to render."
            );
        })
    }

    // Finally, scroll into view:
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
