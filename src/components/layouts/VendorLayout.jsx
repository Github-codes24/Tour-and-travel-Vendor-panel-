import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import VendorLayout from "./layouts/VendorLayout";
import VendorDashboard from "./pages/vendor/VendorDashboard";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<VendorDashboard />} />

          {/* Put your existing vendor child routes here */}
        </Route>

        <Route
          path="*"
          element={<Navigate to="/vendor" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}