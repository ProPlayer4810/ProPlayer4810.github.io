import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import MacroRow from "../components/MacroRow.jsx";
import VoiceInputButton from "../components/VoiceInputButton.jsx";
import PhotoUpload from "../components/PhotoUpload.jsx";

export default function Tracker() {
  const [text, setText] = useState("");
  const [meals, setMeals] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMeals = () => api.getMeals().then(setMeals);

  useEffect(() => {
    loadMeals();
  }, []);

  const submitText = async (e, inputType = "text") => {
    e?.preventDefault?.();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.logMealText(text, inputType);
      setLastResult(result);
      setText("");
      loadMeals();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = useCallback((transcript) => {
    setText(transcript);
  }, []);

  const handlePhoto = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const result = await api.logMealPhoto(formData);
      setLastResult(result);
      if (!result.aiUnavailable) loadMeals();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeMeal = async (id) => {
    await api.deleteMeal(id);
    loadMeals();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Zaika Tracker 🍽️</div>
        <div className="page-subtitle">
          Track meals naturally — click a photo, type casually, or just speak. Try "2 rotis + dal + paneer sabzi".
        </div>
      </div>

      <div className="card section">
        <form onSubmit={submitText}>
          <textarea
            className="textarea"
            placeholder="e.g. 2 rotis + dal + paneer sabzi"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="form-row" style={{ marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" type="submit" disabled={loading || !text.trim()}>
              {loading ? <span className="spinner" /> : "✍️"} Log meal
            </button>
            <VoiceInputButton onResult={handleVoiceResult} />
            <PhotoUpload onUpload={handlePhoto} loading={loading} />
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {lastResult && (
        <div className="card section">
          <h3>{lastResult.aiUnavailable ? "Heads up" : "Nutrition breakdown"}</h3>
          {lastResult.note && <p>{lastResult.note}</p>}
          {lastResult.items?.map((item, i) => (
            <div key={i} className="list-item">
              <div>
                <strong>{item.dishName}</strong>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{item.quantityLabel}</div>
              </div>
              <MacroRow calories={item.calories} protein={item.protein} carbs={item.carbs} fats={item.fats} />
            </div>
          ))}
          {lastResult.totals && (
            <div style={{ marginTop: 12 }}>
              <strong>Total:</strong>
              <MacroRow {...lastResult.totals} />
            </div>
          )}
          {lastResult.goalNote && <p style={{ marginTop: 12 }}>🎯 {lastResult.goalNote}</p>}
        </div>
      )}

      <div className="section">
        <h3>Today's log</h3>
        {meals.length === 0 ? (
          <div className="card empty-state">Nothing logged yet today.</div>
        ) : (
          meals.map((meal) => (
            <div className="card section" key={meal.id} style={{ marginBottom: 12 }}>
              <div className="list-item" style={{ border: "none", paddingBottom: 0 }}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  {new Date(meal.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                  {meal.input_type} · "{meal.raw_input}"
                </div>
                <button className="btn btn-secondary" onClick={() => removeMeal(meal.id)}>
                  ✕ Remove
                </button>
              </div>
              {meal.items.map((item) => (
                <div key={item.id} style={{ marginTop: 6 }}>
                  <strong>{item.dish_name}</strong>{" "}
                  <span style={{ color: "var(--color-text-muted)" }}>({item.quantity_label})</span>
                </div>
              ))}
              <MacroRow calories={meal.calories} protein={meal.protein} carbs={meal.carbs} fats={meal.fats} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
