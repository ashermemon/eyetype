import torch
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    BitsAndBytesConfig,
    EarlyStoppingCallback
)
from trl import SFTTrainer, SFTConfig
import create_prompt
import os

# configuration
model_name = "Qwen/Qwen2.5-3B-Instruct" #3B for final
output_dir = "drive/MyDrive/ModelTraining/eyetype/expansionModel/training/output"

# for QLoRA if needed (run out of memory)

''' bnb_config = BitsAndBytesConfig(
      load_in_4bit=True,
      bnb_4bit_quant_type="nf4",
      bnb_4bit_compute_dtype=torch.float16,
      bnb_4bit_use_double_quant=True,'''

bnb_config = None

# tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)

# 1. Add special tokens for delimiters
special_tokens = ["1user", "1assistant", "1system", "2"]
tokenizer.add_special_tokens({"additional_special_tokens": special_tokens})
tokenizer.pad_token = tokenizer.eos_token

# 2. Update chat template with EOS token
tokenizer.chat_template = """{% for message in messages %}{% if message['role'] == 'user' %}{{ '1user\n' + message['content'] | trim + '2\n' }}{% elif message['role'] == 'system' %}{{ '1system\n' + message['content'] | trim + '2\n' }}{% elif message['role'] == 'assistant' %}{% generation %}{{ '1assistant\n' + message['content'] | trim + '2\n' + eos_token }}{% endgeneration %}{% endif %}{% endfor %}{% if add_generation_prompt %}{{ '1assistant\n' }}{% endif %}"""


dataset = load_dataset(
    "json",
    data_files={
        "train": "drive/MyDrive/ModelTraining/eyetype/expansionModel/data/newData/dialog_triplets_train.json",
        "validation": "drive/MyDrive/ModelTraining/eyetype/expansionModel/data/newData/dialog_triplets_validation.json",
        "test": "drive/MyDrive/ModelTraining/eyetype/expansionModel/data/newData/dialog_triplets_test.json"
    }
)


# map with correct template
dataset = dataset.map(create_prompt.form_prompt, remove_columns=dataset["train"].column_names)


# load model
# Use bfloat16 for A100.Use float16 if on T4.
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    torch_dtype=torch.bfloat16, #bfloat16
    device_map="auto",
    trust_remote_code=True
)

model.resize_token_embeddings(len(tokenizer))


model.gradient_checkpointing_enable()

# model = prepare_model_for_kbit_training(model) for QLoRA
# model.enable_input_require_grads()


# load data

lora_config = LoraConfig(
    r=32,                  
    lora_alpha=64,
    lora_dropout=0.05,
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj"
    ],
    bias="none",
    task_type="CAUSAL_LM"
)


# training args

sft_config = SFTConfig(
    output_dir=output_dir,
    num_train_epochs=3,
    learning_rate=5e-5,
    per_device_train_batch_size=8, #A100
    gradient_accumulation_steps=2, #A100
    logging_steps=10,
    eval_strategy="steps",
    eval_steps=300,
    save_strategy="steps",
    save_steps=300,
    warmup_steps=100,
    max_grad_norm=0.3,
    lr_scheduler_type="cosine",
    report_to="tensorboard",
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    assistant_only_loss=True,       # Only compute loss on assistant tokens
    max_length=256,
    packing=False,
    save_total_limit=2,
)


# trainer
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],
    args=sft_config,
    processing_class=tokenizer,
    data_collator=None,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=3)],
    peft_config=lora_config
)

trainer.model.print_trainable_parameters()

trainer.train()
trainer.save_model(output_dir)
