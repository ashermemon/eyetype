import json
import re
import os
import ssl
import nltk
from nltk.corpus import names

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

try:
    nltk.data.find('corpora/names')
except LookupError:
    nltk.download('names')

BLACKLIST = {
    "Apple", "Mac", "Dad", "Mom", "Doctor", "Nurse", "Canada", "America", "London", 
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
    "Pool", "Hospital", "School", "University", "Restaurant", "Hotel",
    "I", "I'm", "He", "She", "It", "They", "We", "You", "Who", "What", "Where", "When", "Why", "How", "Hope", "Saw", "See", "Spot",
    "Yes", "No", "Thanks", "Thank", "Please", "Wait", "Hi", "Hey", "Hello", "Oh", "Look", "Stop",
    "India", "Indian", "Chinese", "Mexican", "Asian", "Traditional", "Cultural",
    "Heritage", "Community", "Society", "People", "Maybe", "Sounds", "Exactly", "Absolutely", "I", "I'll", "Don", "Don't",
    "Feeling", "Ready", "Different", "Everything", "Happy", "Wake", "Privacy", "Truth", 
    "Life", "Love", "Sunlight", "Music", "Diverse", "Just", "Deal", "Good", "Bad", "Right", "Wrong",
    "Something", "Anything", "Nothing", "Someone", "Anyone", "Noone", "Everyone", "Nice", "Classic", "Cool", "Eid", "Temple", "Mosque", "Synagogue", "Church", "Door"
}

# Load Names from NLTK
MALE_NAMES = set(names.words('male.txt'))
FEMALE_NAMES = set(names.words('female.txt'))
ALL_NAMES = MALE_NAMES.union(FEMALE_NAMES)

# Add some specific ones
ADDITIONAL_NAMES = {
    "Yousif", "Mohammed", "Ava", "Emma", "Jacob", "Mia", "Sarah", "Ethan", 
    "Olivia", "Hannah", "John", "Jack", "Bill", "Ted", "Joy", "Mike", "Alice",
    "Jason", "Dick", "James", "Frank", "Andy", "Ryan", "Henry", "Ally", "Mabel"
}
ALL_NAMES = ALL_NAMES.union(ADDITIONAL_NAMES)

TITLES = {"Dr.", "Mr.", "Mrs.", "Ms.", "Professor", "Dr"}

def is_actual_name(word, is_first_word=False):
    """
    Checks if a word is likely an actual human name and not a place/title/pronoun.
    """

    clean_word = re.sub(r'[^\w]', '', word)
    if not clean_word:
        return False
    

    if not clean_word[0].isupper():
        return False
        

    if clean_word in BLACKLIST:
        return False
        
   
    if is_first_word:
    
        if clean_word in {"The", "This", "That", "There", "Where", "When", "What", "How", "Who", "If", "Why"}:
            return False
            

    if clean_word in ALL_NAMES:
        return True
        
    return False

