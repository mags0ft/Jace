"""
A minimal web interface for the user to interact with.
"""

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from config import Models
import config
from council import consult_council_with_prompt, send_callback
from util import clean_from_artifacts, prompt_model


app = Flask(__name__)
socketio = SocketIO(app)

app.template_folder = "server/templates"
app.static_folder = "server/assets"


@app.route("/")
def homepage():
    """
    Main home page of the server web UI.
    """

    return render_template("index.html")


@socketio.on("prompt_jace")
def handle_incoming_prompt(req):
    """
    Handling of the incoming Socket.IO requests to the council.
    """

    def update_callback(new_message: dict["str", "str"]):
        emit("new_message", new_message)

    consult_council_with_prompt(
        req["prompt"],
        Models.proposing_model,
        Models.review_models,
        callback=update_callback,
    )


@socketio.on("create_diagram")
def handle_incoming_diagram_request(req):
    """
    Handling of the incoming Socket.IO requests to solely create diagrams using
    artificial intelligence.
    """

    def update_callback(new_message: dict["str", "str"]):
        emit("new_message", new_message)

    diagram = clean_from_artifacts(
        prompt_model(
            config.Models.diagram_model,
            [
                {"role": "system", "content": config.Prompts.diagram_creation},
                {"role": "user", "content": req["prompt"]},
            ],
            True,
        )
    )

    send_callback(
        update_callback,
        config.Models.diagram_model,
        diagram,
        "diagram",
        True,
    )


if __name__ == "__main__":
    app.run()
