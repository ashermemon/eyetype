import clean_dialogs
from datasets import load_dataset
import json 
import os


dataset = load_dataset("OpenRL/daily_dialog")

trainsplit = dataset["train"]

dialogs = trainsplit["dialog"]

tripletArray = []

skippedcount = 0

# Process all dialogs in train split
for i, dialog in enumerate(dialogs):
    # combine all dialogue to check for profanity
    checkcombined = " ".join(dialog)

    # Skip if profanity
    if clean_dialogs.contains_profanity(checkcombined):
        skippedcount+=1
        continue

    # add 3 variations
    for x in range(min(3, len(dialog))):
        clean_dialogs.add_sentence(dialog, tripletArray, x)


    print(f"Done {i+1} dialogs")

# save to JSON for training after
with open("daily_dialog_triplets.json", "w", encoding="utf-8") as f:
    json.dump(tripletArray, f, ensure_ascii=False, indent=2)

print("complete")

print(str(skippedcount) + " profane sentences filtered out")
print(os.getcwd()) 