"""
The main entry point for Jace.
"""

import time
from config import Models
from council import consult_council_with_prompt


def main():
    """
    Main function and entry point of the command-line application version of
    the Jace council of models proof-of-concept.
    """

    while True:
        # First, read the user input...
        prompt = input(" (Jace) > ")

        # ... then start the council session with it.
        time_begin: float = time.time()
        response = consult_council_with_prompt(
            prompt, Models.proposing_model, Models.review_models
        )
        time_end: float = time.time()

        # Lastly, print it out. Trivial stuff.
        print(response + f"\n\n(finished in {(time_end - time_begin):.1f}s)")


if __name__ == "__main__":
    main()
