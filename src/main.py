"""
The main entry point for Jace.
"""

import time
from config import Models
from council import consult_council_with_prompt


def main():
    while True:
        prompt = input(" (Jace) > ")

        time_begin: float = time.time()
        response = consult_council_with_prompt(
            prompt, Models.proposing_model, Models.review_models
        )
        time_end: float = time.time()

        print(response + "\n\n(finished in {:.1f}s)".format(time_end - time_begin))


if __name__ == "__main__":
    main()
