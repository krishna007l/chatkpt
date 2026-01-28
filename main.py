from flask import Flask, render_template, jsonify, request
import requests
import json

app = Flask(__name__)

OPENROUTER_API_KEY = "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"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api", methods=["POST"])
def qa():
    question = request.json.get("question")

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "openai/gpt-4o-mini",   
            "messages": [
                {"role": "user", "content": question}
            ]
        }
    )

    result = response.json()


    answer = result["choices"][0]["message"]["content"]

    return jsonify({
        "question": question,
        "answer": answer
    })


if __name__ == "__main__":
    app.run(debug=True)
