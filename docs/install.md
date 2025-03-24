## How to install and run it locally

It's indeed super simple! Doing it on a Unix-based or Unix-agnostic system would be best, however.

First, make sure ollama, python3 and `python-venv` is installed. Then...

1. clone the repo: `git clone https://github.com/mags0ft/Jace.git`
2. open it: `cd Jace`
3. create a `venv`: `python3 -m venv .venv`
4. activate the venv: `. ./.venv/bin/activate`
5. install all dependencies: `pip install -r ./requirements.txt`
6. to run the server: `python3 ./src/server.py`

Make sure you have all the models listed in `src/config.py` pulled.

**Note**: The server-based web UI of Jace also supports the creation of diagrams. Just mention the words "diagram" or "chart" in your prompt to activate the diagram creation mode. If you do not wish to use this and want to deactivate said mode, add a "/nochart" anywhere in your prompt.
