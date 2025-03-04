"""
To change the behavior of Jace, modify the variables in this file.
"""

# How many passes of review the council should perform before just pretending
# like everyone is okay
from dataclasses import dataclass


MAX_PASSES = 6

# How the termination of your Chain-of-thought model of choice looks like
THINK_TERMINATOR = "</think>"

# What the reviewers shall say when there is no criticism to be made
APPROVAL_MESSAGE = "Fine, I approve"

# Whether to print out additional logging info to stdout or a file.
ENABLE_LOGGING_OUTPUT = True

# Phrases some models may tend to include in their reviewed answers - those
# hint at the answer being a final, complete version of what the council is
# working on, even though it may not be done yet. As this might decept other
# council member LLMs, it's best to remove such phrases from the proposals.
FINALISM_PHRASES: "list[str]" = [
    "final thoughts",
    "final result",
    "final solution",
    "final conclusion",
    "final answer",
]


@dataclass
class Models:
    """
    This class keeps track of all supported Models to allow for easy access
    across the codebase.
    """

    proposing_model: str = "deepseek-r1:7b"
    review_models: "list[str]" = [
        "llama3.2:3b",
        "gemma:2b",
        "mistral:7b",
        # "alibayram/erurollm-9b-instruct",
    ]


@dataclass
class Prompts:
    """
    Prompts used by Jace to query the LLMs in the council.
    """

    initial_solving: str = """You are member of a council filled with \
problem solvers. Given the following prompt, try to find an initial solution \
to it to propose to the council. Find a definitive answer at the end."""

    council_review: str = f""" You are member of a council filled with \
problem solvers and you are trying to solve the following prompt: "%s".

Another member proposed the following solution. Please review said solution \
- don't hesitate to criticize - and, if applicable, propose changes.

If you are okay with the solution, say the words "{APPROVAL_MESSAGE}" to the \
council. In that case, you don't need to give a full explanation again."""

    changes_needed: str = """ The council is not yet fully \
satisfied with this solution. Member(s) have answered with the following \
comments:

%s

Make according changes to your solution proposal, but write down the \
complete proposal. Do not label it with something like \"Final thoughts\" \
or anything else suggesting it's final, because it may not be yet."""

    post_review_okay: str = """The council is fully satisfied with this \
solution. To finish up, summarize the solution and - if you deem this \
necessary - how you got to it.

Also consider mentioning possible pitfalls you learned about during problem \
solving with the other members, but DO NOT mention the council or the \
members themselves IN ANY CASE! Make the answer as short and helpful as \
reasonably possible."""
