import json
import re

def fix_grammar(target_sentence):
    """
    Applies heuristic fixes to common grammatical errors in the synthetic data.
    Same logic as V1.
    """
    # 1. Copula/Verb fixes
    # "It cold" -> "It is cold", "That funny" -> "That is funny"
    target_sentence = re.sub(r'\b(It|That|He|She) (too|very|so|really)?\s*(cold|hot|funny|sad|happy|warm|hard|silly|good|bad|wrong|right|okay|worse|better|great)\b', r'\1 is \2 \3', target_sentence, flags=re.IGNORECASE)
    # Fix double "is is" if it happened
    target_sentence = re.sub(r'\bis\s+is\b', 'is', target_sentence, flags=re.IGNORECASE)

    # 2. Specific phrase fixes
    target_sentence = re.sub(r'\bThank it already\b', 'Take it already', target_sentence, flags=re.IGNORECASE)
    target_sentence = re.sub(r'\bI get low\b', 'I am running low', target_sentence, flags=re.IGNORECASE)
    target_sentence = re.sub(r'\bturn me the\b', 'turn on the', target_sentence, flags=re.IGNORECASE)
    target_sentence = re.sub(r'\buncomfortable in chair\b', 'uncomfortable in the chair', target_sentence, flags=re.IGNORECASE)
    target_sentence = re.sub(r'\bIt\'s pain medication\b', 'The pain medication', target_sentence, flags=re.IGNORECASE)
    target_sentence = re.sub(r'\bI think was\b', 'I think it was', target_sentence, flags=re.IGNORECASE)
    target_sentence = re.sub(r'\bshould is a\b', 'is an', target_sentence, flags=re.IGNORECASE)
    target_sentence = re.sub(r'\bIt\'s pain\b', 'The pain', target_sentence, flags=re.IGNORECASE)
    target_sentence = re.sub(r'\bIt\'s too really\b', 'It is really too', target_sentence, flags=re.IGNORECASE)
    
    # 3. Punctuation/Clause separators
    # "No I" -> "No, I", "Yes I" -> "Yes, I", "Wait I" -> "Wait, I"
    target_sentence = re.sub(r'\b(No|Yes|Wait|Oh|Hey|Hi|Look|Stop|Please|Thanks|Sorry)\s+(I|it|that|she|he|we|you)\b', r'\1, \2', target_sentence, flags=re.IGNORECASE)
    # Fix "Hello Doctor" -> "Hello, Doctor" context
    target_sentence = re.sub(r'\b(Hello|Hi|Hey)\s+(Doctor|Nurse|Mom|Dad|Brother|Sister|Grandma|Grandpa)\b', r'\1, \2', target_sentence, flags=re.IGNORECASE)

    # 4. "Not keeping good" -> "Not doing good" / "Not feeling good"
    target_sentence = re.sub(r'\bNot keeping good\b', 'Not feeling good', target_sentence, flags=re.IGNORECASE)

    # Clean up double spaces or punctuation
    target_sentence = re.sub(r'\s+', ' ', target_sentence).strip()
    return target_sentence

def generate_abbreviation_v2(target_sentence, original_abbreviation):
    """
    Regenerates the abbreviation based on the target sentence,
    BUT strictly preserves the punctuation and spacing style of the original abbreviation.
    Also preserves names/tags enclosed in < > or [ ].
    """
    
    # 1. Identify "tags" (names/preserved blocks) in the original abbreviation.
    #    e.g. "<Mom>", "<Dr.Smith>", "[Please wait]"
    #    We want to keep these exactly as they are.
    TAG_PATTERN = r'(?:<[^>]+>|\[[^\]]+\])'
    tags = re.findall(TAG_PATTERN, original_abbreviation)
    
    # If no tags, just process the whole thing
    if not tags:
        return process_segment(target_sentence, original_abbreviation)

    # 2. Map tags to target strings
    # We need to find the corresponding string in target for each tag to split the target sentence correctly.
    target_split_pattern_parts = []
    
    for tag in tags:
        # Determine the content inside the tag that we expect to find in the target
        content = tag
        if tag.startswith('<') and tag.endswith('>'):
            content = tag[1:-1]
        elif tag.startswith('[') and tag.endswith(']'):
            content = tag[1:-1]
            
        # Check case-insensitive match in target
        match = re.search(re.escape(content), target_sentence, re.IGNORECASE)
        if match:
            # We use the actual matched string from target for the split pattern
            target_split_pattern_parts.append(re.escape(match.group(0)))
        else:
            # Try fuzzy match (e.g. "Dr.Smith" -> "Dr. Smith")
            if "." in content:
                spaced_content = content.replace(".", ". ")
                match = re.search(re.escape(spaced_content), target_sentence, re.IGNORECASE)
                if match:
                    target_split_pattern_parts.append(re.escape(match.group(0)))
                    continue
            
            # If truly not found, we skip adding it to split pattern, 
            # meaning it will be treated as part of a larger segment.
            # Fallback: if we can't align tags, we fallback to processing the whole string.
            return process_segment(target_sentence, original_abbreviation)

    # 3. Split Original Abbreviation by tags
    # Keep delimiters to iterate
    # TAG_PATTERN is already good for splitting if we wrap in capturing group
    orig_split_regex = f"({TAG_PATTERN})"
    orig_parts = re.split(orig_split_regex, original_abbreviation)
    
    # 4. Split Target by mapped names/content
    if not target_split_pattern_parts:
         return process_segment(target_sentence, original_abbreviation)
         
    target_split_regex = "(" + "|".join(target_split_pattern_parts) + ")"
    target_parts = re.split(target_split_regex, target_sentence)

    # Verify alignment
    # If counts mismatch, fallback.
    if len(orig_parts) != len(target_parts):
        return process_segment(target_sentence, original_abbreviation)
        
    final_parts = []
    
    for i in range(len(orig_parts)):
        orig_p = orig_parts[i]
        target_p = target_parts[i]
        
        # Check if this part is a Tag (it should match our pattern)
        if re.match(r'^' + TAG_PATTERN + r'$', orig_p):
            # It's a tag! Keep original tag (with brackets).
            final_parts.append(orig_p)
        else:
            # It's a text segment. Process it.
            processed = process_segment(target_p, orig_p)
            final_parts.append(processed)
            
    return "".join(final_parts)

