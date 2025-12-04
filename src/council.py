"""
This file contains the actual problem-solving logic for interacting with the
"council members".
"""

from typing import Any
from config import APPROVAL_MESSAGE, MAX_PASSES, Prompts
from util import prompt_model, remove_finalism
from log import logger


def send_callback(
    callback: Any = None,
    model: str = "",
    text: str = "",
    type_: str = "proposal",
    final: bool = False,
) -> None:
    """
    Sends a callback to the client.
    """

    if callback:
        callback({"model": model, "text": text, "type": type_, "final": final})


def consult_council_with_prompt(
    prompt: str,
    proposal_model: str,
    reviewer_models: "list[str]",
    callback: Any = None,
) -> str:
    """
    The main functionality of Jace - to consult the "council of models" with a
    prompt or question to be solved. This function takes a prompt, a model to
    make proposals, a list of models to review said proposals and an optional
    callback function to send updates about the council session to as
    arguments.
    """

    logger.info(
        "begin session with proposal model %s, review model(s) %s, prompt %s",
        proposal_model,
        ", ".join(reviewer_models),
        prompt,
    )

    passes_done: int = 0  # How many times the council has revised

    # Initialization of the variables used to run the council
    criticisms: "list[str]" = []
    current_solution: str = ""
    solution_finding_history: "list[dict[str, str]]" = []

    while passes_done < MAX_PASSES:
        logger.info("pass #%s", passes_done + 1)

        # --- SOLUTION FINDING PHASE ---

        if passes_done == 0:
            solution_finding_history.extend(
                [
                    {"role": "system", "content": Prompts.initial_solving},
                    {"role": "user", "content": prompt},
                ]
            )
        else:
            criticism_summary: str = ""

            for index, criticism in enumerate(criticisms, 1):
                criticism_summary += (
                    f"\n\n--- criticism by council member #{index} ---\n"
                    + f"{criticism}"
                )

            solution_finding_history.append(
                {
                    "role": "user",
                    "content": Prompts.changes_needed % criticism_summary,
                },
            )

        current_solution = prompt_model(
            proposal_model,
            solution_finding_history,
        )

        send_callback(callback, proposal_model, current_solution)

        # We need to do this after sending the callback - otherwise, output may
        # look weird to users of the Web UI.
        current_solution = remove_finalism(current_solution)

        solution_finding_history.append(
            {"role": "assistant", "content": current_solution}
        )

        logger.info(
            "current solution found by %s: \n\n %s",
            proposal_model,
            current_solution,
        )

        # -- REVIEW PHASE ---

        criticisms = []
        everyone_approves: bool = True

        for reviewer in reviewer_models:
            # What does this reviewer model think of the proposal?
            response = prompt_model(
                reviewer,
                [
                    {
                        "role": "system",
                        "content": Prompts.council_review % prompt,
                    },
                    {"role": "user", "content": current_solution},
                ],
                remove_thinking=True,
            )

            if APPROVAL_MESSAGE.casefold() not in response.casefold():
                # Oh no! This model does not approve.
                everyone_approves = False
                criticisms.append(response)

                logger.info("criticism by %s: \n\n%s", reviewer, response)
                send_callback(callback, reviewer, response, "criticism")
            else:
                # Perfect! The model approves.

                logger.info("approval by %s", reviewer)
                send_callback(callback, reviewer, response, "approval")

        if everyone_approves:
            # Okay, we're done now! Everyone is fine with the result, so we
            # can break out of the loop.
            break

        passes_done += 1

    solution_finding_history.extend(
        [
            {"role": "user", "content": Prompts.post_review_okay},
        ]
    )

    final_res = prompt_model(proposal_model, solution_finding_history)

    logger.info("success, final response:\n\n%s", final_res)
    send_callback(callback, proposal_model, final_res, "final_answer", True)

    return final_res
