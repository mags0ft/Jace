"""
This module contains some simple wrappers, utility functions and more.
"""

from ollama import chat
from ollama import ChatResponse

from config import FINALISM_PHRASES, THINK_TERMINATOR


def remove_thinking_part(text: str) -> str:
    """
    Remove the "<think>" and "</think>" tags, as well as the text those
    contain, in order to only show the result of the Chain-of-Thought model's
    thinking process to the end user and other council members.
    """

    if THINK_TERMINATOR in text.lower():
        thinking_end = text.lower().find(THINK_TERMINATOR)
        text = text[thinking_end + len(THINK_TERMINATOR) :]

    return text


def remove_finalism(text: str) -> str:
    """
    Removes "finalism"-like phrases that make a work-in-progress-solution
    appear like it's final already.
    """

    for phrase in FINALISM_PHRASES:
        text = text.replace(phrase, "")
        text = text.replace(phrase.upper(), "")
        text = text.replace(phrase.title(), "")
        text = text.replace(phrase.capitalize(), "")

    return text


def prompt_model(
    model_name: str,
    prompts: "list[dict[str, str]]",
    remove_thinking: bool = True,
) -> str:
    """
    A tiny wrapper function to query a specific model with a prompt quickly.
    Additionally, `remove_thinking` is - per default - specified as `True` to
    trim away the thought process of Chain-of-Thought LLMs.
    """

    response: ChatResponse = chat(
        model=model_name,
        messages=prompts,
    )

    response_message_text: str = response["message"]["content"]

    if remove_thinking:
        response_message_text = remove_thinking_part(response_message_text)

    return response_message_text.strip()
