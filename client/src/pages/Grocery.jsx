import { useEffect, useState } from "react";
import { api } from "../api/client";

const FOCUS_AREAS = [
  { key: "protein", label: "Protein" },
  { key: "fibre", label: "Fibre" },
  { key: "all", label: "All essentials" },
];

export default function Grocery() {
  const [items, setItems] = useState([]);
  const [reason, setReason] = useState("");
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);

  const loadItems = () => api.getGrocery().then(setItems);

  useEffect(() => {
    loadItems();
  }, []);

  const generate = async (focusArea) => {
    setLoading(true);
    try {
      const data = await api.generateGrocery(focusArea);
      setReason(data.reason);
      loadItems();
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id, checked) => {
    await api.toggleGroceryItem(id, checked);
    loadItems();
  };

  const remove = async (id) => {
    await api.deleteGroceryItem(id);
    loadItems();
  };

  const addManual = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    await api.addGroceryItem(newItem.trim());
    setNewItem("");
    loadItems();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Smart Basket 🛒</div>
        <div className="page-subtitle">Shopping lists generated from your goals and diet preference.</div>
      </div>

      <div className="card section">
        <p>Generate a list focused on:</p>
        <div className="chip-row">
          {FOCUS_AREAS.map((f) => (
            <button key={f.key} className="chip-btn" disabled={loading} onClick={() => generate(f.key)}>
              {loading ? <span className="spinner" /> : "✨"} {f.label}
            </button>
          ))}
        </div>
        {reason && <p style={{ marginTop: 8, fontWeight: 600 }}>{reason}</p>}
      </div>

      <div className="card section">
        <form className="form-row" onSubmit={addManual}>
          <input
            className="input"
            placeholder="Add an item manually…"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button className="btn btn-secondary" type="submit">+ Add</button>
        </form>
      </div>

      <div className="card section">
        {items.length === 0 ? (
          <div className="empty-state">Your list is empty. Generate one above or add items manually.</div>
        ) : (
          items.map((item) => (
            <div className="list-item" key={item.id}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "var(--color-text-muted)" : "inherit" }}>
                <input
                  type="checkbox"
                  checked={!!item.checked}
                  onChange={(e) => toggle(item.id, e.target.checked)}
                />
                <div>
                  <div>{item.name}</div>
                  {item.reason && <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{item.reason}</div>}
                </div>
              </label>
              <button className="btn btn-secondary" onClick={() => remove(item.id)}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
