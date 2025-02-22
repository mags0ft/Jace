"""
This module just provides a small logger.
"""

from logging import Logger, Formatter, StreamHandler, FileHandler
from sys import stdout

from config import ENABLE_LOGGING_OUTPUT

logger = Logger("jace-log", 0)

if ENABLE_LOGGING_OUTPUT:
    formatter = Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    # handler = StreamHandler(stdout)
    handler = FileHandler("./logs/log.txt")
    handler.setFormatter(formatter)

    logger.addHandler(handler)
