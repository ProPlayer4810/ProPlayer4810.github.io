import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Journey() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getJourney().then(setData);
  }, []);

  if (!data) return <div className="card">Loading your journey…</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Zaikora Journey 🏆</div>
        <div className="page-subtitle">Streaks, milestones, and achievements that make healthy eating enjoyable.</div>
      </div>

      <div className="card section" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>🔥</div>
        <h2>{data.streak}-day streak</h2>
        <p>Keep logging meals daily to grow your streak.</p>
      </div>

      <div className="section">
        <h3>Unlocked achievements</h3>
        {data.achievements.length === 0 ? (
          <div className="card empty-state">No achievements yet — log your first meal to get started!</div>
        ) : (
          <div className="badge-list">
            {data.achievements.map((a) => (
              <div className="badge" key={a.id}>
                <div className="badge-icon">🏅</div>
                <h4>{a.title}</h4>
                <p style={{ marginBottom: 0 }}>{a.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h3>Locked</h3>
        <div className="badge-list">
          {data.locked.map((a) => (
            <div className="badge locked" key={a.key}>
              <div className="badge-icon">🔒</div>
              <h4>{a.title}</h4>
              <p style={{ marginBottom: 0 }}>{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
