
import re
from typing import List, Tuple
from app.models.vtuber import DialogSegment

MOOD_TO_EXPRESSION = {
    "smug": "f02_smug",
    "pout": "f03_pout",
    "laugh": "f04_happy_laugh",
    "thinking": "f05_thinking",
    "warm": "f01_smile",
}

MOOD_PATTERN = re.compile(r"\[mood:(smug|pout|laugh|thinking|warm)\]", re.IGNORECASE)

# Paralinguistic tag pattern: [chuckle], [laugh], [sigh]
PARALINGUISTIC_PATTERN = re.compile(
    r"\[(chuckle|laugh|sigh)\]",
    re.IGNORECASE,
)

SFX_MAP = {
    "chuckle": "assets/audio/sfx/chuckle_01.wav",
    "laugh": "assets/audio/sfx/laugh_01.wav",
    "sigh": "assets/audio/sfx/sigh_01.wav",
}

# Language wrapper pattern: <ja>...</ja> or <en>...</en>
LANG_TAG_PATTERN = re.compile(
    r"<(ja|en)>(.*?)</\1>",
    re.IGNORECASE | re.DOTALL,
)

# Emotion & Expression Mapping according to Blueprint Section 3.2
EMOTION_MAP = {
    "chuckle": ("joy_playful", "f04_happy_laugh", 450),
    "laugh": ("joy_playful", "f04_happy_laugh", 750),
    "sigh": ("embarrassed", "f03_pout", 550),
}

DEFAULT_EMOTION = "friendly"
DEFAULT_EXPRESSION = "f01_smile"

JA_PHONETIC_MAP = {
    "daijoubu": "daijobu",
    "chotto": "cotto",
}


def normalize_phonetics(text: str) -> str:
    def replace_romaji(match: re.Match[str]) -> str:
        inner = match.group(1).strip()
        return JA_PHONETIC_MAP.get(inner.lower(), inner)

    normalized = re.sub(r"<ja>(.*?)</ja>", replace_romaji, text, flags=re.IGNORECASE | re.DOTALL)
    normalized = re.sub(r"</?(?:ja|en)>", "", normalized, flags=re.IGNORECASE)
    normalized = re.sub(
        r"\b(?:daijoubu|chotto)\b",
        lambda match: JA_PHONETIC_MAP.get(match.group(0).lower(), match.group(0)),
        normalized,
        flags=re.IGNORECASE,
    )
    return re.sub(r"\s+", " ", normalized).strip()


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

    # Step 1: Tokenize mood, language, and paralinguistic tags.
    tokens: List[Tuple[int, int, str, str]] = []

    for match in MOOD_PATTERN.finditer(text):
        tokens.append((match.start(), match.end(), "mood", match.group(1).lower()))

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
    current_mood = "warm"
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
                            normalized_text=normalize_phonetics(clean_text),
                            lang="id",
                            mood=current_mood,
                            emotion=current_emotion,
                            live2d_expression=current_expression,
                            estimated_duration_ms=estimate_speech_duration_ms(clean_text),
                        )
                    )

        if token_type == "mood":
            current_mood = payload
            current_emotion = "joy_playful" if payload == "smug" else "curious" if payload == "thinking" else "embarrassed" if payload == "pout" else "joyful" if payload == "laugh" else "friendly"
            current_expression = MOOD_TO_EXPRESSION.get(payload, DEFAULT_EXPRESSION)

        elif token_type == "paralinguistic":
            event_name = payload
            emotion, expression, dur = EMOTION_MAP.get(
                event_name,
                (DEFAULT_EMOTION, DEFAULT_EXPRESSION, 500),
            )
            current_emotion = emotion
            current_expression = expression

            segments.append(
                DialogSegment(
                    type="paralinguistic",
                    paralinguistic_event=event_name,
                    tts_token=f"[{event_name}]",
                    sfx_asset=SFX_MAP[event_name],
                    mood="laugh" if event_name == "laugh" else "smug" if event_name == "chuckle" else "pout",
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
                        normalized_text=normalize_phonetics(content),
                        lang=lang_code,
                        mood=current_mood,
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
                    normalized_text=normalize_phonetics(clean_remaining),
                    lang="id",
                    mood=current_mood,
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
                    normalized_text=normalize_phonetics(clean_fallback),
                    lang="id",
                    mood="warm",
                    emotion=DEFAULT_EMOTION,
                    live2d_expression=DEFAULT_EXPRESSION,
                    estimated_duration_ms=estimate_speech_duration_ms(clean_fallback),
                )
            )

    return coalesced
