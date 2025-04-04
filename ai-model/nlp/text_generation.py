from openai import OpenAI

client = OpenAI(api_key="YOUR_OPENAI_KEY")

def generate_text(prompt):
    response = client.Completion.create(
        model="gpt-4",
        prompt=prompt,
        max_tokens=100
    )
    return response.choices[0].text.strip()
