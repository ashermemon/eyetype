import clean_dialogs
from datasets import load_dataset, concatenate_datasets
import json 
import random
import os

dailyDialogDataset = load_dataset("OpenRL/daily_dialog")
AACConversationsDataset = load_dataset("willwade/AACConversations")

# Combine splits
dd_splits = []
for split in ["train", "validation", "test"]:
    if split in dailyDialogDataset:
        dd_splits.append(dailyDialogDataset[split])
if dd_splits:
    dailyDialogs = concatenate_datasets(dd_splits)["dialog"]
else:
    dailyDialogs = dailyDialogDataset["train"]["dialog"]


aac_splits = []

for split in ["train", "validation", "test"]:
    if split in AACConversationsDataset:
        aac_splits.append(AACConversationsDataset[split])

if aac_splits:
    aacCombined = concatenate_datasets(aac_splits)
else:
    aacCombined = AACConversationsDataset["train"]

aacDialogs = aacCombined["fully_corrected"]
aacContexts = aacCombined["context_utterances"]
aacLanguage = aacCombined["language_code"]

tripletArray = []

skippedcount = 0

output_dir = "expansionModel/data"
output_filename = "dialog_triplets.json"

tripletsadded = 0
# Process all dialogs in combined splits
for i, dialog in enumerate(dailyDialogs):
    if(tripletsadded < 14000): # ~60%
        
        checkcombined = " ".join(dialog)

        # Skip if profanity
        if clean_dialogs.contains_profanity(checkcombined):
            skippedcount+=1
            continue

        # add 3 variations
        for x in range(min(3, len(dialog))):
            clean_dialogs.add_sentence(dialog, tripletArray, x)
            tripletsadded += 1
            print(f"Done {tripletsadded} triplets") 



    

AACCounter = 0
for i, dialog in enumerate(aacDialogs):
    if aacLanguage[i] in ["en-GB", "en-US", "en-CA", "en"]:
        clean_dialogs.add_sentence(dialog, tripletArray, contextValue=aacContexts[i])
        AACCounter += 1
        print(f"Done {AACCounter} AAC dialogs") #7,824 ~ 34%


# Load Synthetic Data
synthetic_data_path = os.path.join("expansionModel/data", "syntheticData.json")

if os.path.exists(synthetic_data_path):
    with open(synthetic_data_path, "r", encoding="utf-8") as f:
        synthetic_data = json.load(f)
    
    print(f"Loaded {len(synthetic_data)} synthetic samples") #Total: 1,154 ~ 5%
    tripletArray.extend(synthetic_data)
else:
    print(f"Failed. Data not found at {synthetic_data_path}")


# Shuffle the combined data
random.shuffle(tripletArray)

total_len = len(tripletArray) #80%
train_end = int(total_len * 0.8) #10%
val_end = int(total_len * 0.9) #10%

train_data = tripletArray[:train_end]
val_data = tripletArray[train_end:val_end]
test_data = tripletArray[val_end:]

print(f"Total samples: {total_len}")
print(f"Train samples: {len(train_data)}")
print(f"Validation samples: {len(val_data)}")
print(f"Test samples: {len(test_data)}")

# save to JSON
os.makedirs(output_dir, exist_ok=True)

# Train
with open(os.path.join(output_dir, "dialog_triplets_train.json"), "w", encoding="utf-8") as f:
    json.dump(train_data, f, ensure_ascii=False, indent=2)

# Validation 
with open(os.path.join(output_dir, "dialog_triplets_validation.json"), "w", encoding="utf-8") as f:
    json.dump(val_data, f, ensure_ascii=False, indent=2)

# Test
with open(os.path.join(output_dir, "dialog_triplets_test.json"), "w", encoding="utf-8") as f:
    json.dump(test_data, f, ensure_ascii=False, indent=2)


print("complete")

print(str(skippedcount) + " profane sentences filtered out")