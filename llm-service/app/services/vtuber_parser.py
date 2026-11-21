
import re
from typing import List, Tuple
from app.models.vtuber import DialogSegment

# Paralinguistic tag pattern: [chuckle], [laugh], [giggle], [tease], [sigh], [pout], [thinking], [gasp]
PARALINGUISTIC_PATTERN = re.compile(
    r"\[(chuckle|laugh|giggle|tease|sigh|pout|thinking|gasp)\]",
    re.IGNORECASE,
)

# Language wrapper pattern: <ja>...</ja> or <en>...</en>
LANG_TAG_PATTERN = re.compile(
    r"<(ja|en)>(.*?)</\1>",
    re.IGNORECASE | re.DOTALL,
)

# Emotion & Expression Mapping according to Blueprint Section 3.2
EMOTION_MAP = {
    "chuckle": ("joy_playful", "f04_happy_laugh", 450),
    "laugh": ("joy_playful", "f04_happy_laugh", 750),
    "giggle": ("joy_playful", "f04_happy_laugh", 400),
    "tease": ("teasing", "f02_smug", 500),
    "thinking": ("curious", "f05_thinking", 650),
    "sigh": ("embarrassed", "f03_pout", 550),
    "pout": ("embarrassed", "f03_pout", 500),
    "gasp": ("surprised", "f06_surprised", 400),
}

DEFAULT_EMOTION = "friendly"
DEFAULT_EXPRESSION = "f01_smile"


def estimate_speech_duration_ms(text: str) -> int:
    """Estimate spoken audio duration in milliseconds based on character length."""
    cleaned = re.sub(r"[^\w\s]", "", text)
    length = len(cleaned)
    return max(400, int(length * 60 + 250))


def parse_and_coalesce_segments(raw_text: str) -> List[DialogSegment]:
    """Parse raw annotated script into structured dialog segments.

    Example input:
        "Aduh, masa gitu aja lupa sih [chuckle] <ja>daijoubu</ja> kok! Sini aku bantuin."
    Output:
        [
          DialogSegment(type='speech', text='Aduh, masa gitu aja lupa sih', lang='id', ...),
          DialogSegment(type='paralinguistic', paralinguistic_event='chuckle', ...),
          DialogSegment(type='speech', text='daijoubu', lang='ja', ...),
          DialogSegment(type='speech', text='kok! Sini aku bantuin.', lang='id', ...)
        ]
    """
    if not raw_text or not raw_text.strip():
        return []

    text = raw_text.strip()

    # Step 1: Tokenize by language tags and paralinguistic tags
    # We find all matches and their spans
    tokens: List[Tuple[int, int, str, str]] = []  # (start, end, token_type, payload)

    for match in PARALINGUISTIC_PATTERN.finditer(text):
        tokens.append((match.start(), match.end(), "paralinguistic", match.group(1).lower()))

    for match in LANG_TAG_PATTERN.finditer(text):
        lang = match.group(1).lower()
        content = match.group(2).strip()
        tokens.append((match.start(), match.end(), f"lang_{lang}", content))

    # Sort tokens by starting index
    tokens.sort(key=lambda x: x[0])

    segments: List[DialogSegment] = []
    current_pos = 0
    current_emotion = DEFAULT_EMOTION
    current_expression = DEFAULT_EXPRESSION

    for start, end, token_type, payload in tokens:
        # Check if there is plain Indonesian text before this token
        if start > current_pos:
            plain_slice = text[current_pos:start].strip()
            if plain_slice:
                # Clean up any leftover unmatched brackets
                clean_text = re.sub(r"\[.*?\]", "", plain_slice).strip()
                if clean_text:
                    segments.append(
                        DialogSegment(
                            type="speech",
                            text=clean_text,
                            lang="id",
                            emotion=current_emotion,
                            live2d_expression=current_expression,
                            estimated_duration_ms=estimate_speech_duration_ms(clean_text),
                        )
                    )

        if token_type == "paralinguistic":
            event_name = payload
            emotion, expression, dur = EMOTION_MAP.get(
                event_name,
                (DEFAULT_EMOTION, DEFAULT_EXPRESSION, 500),
            )
            # Update state for following speech
            current_emotion = emotion
            current_expression = expression

            segments.append(
                DialogSegment(
                    type="paralinguistic",
                    paralinguistic_event=event_name,
                    emotion=emotion,
                    live2d_expression=expression,
                    estimated_duration_ms=dur,
                )
            )

        elif token_type.startswith("lang_"):
            lang_code = token_type.split("_")[1]
            content = payload
            if content:
                segments.append(
                    DialogSegment(
                        type="speech",
                        text=content,
                        lang=lang_code,  # "ja" or "en"
                        emotion=current_emotion,
                        live2d_expression=current_expression,
                        estimated_duration_ms=estimate_speech_duration_ms(content),
                    )
                )

        current_pos = end

    # Handle any remaining text after the last token
    if current_pos < len(text):
        remaining = text[current_pos:].strip()
        clean_remaining = re.sub(r"\[.*?\]", "", remaining).strip()
        if clean_remaining:
            segments.append(
                DialogSegment(
                    type="speech",
                    text=clean_remaining,
                    lang="id",
                    emotion=current_emotion,
                    live2d_expression=current_expression,
                    estimated_duration_ms=estimate_speech_duration_ms(clean_remaining),
                )
            )

    # Step 2: Coalesce consecutive speech segments of the same language
    coalesced: List[DialogSegment] = []
    for seg in segments:
        if (
            coalesced
            and coalesced[-1].type == "speech"
            and seg.type == "speech"
            and coalesced[-1].lang == seg.lang
            and coalesced[-1].emotion == seg.emotion
            and coalesced[-1].live2d_expression == seg.live2d_expression
        ):
            # Combine texts
            combined_text = f"{coalesced[-1].text} {seg.text}".strip()
            coalesced[-1].text = combined_text
            coalesced[-1].estimated_duration_ms = estimate_speech_duration_ms(combined_text)
        else:
            coalesced.append(seg)

    # If parsing somehow resulted in empty segments (e.g. malformed tags only), fallback
    if not coalesced and text:
        clean_fallback = re.sub(r"\[.*?\]", "", text).strip()
        clean_fallback = re.sub(r"<.*?>", "", clean_fallback).strip()
        if clean_fallback:
            coalesced.append(
                DialogSegment(
                    type="speech",
                    text=clean_fallback,
                    lang="id",
                    emotion=DEFAULT_EMOTION,
                    live2d_expression=DEFAULT_EXPRESSION,
                    estimated_duration_ms=estimate_speech_duration_ms(clean_fallback),
                )
            )

    return coalesced
