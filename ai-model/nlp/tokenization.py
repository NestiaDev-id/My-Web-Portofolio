from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("gpt-4")

def tokenize_text(text):
    tokens = tokenizer(text, return_tensors="pt")
    return tokens
