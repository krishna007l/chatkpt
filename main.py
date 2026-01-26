from flask import Flask, render_template, jsonify, request
from openai import OpenAI


app = Flask(__name__)
client = OpenAI(api_key="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")

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
