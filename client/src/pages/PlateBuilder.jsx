import { useState } from "react";
import { api } from "../api/client";
import MacroRow from "../components/MacroRow.jsx";

export default function PlateBuilder() {
  const [desiredDish, setDesiredDish] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!desiredDish.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.buildPlate(desiredDish);
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
        <div className="page-title">Zaikora Plate Builder 🍛</div>
        <div className="page-subtitle">Plan your meal before eating it — keep what you want, balance the rest.</div>
      </div>

      <div className="card section">
        <form onSubmit={submit}>
          <div className="form-row">
            <input
              className="input"
              placeholder='e.g. "I want dosa tonight"'
              value={desiredDish}
              onChange={(e) => setDesiredDish(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={loading || !desiredDish.trim()}>
              {loading ? <span className="spinner" /> : "🍽️"} Build my plate
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="card section">
          <h3>✔ {result.preferredFood}</h3>
          <p><strong>Add:</strong></p>
          <ul>
            {result.addOns?.map((a, i) => (
              <li key={i}>✔ {a}</li>
            ))}
          </ul>
          <p style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>{result.tip}</p>
          {result.estimatedNutrition && <MacroRow {...result.estimatedNutrition} />}
          {result.goalNote && <p style={{ marginTop: 12 }}>🎯 {result.goalNote}</p>}
        </div>
      )}
    </div>
  );
}
