import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useUser } from "../context/UserContext.jsx";

const GOALS = ["lose fat", "gain muscle", "maintain weight", "improve fitness", "improve eating habits"];

export default function Settings() {
  const { user, updateUser } = useUser();
  const [regions, setRegions] = useState([]);
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getRegions().then(setRegions);
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        goal: user.goal,
        region: user.region,
        dietType: user.diet_type,
        dailyCalorieTarget: user.daily_calorie_target,
        dailyProteinTarget: user.daily_protein_target,
        dailyHydrationTargetMl: user.daily_hydration_target_ml,
      });
    }
  }, [user]);

  if (!form) return <div className="card">Loading settings…</div>;

  const update = (key) => (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    await updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Settings ⚙️</div>
        <div className="page-subtitle">Goal Personalization — Zaikora tailors advice to who you are.</div>
      </div>

      <form className="card section" onSubmit={save}>
        <div className="card-grid">
          <label>
            Name
            <input className="input" value={form.name} onChange={update("name")} />
          </label>
          <label>
            Goal
            <select className="select" value={form.goal} onChange={update("goal")}>
              {GOALS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
          <label>
            Usual region / cuisine
            <select className="select" value={form.region} onChange={update("region")}>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            Diet type
            <select className="select" value={form.dietType} onChange={update("dietType")}>
              <option value="vegetarian">Vegetarian</option>
              <option value="non-vegetarian">Non-vegetarian</option>
              <option value="eggetarian">Eggetarian</option>
            </select>
          </label>
          <label>
            Daily calorie target
            <input className="input" type="number" value={form.dailyCalorieTarget} onChange={update("dailyCalorieTarget")} />
          </label>
          <label>
            Daily protein target (g)
            <input className="input" type="number" value={form.dailyProteinTarget} onChange={update("dailyProteinTarget")} />
          </label>
          <label>
            Daily hydration target (ml)
            <input className="input" type="number" value={form.dailyHydrationTargetMl} onChange={update("dailyHydrationTargetMl")} />
          </label>
        </div>
        <button className="btn btn-primary" type="submit" style={{ marginTop: 16 }}>
          💾 Save settings
        </button>
        {saved && <span style={{ marginLeft: 12, color: "var(--color-secondary)" }}>Saved!</span>}
      </form>
    </div>
  );
}
