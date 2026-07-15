import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function HealthConnect() {
  const [form, setForm] = useState({ steps: 0, activityMinutes: 0, sleepHours: 0, hydrationMl: 0, activityNote: "" });
  const [suggestion, setSuggestion] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getHealthConnect().then((log) =>
      setForm({
        steps: log.steps,
        activityMinutes: log.activity_minutes,
        sleepHours: log.sleep_hours,
        hydrationMl: log.hydration_ml,
        activityNote: log.activity_note || "",
      })
    );
  }, []);

  const update = (key) => (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { suggestion: s } = await api.updateHealthConnect(form);
      setSuggestion(s);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Lifestyle Sync ⌚</div>
        <div className="page-subtitle">
          Sync activity, steps, and sleep so Zaikora's suggestions account for your day.
        </div>
      </div>

      <form className="card section" onSubmit={save}>
        <div className="card-grid">
          <label>
            Steps
            <input className="input" type="number" min="0" value={form.steps} onChange={update("steps")} />
          </label>
          <label>
            Activity minutes
            <input className="input" type="number" min="0" value={form.activityMinutes} onChange={update("activityMinutes")} />
          </label>
          <label>
            Sleep (hours)
            <input className="input" type="number" min="0" step="0.5" value={form.sleepHours} onChange={update("sleepHours")} />
          </label>
          <label>
            Hydration (ml)
            <input className="input" type="number" min="0" step="100" value={form.hydrationMl} onChange={update("hydrationMl")} />
          </label>
        </div>
        <label style={{ display: "block", marginTop: 12 }}>
          What did you do today? (e.g. "played basketball")
          <input
            className="input"
            style={{ marginTop: 6 }}
            value={form.activityNote}
            onChange={update("activityNote")}
            placeholder="Optional activity note"
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginTop: 16 }}>
          {saving ? <span className="spinner" /> : "⌚"} Sync
        </button>
      </form>

      {suggestion && (
        <div className="alert alert-info">💡 {suggestion}</div>
      )}
    </div>
  );
}
