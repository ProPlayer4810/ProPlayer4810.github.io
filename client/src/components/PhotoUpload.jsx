import { useRef, useState } from "react";

export default function PhotoUpload({ onUpload, loading }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onUpload(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? <span className="spinner" /> : "📷"} Click a food photo
      </button>
      {preview && (
        <div style={{ marginTop: 12 }}>
          <img
            src={preview}
            alt="Meal preview"
            style={{ maxWidth: 220, borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)" }}
          />
        </div>
      )}
    </div>
  );
}
