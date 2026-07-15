import { useState } from "react";
import { api } from "../api/client";
import MacroRow from "../components/MacroRow.jsx";
import VoiceInputButton from "../components/VoiceInputButton.jsx";

export default function FamilyFood() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.familyFood(description);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Family Food Mode 👨‍👩‍👧</div>
        <div className="page-subtitle">
          No separate "fitness meals" needed. Tell Zaikora what the family is eating.
        </div>
      </div>

      <div className="card section">
        <form onSubmit={submit}>
          <div className="form-row">
            <input
              className="input"
              placeholder='e.g. "Mom made rajma chawal"'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <VoiceInputButton onResult={(t) => setDescription(t)} />
            <button className="btn btn-primary" type="submit" disabled={loading || !description.trim()}>
              {loading ? <span className="spinner" /> : "🍲"} Get guidance
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="card section">
          <h3>{result.dish}</h3>
          <p><strong>Ideal quantity:</strong> {result.quantitySuggestion}</p>
          <MacroRow {...result.nutritionEstimate} />
          <p style={{ marginTop: 12 }}>🎯 {result.balancingAdvice}</p>
        </div>
      )}
    </div>
  );
}
