import clean_dialogs
from datasets import load_dataset
import json 
import random
import os

dailyDialogDataset = load_dataset("OpenRL/daily_dialog")
AACConversationsDataset = load_dataset("willwade/AACConversations")

dailyDialogs = dailyDialogDataset["train"]["dialog"]
aacTrain = AACConversationsDataset["train"]

aacDialogs = aacTrain["fully_corrected"]
aacContexts = aacTrain["context_utterances"]
aacLanguage = aacTrain["language_code"]

tripletArray = []

skippedcount = 0

output_dir = "expansionModel/data"
output_filename = "daily_dialog_triplets.json"

# Process all dialogs in train split
for i, dialog in enumerate(dailyDialogs):
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

AACCounter = 0
for i, dialog in enumerate(aacDialogs):
    if aacLanguage[i] in ["en-GB", "en-US", "en-CA", "en"]:
        clean_dialogs.add_sentence(dialog, tripletArray, contextValue=aacContexts[i])
        AACCounter += 1
        print(f"Done {AACCounter} AAC dialogs")


# Shuffle the combined data
random.shuffle(tripletArray)

# save to JSON
os.makedirs(output_dir, exist_ok=True)

file_path = os.path.join(output_dir, output_filename)

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(tripletArray, f, ensure_ascii=False, indent=2)


print("complete")

print(str(skippedcount) + " profane sentences filtered out")