def process_segment(target_text, original_abbr_text):
    """
    Generates abbreviation for target_text but masks punctuation/spacing against original_abbr_text.
    """
    # 1. Analyze Original Structure
    # Capture leading whitespace
    lead_space_match = re.match(r'^(\s*)', original_abbr_text)
    leading_space = lead_space_match.group(1) if lead_space_match else ""
    
    # Capture trailing whitespace
    trail_space_match = re.search(r'(\s*)$', original_abbr_text)
    trailing_space = trail_space_match.group(1) if trail_space_match else ""
    
    # Identify allowed punctuation characters in this segment
    # We map "dot" to "has_dot", etc.
    # "DONT TOUCH PUNCTUATION" -> If orig has NO punctuation, we allow NONE.
    # If orig HAS punctuation, we allow IT.
    allowed_chars = set(c for c in original_abbr_text if not c.isalnum() and not c.isspace())
    
    # 2. Generate Candidate from Target
    # We want letters for every word.
    # We also blindly capture punctuation from target to start with.
    tokens = re.findall(r"[\w']+|[.,!?;]", target_text)
    candidate = ""
    for token in tokens:
        if re.match(r"[.,!?;]", token):
            candidate += token
        else:
            if token and token[0]: # ensure not empty
                candidate += token[0].upper()
            
    # 3. Filter Candidate
    # Keep char if it is alphanumeric.
    # If it is punctuation, ONLY keep if present in Allowed Chars.
    
    filtered_candidate = ""
    for char in candidate:
        if char.isalnum():
            filtered_candidate += char
        elif char in allowed_chars:
            filtered_candidate += char
        # Else skip (it's punctuation not present in original)
        
    # 4. Construct Final
    # We apply the original spacing validly.
    # Note: filtered_candidate might have internal punctuation if allowed.
    # We strictly prefix/suffix with the *original* spacing to allow `<Name>` spacing to be preserved.
    # However, if filtered_candidate is empty (e.g. segment was just space), we might double spaces?
    # If orig was " ", leading=" ", trailing=" ". Result "  "?
    # process_segment(" ", " ") -> allowed={}, candidate="" -> filtered="" -> "  ".
    # Original " " had len 1.
    # If original was purely whitespace, we should maybe just return original whitespace?
    # Or rely on logic.
    # If orig_p is just space, leading space takes it all.
    # `re.match` captures all leading space.
    # `trail` captures all trailing space.
    # If `text` is `" "`, lead=`" "`, trail=`" "`.
    # Result `"  "` (double).
    # Correct logic: Strip original text to find "content".
    stripped_orig = original_abbr_text.strip()
    if not stripped_orig:
        # Segment is only whitespace.
        # Just return it as is (or target's whitespace equivalent? No, keep orig structure).
        return original_abbr_text
    
    # If not empty, apply leading/trailing logic to the FILTERED content.
    return leading_space + filtered_candidate + trailing_space

def main():
    file_path = '/Users/ashermemon/Desktop/ScienceFair/sciencefair/expansionModel/data/syntheticData.json'
    
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    fixed_count = 0
    for item in data:
        original_target = item['target']
        original_abbr = item['abbreviation']
        
        # 1. Fix Grammar
        new_target = fix_grammar(original_target)
        
        # 2. Regenerate Abbreviation V2
        new_abbr = generate_abbreviation_v2(new_target, original_abbr)
        
        if new_target != original_target or new_abbr != original_abbr:
            item['target'] = new_target
            item['abbreviation'] = new_abbr
            fixed_count += 1
            
    print(f"Fixed {fixed_count} items.")
    
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    main()
