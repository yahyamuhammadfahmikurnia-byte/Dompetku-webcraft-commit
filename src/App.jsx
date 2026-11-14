
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Target from "./pages/Target";
import Simulator from "./pages/Simulator";
import StrategiHemat from "./pages/StrategiHemat";
import Riwayat from "./pages/Riwayat";
import Profil from "./pages/Profil";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/target" element={<Target />} />
          <Route path="/strategi" element={<StrategiHemat />} />
          <Route path="/riwayat" element={<Riwayat />} />
          <Route path="/profil" element={<Profil />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
