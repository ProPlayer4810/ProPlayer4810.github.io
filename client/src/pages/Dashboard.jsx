import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import ScoreRing from "../components/ScoreRing.jsx";
import MacroRow from "../components/MacroRow.jsx";
import { useUser } from "../context/UserContext.jsx";

const BREAKDOWN_LABELS = {
  nutrition: "Nutrition",
  protein: "Protein",
  hydration: "Hydration",
  activity: "Activity",
  sleep: "Sleep",
  consistency: "Consistency",
};

export default function Dashboard() {
  const { user } = useUser();
  const [scoreData, setScoreData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(null);
  const [aiProvider, setAiProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getBalanceScore(), api.getMeals(), api.health()])
      .then(([score, mealsData, health]) => {
        setScoreData(score);
        setMeals(mealsData);
        setAiEnabled(health.aiEnabled);
        setAiProvider(health.aiProvider);
      })
      .finally(() => setLoading(false));
  }, []);

  const PROVIDER_LABELS = { anthropic: "Claude", openai: "OpenAI", groq: "Groq" };
  const providerLabel = PROVIDER_LABELS[aiProvider] || null;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Namaste{user ? `, ${user.name}` : ""} 👋</div>
        <div className="page-subtitle">Here's how your day is looking with Zaikora.</div>
      </div>

      {aiEnabled === false && (
        <div className="alert alert-info">
          Running in rule-based mode (no AI key set on the server). Suggestions use Zaikora's local Indian
          food database — add <code>ANTHROPIC_API_KEY</code> or <code>OPENAI_API_KEY</code> to{" "}
          <code>server/.env</code> for smarter, open-ended results.
        </div>
      )}

      {aiEnabled && providerLabel && (
        <div className="alert alert-ai">✨ AI engine: {providerLabel}</div>
      )}

      {loading || !scoreData ? (
        <div className="card">Loading your Zaikora Score…</div>
      ) : (
        <div className="section card score-ring-wrap">
          <ScoreRing score={scoreData.score} />
          <div>
            <h2>Zaikora Score: {scoreData.score}/100</h2>
            <p>{scoreData.message}</p>
            <MacroRow {...scoreData.totals} />
            <div className="chip-row" style={{ marginTop: 12 }}>
              {Object.entries(scoreData.breakdown).map(([key, value]) => (
                <span className="tag tag-secondary" key={key}>
                  {BREAKDOWN_LABELS[key]}: {value}
                </span>
              ))}
            </div>
            <p style={{ marginTop: 8 }}>🔥 Current streak: {scoreData.streak} day(s)</p>
          </div>
        </div>
      )}

      <div className="section">
        <h3>Today's meals</h3>
        {meals.length === 0 ? (
          <div className="card empty-state">
            No meals logged yet today. <Link to="/tracker">Log your first meal →</Link>
          </div>
        ) : (
          <div className="card-grid">
            {meals.map((meal) => (
              <div className="card" key={meal.id}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>
                  {new Date(meal.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                  {meal.input_type}
                </div>
                {meal.items.map((item) => (
                  <div key={item.id} style={{ fontWeight: 600 }}>
                    {item.dish_name}{" "}
                    <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>
                      ({item.quantity_label})
                    </span>
                  </div>
                ))}
                <MacroRow calories={meal.calories} protein={meal.protein} carbs={meal.carbs} fats={meal.fats} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h3>Quick actions</h3>
        <div className="chip-row">
          <Link className="chip-btn" to="/tracker">🍽️ Log a meal</Link>
          <Link className="chip-btn" to="/taste-match">😋 I'm craving something…</Link>
          <Link className="chip-btn" to="/plate-builder">🍛 Plan tonight's plate</Link>
          <Link className="chip-btn" to="/street-food">🥟 Optimize street food</Link>
        </div>
      </div>
    </div>
  );
}
