import { useEffect, useState } from "react";
import { api } from "../api/client";
import MacroRow from "../components/MacroRow.jsx";
import { useUser } from "../context/UserContext.jsx";

export default function Regional() {
  const { user } = useUser();
  const [regions, setRegions] = useState([]);
  const [selected, setSelected] = useState("");
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    api.getRegions().then((r) => {
      setRegions(r);
      const initial = user?.region && r.includes(user.region) ? user.region : r[0];
      setSelected(initial || "");
    });
  }, [user]);

  useEffect(() => {
    if (selected) api.getRegionalFoods(selected).then(setFoods);
  }, [selected]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Regional Food Intelligence 🗺️</div>
        <div className="page-subtitle">
          Zaikora understands India's food diversity and adapts recommendations to your normal food style.
        </div>
      </div>

      <div className="chip-row">
        {regions.map((r) => (
          <button
            key={r}
            className="chip-btn"
            style={r === selected ? { background: "var(--color-primary-soft)", borderColor: "var(--color-primary)" } : undefined}
            onClick={() => setSelected(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="card-grid section">
        {foods.map((f) => (
          <div className="card" key={f.id}>
            <h4>{f.name}</h4>
            <div className="chip-row" style={{ margin: "4px 0" }}>
              <span className="tag">{f.category}</span>
              <span className="tag tag-secondary">{f.isVeg ? "Veg" : "Non-veg"}</span>
            </div>
            <p style={{ fontSize: 13 }}>{f.servingLabel}</p>
            <MacroRow calories={f.calories} protein={f.protein} carbs={f.carbs} fats={f.fats} />
          </div>
        ))}
        {foods.length === 0 && <div className="empty-state">No dishes found for this region yet.</div>}
      </div>
    </div>
  );
}
