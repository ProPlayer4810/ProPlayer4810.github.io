import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function StreetFood() {
  const [foods, setFoods] = useState([]);
  const [customDish, setCustomDish] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getStreetFoods().then(setFoods);
  }, []);

  const optimize = async (dishName) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.optimizeStreetFood(dishName);
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
        <div className="page-title">Street Food Optimizer 🥟</div>
        <div className="page-subtitle">
          Enjoy Indian street food intelligently — pani puri, pav bhaji, chaat, momos, rolls, vada pav, and more.
        </div>
      </div>

      <div className="card section">
        <div className="chip-row">
          {foods.map((f) => (
            <button key={f.id} className="chip-btn" onClick={() => optimize(f.name)}>
              {f.name}
            </button>
          ))}
        </div>
        <div className="form-row" style={{ marginTop: 12 }}>
          <input
            className="input"
            placeholder="Or type a street food (e.g. vada pav)"
            value={customDish}
            onChange={(e) => setCustomDish(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => optimize(customDish)}
            disabled={loading || !customDish.trim()}
          >
            {loading ? <span className="spinner" /> : "🥟"} Optimize
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="card section">
          {!result.found ? (
            <p>{result.message}</p>
          ) : (
            <>
              <h3>{result.dishName}</h3>
              <p style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>{result.summary}</p>
              <div className="section">
                <strong>✔ Recommended portion</strong>
                <p>{result.recommendedPortion}</p>
              </div>
              <div className="section">
                <strong>✔ Healthier customization</strong>
                <p>{result.healthierCustomization}</p>
              </div>
              <div className="section">
                <strong>✔ Balance your day</strong>
                <p>{result.balancingTip}</p>
              </div>
              <p>🎯 {result.goalNote}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
