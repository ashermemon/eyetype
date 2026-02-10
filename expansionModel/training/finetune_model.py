import torch
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    BitsAndBytesConfig
)
from trl import SFTTrainer
import create_prompt
import os

# configuration
model_name = "Qwen/Qwen2.5-7B-Instruct"
output_dir = "expansionModel/training/output"

# for QLoRA if needed (run out of memory)

''' bnb_config = BitsAndBytesConfig(
      load_in_4bit=True,
      bnb_4bit_quant_type="nf4",
      bnb_4bit_compute_dtype=torch.float16,
      bnb_4bit_use_double_quant=True,'''

bnb_config = None

# tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token 

# load model
# Use bfloat16 for A100.Use float16 if on T4.
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    torch_dtype=torch.bfloat16, 
    device_map="auto",
    trust_remote_code=True
)


model.gradient_checkpointing_enable()

# model = prepare_model_for_kbit_training(model) for QLoRA
# model.enable_input_require_grads()

# LoRA config
peft_config = LoraConfig(
    r=32,
    lora_alpha=64,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)


# load data
dataset = load_dataset(
    "json",
    data_files={
        "train": "expansionModel/data/dialog_triplets_train.json",
        "validation": "expansionModel/data/dialog_triplets_validation.json",
        "test": "expansionModel/data/dialog_triplets_test.json"
    }
)

# format all data
def formatting_prompts_func(example):
    if isinstance(example["context"], list):
        messages_list = []
        for i in range(len(example["context"])):
            item = {
                "context": example["context"][i],
                "abbreviation": example["abbreviation"][i],
                "target": example["target"][i]
            }
            messages = create_prompt.form_prompt(item) 
            messages_list.append(messages)  
        return messages_list
    else:
        messages = create_prompt.form_prompt(example) 
        return messages




# training args
training_args = TrainingArguments(
    
    output_dir=output_dir,
    per_device_train_batch_size=8, 
    gradient_accumulation_steps=2,
    learning_rate=8e-5,
    logging_steps=10,
    bf16=True, # Use bf16 for A100 (Better than fp16)
    optim="paged_adamw_32bit",
    evaluation_strategy="steps",
    eval_steps=300,
    save_strategy="steps",
    save_steps=300,
    warmup_steps=100,
    max_grad_norm=0.3,
    num_train_epochs=3,
    lr_scheduler_type="cosine",
    report_to="none"
)

# trainer
trainer = SFTTrainer(
    model=model,
    peft_config=peft_config,
    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],
    args=training_args,
    formatting_func=formatting_prompts_func,
    completion_only_loss=True,
    data_collator=None,
    max_seq_length=256,
    packing=False
)

trainer.model.print_trainable_parameters()

# Test a batch
batch = trainer.get_train_dataloader().__iter__().__next__()
print("Labels shape:", batch["labels"].shape)
print("Non -100 labels (should only be assistant tokens):", 
      (batch["labels"] != -100).sum().item())
print("Sample labels:", batch["labels"][0][:20].tolist())


# trainer.train() 
# trainer.save_model(output_dir)

