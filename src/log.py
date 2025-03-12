"""
This module just provides a small logger.
"""

from logging import Logger, Formatter, FileHandler

from config import ENABLE_LOGGING_OUTPUT

# Create a logger for the Jace application
logger = Logger("jace", 0)

if ENABLE_LOGGING_OUTPUT:
    # Only if we want to actually enable logging output, create and add a
    # Handler and formatter.

    formatter = Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # handler = StreamHandler(stdout)
    handler = FileHandler("./logs/log.txt")
    handler.setFormatter(formatter)

    logger.addHandler(handler)
