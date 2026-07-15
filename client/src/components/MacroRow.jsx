export default function MacroRow({ calories, protein, carbs, fats }) {
  return (
    <div className="macro-row">
      {calories !== undefined && <span className="macro-pill">🔥 {Math.round(calories)} kcal</span>}
      {protein !== undefined && <span className="macro-pill">💪 {Math.round(protein)}g protein</span>}
      {carbs !== undefined && <span className="macro-pill">🌾 {Math.round(carbs)}g carbs</span>}
      {fats !== undefined && <span className="macro-pill">🥑 {Math.round(fats)}g fats</span>}
    </div>
  );
}
