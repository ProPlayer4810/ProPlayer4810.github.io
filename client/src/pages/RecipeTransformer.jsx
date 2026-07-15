import { useState } from "react";
import { api } from "../api/client";

const EXAMPLES = ["Maggi", "Paratha", "Butter Chicken", "Biryani"];

export default function RecipeTransformer() {
  const [dishName, setDishName] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e, value) => {
    e?.preventDefault?.();
    const dish = value ?? dishName;
    if (!dish.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.transformRecipe(dish);
      setResult(data);
      setDishName(dish);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Zaika Remix 🔄</div>
        <div className="page-subtitle">
          Turns favourite foods into goal-friendly versions. Same taste, smarter ingredients.
        </div>
      </div>

      <div className="card section">
        <form onSubmit={submit}>
          <div className="form-row">
            <input
              className="input"
              placeholder="e.g. Maggi, Paratha, Butter Chicken…"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={loading || !dishName.trim()}>
              {loading ? <span className="spinner" /> : "🔄"} Transform
            </button>
          </div>
        </form>
        <div className="chip-row">
          {EXAMPLES.map((ex) => (
            <button key={ex} className="chip-btn" onClick={() => submit(null, ex)}>
              {ex}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="card section">
          <div className="tag" style={{ marginBottom: 8 }}>{result.dish}</div>
          <h3>→ {result.transformedName}</h3>
          <ul>
            {result.swaps?.map((s, i) => (
              <li key={i} style={{ marginBottom: 6 }}>{s}</li>
            ))}
          </ul>
          <p style={{ fontStyle: "italic" }}>{result.macroNote}</p>
        </div>
      )}
    </div>
  );
}
