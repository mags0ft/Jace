"""
A minimal web interface for the user to interact with.
"""

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from config import Models
from council import consult_council_with_prompt


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


if __name__ == "__main__":
    app.run()
