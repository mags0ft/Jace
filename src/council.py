"""
This file contains the actual problem-solving logic for interacting with the "council members".
"""

from config import APPROVAL_MESSAGE, MAX_PASSES, Prompts
from util import prompt_model, remove_finalism
from log import logger


def consult_council_with_prompt(
    prompt: str, solution_proposal_model: str = "", reviewer_models: "list[str]" = []
) -> str:
    logger.info(
        f"begin council session with proposal model {solution_proposal_model}, "
        + f'review model(s) {", ".join(reviewer_models)}, prompt "{prompt}"'
    )

    passes_done: int = 0  # how many times the council has revised

    criticisms: "list[str]" = []
    current_solution: str = ""
    solution_finding_history: "list[dict[str, str]]" = []

    while passes_done < MAX_PASSES:
        logger.info(f"pass #{passes_done + 1}")

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
                    f"\n\n--- criticism by council member #{index} ---\n{criticism}"
                )

            solution_finding_history.append(
                {
                    "role": "user",
                    "content": Prompts.post_review_changes_needed % criticism_summary,
                },
            )

        current_solution = remove_finalism(
            prompt_model(
                solution_proposal_model,
                solution_finding_history,
            )
        )

        solution_finding_history.append(
            {"role": "assistant", "content": current_solution}
        )

        logger.info(
            f"current solution found by {solution_proposal_model}: \n\n{current_solution}"
        )

        # -- REVIEW PHASE ---

        criticisms = []
        everyone_approves: bool = True

        for reviewer in reviewer_models:
            response = prompt_model(
                reviewer,
                [
                    {"role": "system", "content": Prompts.council_review % prompt},
                    {"role": "user", "content": current_solution},
                ],
                remove_thinking=True,
            )

            if APPROVAL_MESSAGE.casefold() not in response.casefold():
                # Oh no! This model does not approve.
                everyone_approves = False
                criticisms.append(response)

                logger.info(f"criticism by {reviewer}: \n\n{response}")
            else:
                logger.info(f"approval by {reviewer}: {response}")

        if everyone_approves:
            break

        passes_done += 1

    solution_finding_history.extend(
        [
            {"role": "user", "content": Prompts.post_review_okay},
        ]
    )

    final_response = prompt_model(solution_proposal_model, solution_finding_history)

    logger.info(f"success, final response:\n\n{final_response}")

    return final_response
