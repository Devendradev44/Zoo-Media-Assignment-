import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter text");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      // ✅ NEW: Validate response structure
      if (!data.summary || !data.keyPoints || !data.sentiment) {
        alert("Invalid response from server");
        return;
      }

      if (data.error) {
        alert(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>AI Text Summarizer</h1>

      <textarea
        rows="6"
        cols="50"
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      <br /><br />

      {loading && <p>Analyzing your text...</p>}

      {result && (
        <div>
          <h3>Summary:</h3>
          <p>{result.summary}</p>

          <h3>Key Points:</h3>
          <ul style={{ listStylePosition: "inside", textAlign: "center" }}>
            {result.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>

          <h3>Sentiment:</h3>
          <p>{result.sentiment.toLowerCase()}</p>
        </div>
      )}
    </div>
  );
}

export default App;