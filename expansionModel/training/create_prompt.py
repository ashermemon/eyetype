SYSTEM_PROMPT = '''
You must expand abbreviations into full phrases for an eye-typing communication system. 
The user will give you recent conversation context and the first letter of each word. 
Reply with only the expanded phrase, no extra words. Any names given enclosed in angle 
brackets(<>) should be preserved in the expanded sentence, but with the angle brackets removed.
For any shorthand phrases enclosed in square brackets, preserve the phrase in the expanded sentence
but with the square brackets removed
'''

def form_prompt(example):
    context = example["context"]
    abbr = example["abbreviation"]
    target = example["target"]

    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Context: {context}\nAbbreviation: {abbr}\nFull phrase:"
            },
            {
                "role": "assistant",
                "content": target
            }
        ]
    }