def format_abbreviation(abbreviation, target):
    """
    Aligns target words and abbreviation characters to find names and wrap them in <>.
    Preserves existing tags and ensures space before and after ALL tags.
    """
    
    target_tokens = re.findall(r"(?:Dr\.|Mr\.|Mrs\.|Ms\.|[\w’']+)|[.,!?;:]", target)
    

    abbr_segments = []
  
    for match in re.finditer(r'(<[^>]+>|.| )', abbreviation):
        seg = match.group(0)
        abbr_segments.append(seg)

   
    processed_tokens = []
    i = 0
    while i < len(target_tokens):
        token = target_tokens[i]
        is_first = (i == 0)
        
     
        if token in TITLES and i + 1 < len(target_tokens) and target_tokens[i+1][0].isupper():
            processed_tokens.append({"text": f"{token} {target_tokens[i+1]}", "is_name": True, "count": 2})
            i += 2
       
        elif is_actual_name(token, is_first_word=is_first):
            combined_name = [token]
            j = i + 1
            while j < len(target_tokens) and is_actual_name(target_tokens[j]):
                combined_name.append(target_tokens[j])
                j += 1
            
            processed_tokens.append({"text": " ".join(combined_name), "is_name": True, "count": len(combined_name)})
            i = j
        else:
            processed_tokens.append({"text": token, "is_name": False, "count": 1})
            i += 1


    new_segments = []
    seg_ptr = 0
    
    for token_info in processed_tokens:
        text = token_info["text"]
        is_name = token_info["is_name"]
        word_count = token_info["count"]

     
        while seg_ptr < len(abbr_segments) and abbr_segments[seg_ptr] == ' ':
            new_segments.append(' ')
            seg_ptr += 1
            
        if seg_ptr >= len(abbr_segments):
            break

        curr_seg = abbr_segments[seg_ptr]
        

        if curr_seg.startswith('<') and curr_seg.endswith('>'):
            if not new_segments or new_segments[-1] != ' ':
                new_segments.append(' ')
            new_segments.append(curr_seg)
            new_segments.append(' ')
            seg_ptr += 1
            continue

       
        first_char = text[0].upper()
        curr_char = curr_seg.upper()
        
        is_match = (curr_char == first_char) or (curr_char in ".,!?;:" and text in ".,!?;:")
        if not is_match and text.startswith("Dr") and curr_char == 'D':
            is_match = True

        if is_match:
            if is_name:
        
                if not new_segments or new_segments[-1] != ' ':
                    new_segments.append(' ')
                
                new_segments.append(f"<{text}>")
                
         
                seg_ptr += 1
                if word_count > 1:
                    consumed_in_abbr = 1
                    words = text.split()
                    while consumed_in_abbr < len(words) and seg_ptr < len(abbr_segments):
                        if abbr_segments[seg_ptr] == ' ':
                            seg_ptr += 1
                            continue
                        next_char = words[consumed_in_abbr][0].upper()
                        if abbr_segments[seg_ptr].upper() == next_char:
                            seg_ptr += 1
                            consumed_in_abbr += 1
                        else:
                            break
                
         
                new_segments.append(' ')
            else:
                new_segments.append(curr_seg)
                seg_ptr += 1
        else:
         
            pass

    while seg_ptr < len(abbr_segments):
        new_segments.append(abbr_segments[seg_ptr])
        seg_ptr += 1
        
   
    final_abbr = "".join(new_segments)
    final_abbr = re.sub(r' +', ' ', final_abbr)
    return final_abbr

def process_file(filepath):
    print(f"Processing {os.path.basename(filepath)}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    modified_count = 0
    for item in data:
        original_abbr = item['abbreviation']
        target = item['target']
        
        new_abbr = format_abbreviation(original_abbr, target)
        
        if new_abbr != original_abbr:
            item['abbreviation'] = new_abbr
            modified_count += 1
            
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Updated {modified_count} entries in {os.path.basename(filepath)}.")

def main():
    data_dir = "/Users/ashermemon/Desktop/ScienceFair/sciencefair/expansionModel/data/newData"
    files = [
        "dialog_triplets_train.json",
        "dialog_triplets_test.json",
        "dialog_triplets_validation.json"
    ]
    
    for f in files:
        path = os.path.join(data_dir, f)
        if os.path.exists(path):
            process_file(path)
        else:
            print(f"File not found: {path}")

if __name__ == "__main__":
    main()

def process_file(filepath):
    print(f"Processing {os.path.basename(filepath)}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    modified_count = 0
    for item in data:
        original_abbr = item['abbreviation']
        target = item['target']
        
        new_abbr = format_abbreviation(original_abbr, target)
        
        if new_abbr != original_abbr:
            item['abbreviation'] = new_abbr
            modified_count += 1
            
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Updated {modified_count} entries in {os.path.basename(filepath)}.")

def main():
    data_dir = "/Users/ashermemon/Desktop/ScienceFair/sciencefair/expansionModel/data/newData"
    files = [
        "dialog_triplets_train.json",
        "dialog_triplets_test.json",
        "dialog_triplets_validation.json"
    ]
    
    for f in files:
        path = os.path.join(data_dir, f)
        if os.path.exists(path):
            process_file(path)
        else:
            print(f"File not found: {path}")

if __name__ == "__main__":
    main()
