import re
import ast

def pick_sentences(str):
    # length filter (3 to 12 words)
    if len(str.split()) < 3 or len(str.split()) > 12:
        return False
    
    return True


PROFANITY = {
    "fuck", "shit", "bitch", "asshole", "bastard",
    "motherfucker", "fucking", "shithead", "sex", "ass"
}

def contains_profanity(text):
    pattern = r"\b(" + "|".join(map(re.escape, PROFANITY)) + r")\b"
    return bool(re.search(pattern, text.lower()))

import ast

def fix_stringy_list(context):
    def flatten(x):
        out = []

        if isinstance(x, list):
            for item in x:
                out.extend(flatten(item))

        elif isinstance(x, str):
            s = x.strip()

      
            if s.startswith("[") and s.endswith("]"):
                try:
                    parsed = ast.literal_eval(s)
                    out.extend(flatten(parsed))
                except Exception:
                    out.append(s)
            else:
                out.append(s)

        return out

    parts = flatten(context)
    return " ".join(p for p in parts if p)

def abbreviate_sentence(sentence):
    # normalize unicode apostrophes
    sentence = sentence.replace("’", "'").replace("‘", "'")

    chars = re.findall(
        r"[A-Za-z]+(?:'[A-Za-z]+)?|\d+|[.,!?]",
        sentence
    )

    abbr = []

    for char in chars:
        if char[0].isalpha():
            abbr.append(char[0].upper())
        elif char.isdigit():
            abbr.append(char)
        elif char in ".,!?":
            abbr.append(char)

    return "".join(abbr)



def add_sentence(dialog, tripletArray, contextNum=-1, contextValue=None):
    targetSentence = ""
    context = ""

    # AAC
    if contextValue is not None:
        context = fix_stringy_list(contextValue)  
        targetSentence = str(dialog).strip()
    
    # DailyDialog
    else:
        if contextNum == 0:
            context = ""
            targetSentence = dialog[0]
        elif contextNum > 0:
            
            context = " ".join([str(s).strip() for s in dialog[:contextNum]])
            targetSentence = dialog[contextNum]

    final_target = targetSentence.strip()
    final_context = context.strip()
    
    if final_target:
        tripletArray.append({
            "context": final_context,
            "abbreviation": abbreviate_sentence(final_target),
            "target": final_target
        })