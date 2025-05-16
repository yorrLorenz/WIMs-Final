import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import WarehouseSelectionPage from "./pages/WarehouseSelectionPage";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import PrivateRoute from "./components/PrivateRoute";
import CreateWarehousePage from "./pages/CreateWarehousePage";
import CreateAccountPage from "./pages/CreateAccountPage";
import AddProduct from "./pages/AddProduct";
import DashboardLayout from "./layouts/DashboardLayout";
import CalendarPage from "./pages/CalendarPage";
import AdminDashboard from "./pages/AdminDashboard";
import AccountInfo from "./pages/AccountInfo";
import AdminProductMasterlist from "./pages/AdminProductMasterlist"; 



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        <Route path="/select-warehouse" element={
          <PrivateRoute>
            <DashboardLayout>
            <WarehouseSelectionPage />
          </DashboardLayout>
          </PrivateRoute>
        } />

        

<Route path="/create-warehouse" element={
  <PrivateRoute>
   <DashboardLayout>
    <CreateWarehousePage />
     </DashboardLayout>
  </PrivateRoute>
} />

<Route path="/create-account" element={
  <PrivateRoute>
  <DashboardLayout>
    <CreateAccountPage />
   </DashboardLayout>
  </PrivateRoute>
} />

<Route path="/warehouse/:warehouseId/add-product" element={
  <PrivateRoute>
    
    <AddProduct />
    
  </PrivateRoute>
} />

<Route path="/warehouse/:warehouseId" element={
  <PrivateRoute>
    <DashboardLayout>
      <WarehouseDashboard />
    </DashboardLayout>
  </PrivateRoute>
} />
<Route path="/calendar" element={
  <PrivateRoute>
    <DashboardLayout>
      <CalendarPage />
    </DashboardLayout>
  </PrivateRoute>
} />

<Route path="/admin-dashboard" element={
  <PrivateRoute>
      <DashboardLayout>
    <AdminDashboard />
    </DashboardLayout>
</PrivateRoute>
} />

<Route path="/account-info" element={
  <PrivateRoute>
    <DashboardLayout>
      <AccountInfo />
    </DashboardLayout>
  </PrivateRoute>
} />


<Route path="/admin/products" element={
  <PrivateRoute> 
<DashboardLayout>
    <AdminProductMasterlist />
    </DashboardLayout>
    </PrivateRoute>}
/>


      </Routes>
    </Router>
  );
}

export default App;
