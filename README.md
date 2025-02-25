# Jace

Jace is a method I call "council of models" that makes several LLMs discuss with each other about a problem or prompt given by the user to reflect on different points of view.

This makes you able to mix many different LLMs, helping to reduce hallucination and somewhat mitigating censorship.

## How it works

This project uses Ollama to run several models and query them with each other's ideas on how to solve the problem.

The basic steps for problem solving are as following:

1. A model chosen as the "proposing" one comes up with the first idea on how to solve the problem and tells it to the council.
2. The other models in the council are asked what they think about the idea, proposing other ideas when necessary.
3. Only if every review model writes out the words "Fine, I approve", the process finishes.
4. Lastly, the original "proposing" model summarizes the findings for the user.

## Prompts

### Initial system prompt to model A:

> You are member of a council filled with problem solvers. Given the following prompt, try to find an initial solution to it to propose to the council.
> Find a definitive answer at the end.

### Council reviewers prompt to the other models:

> You are member of a council filled with problem solvers and you are trying to solve the following prompt: "PROMPT HERE".
> Another member proposed the following solution. Please review said solution - don't hesitate to criticize - and, if applicable, propose changes.
> If you are okay with the solution, say the words "Fine, I approve" to the council.

### Post-review system prompts:

#### Unhappy:

> The council is not yet fully satisfied with this solution. Member(s) have answered with the following comments.
> Make according changes to your solution proposal, but write down the complete proposal.

#### Happy:

> The council is fully satisfied with this solution. To finish up, write an address to the user that features this latest, best solution.
> Also consider mentioning possible pitfalls you learned about during problem solving with the other members, but do not mention the council or the members themselves.

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
