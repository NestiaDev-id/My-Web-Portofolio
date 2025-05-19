from transformers import pipeline

def get_hf_pipeline(model_name="distilbert-base-uncased"):
    return pipeline("feature-extraction", model=model_name)
