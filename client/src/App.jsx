import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tracker from "./pages/Tracker.jsx";
import TasteMatch from "./pages/TasteMatch.jsx";
import StreetFood from "./pages/StreetFood.jsx";
import FamilyFood from "./pages/FamilyFood.jsx";
import RecipeTransformer from "./pages/RecipeTransformer.jsx";
import Regional from "./pages/Regional.jsx";
import PlateBuilder from "./pages/PlateBuilder.jsx";
import Grocery from "./pages/Grocery.jsx";
import Journey from "./pages/Journey.jsx";
import HealthConnect from "./pages/HealthConnect.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/taste-match" element={<TasteMatch />} />
          <Route path="/street-food" element={<StreetFood />} />
          <Route path="/family-food" element={<FamilyFood />} />
          <Route path="/recipe-transformer" element={<RecipeTransformer />} />
          <Route path="/regional" element={<Regional />} />
          <Route path="/plate-builder" element={<PlateBuilder />} />
          <Route path="/grocery" element={<Grocery />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/health-connect" element={<HealthConnect />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
