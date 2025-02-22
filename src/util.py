"""
This module contains some simple wrappers, utility functions and more.
"""

from ollama import chat
from ollama import ChatResponse

from config import THINK_TERMINATOR


def remove_thinking_part(text: str) -> str:
    if THINK_TERMINATOR in text.lower():
        thinking_end = text.lower().find(THINK_TERMINATOR)
        text = text[thinking_end + len(THINK_TERMINATOR) :]

    return text


def prompt_model(
    model_name: str, prompts: "list[dict[str, str]]", remove_thinking: bool = True
) -> str:
    response: ChatResponse = chat(
        model=model_name,
        messages=prompts,
    )

    response_message_text: str = response["message"]["content"]

    if remove_thinking:
        response_message_text = remove_thinking_part(response_message_text)

    return response_message_text.strip()
