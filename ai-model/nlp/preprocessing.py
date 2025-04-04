import re
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

def clean_text(text):
    text = text.lower()
    text = re.sub(r'\W+', ' ', text)  # Hapus karakter non-alphabet
    words = text.split()
    words = [word for word in words if word not in stopwords.words('english')]  # Hapus stopwords
    return ' '.join(words)
