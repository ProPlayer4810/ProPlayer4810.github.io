import { useState } from "react";
import { api } from "../api/client";
import MacroRow from "../components/MacroRow.jsx";
import VoiceInputButton from "../components/VoiceInputButton.jsx";

const PROMPTS = [
  "I want something spicy and crunchy",
  "Craving something sweet",
  "I want something creamy and rich",
  "I feel like eating something fried",
];

export default function TasteMatch() {
  const [craving, setCraving] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e, value) => {
    e?.preventDefault?.();
    const query = value ?? craving;
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.tasteMatch(query);
      setResult(data);
      setCraving(query);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Taste Match AI 😋</div>
        <div className="page-subtitle">
          Not "don't eat this" — Zaikora finds ways to satisfy the same craving, smarter. Keep the Zaika,
          improve the lifestyle.
        </div>
      </div>

      <div className="card section">
        <form onSubmit={submit}>
          <div className="form-row">
            <input
              className="input"
              placeholder="I want something spicy and crunchy…"
              value={craving}
              onChange={(e) => setCraving(e.target.value)}
            />
            <VoiceInputButton onResult={(t) => submit(null, t)} />
            <button className="btn btn-primary" type="submit" disabled={loading || !craving.trim()}>
              {loading ? <span className="spinner" /> : "🔍"} Find match
            </button>
          </div>
        </form>
        <div className="chip-row">
          {PROMPTS.map((p) => (
            <button key={p} className="chip-btn" onClick={() => submit(null, p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="section">
          <div className="card card-ai" style={{ marginBottom: 16 }}>
            <span className="tag tag-ai" style={{ marginBottom: 8 }}>✨ Zaikora AI</span>
            <p style={{ margin: 0, color: "var(--color-text)" }}>{result.understanding}</p>
          </div>
          <div className="card-grid">
            {result.suggestions?.map((s, i) => (
              <div className="card" key={i}>
                <h4>{s.dishName}</h4>
                <p>{s.reason}</p>
                <MacroRow calories={s.calories} protein={s.protein} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
