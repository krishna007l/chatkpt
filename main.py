from flask import Flask, render_template, jsonify, request
from openai import OpenAI


app = Flask(__name__)

# OpenAI client (use env variable if possible)
client = OpenAI(api_key="enter api key")

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api", methods=["GET", "POST"])
def qa():
    if request.method == "POST":
        question = request.json.get("question")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": question}
            ]
        )

        answer = response.choices[0].message.content

        return jsonify({
            "question": question,
            "answer": answer
        })

    return jsonify({
        "result": "Ask me anything!"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5001)
