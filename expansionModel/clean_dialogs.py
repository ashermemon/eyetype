import re

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


import re

def abbreviate_sentence(sentence):

    chars = re.findall(r"[a-zA-Z]+(?:'[a-zA-Z]+)?|\d+|[.,!?]", sentence)
    
    abbrchars = []
    for char in chars:
        if re.match(r"[a-zA-Z]", char):
            abbrchars.append(char[0].upper())
        elif char.isdigit():
            abbrchars.append(char)
        elif char in ".!?,":

            abbrchars.append(char)

    return "".join(abbrchars)





def add_sentence(dialog, tripletArray, contextNum):


    if(contextNum == 0): # conversation starters
        context = ""
        targetSentence = dialog[0]
    else:
        context = "".join(dialog[i] for i in range(contextNum))
        targetSentence = dialog[contextNum]
    

    tripletArray.append({
    "context": context,
    "abbreviation": abbreviate_sentence(targetSentence),
    "target": targetSentence
    })
