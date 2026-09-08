import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import AccountPage from "./Account";
import EditProfile from "./EditProfile";
import Transactions from "./Transactions";
import Settings from "./Settings";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminTransactions from "./AdminTransactions";
import AdminReports from "./AdminReports";
import Crypto from "./Crypto";
import Vaults from "./Vaults";
import Cards from "./Cards";
import Analytics from "./Analytics";
import Loans from "./Loans";
import Bills from "./Bills";
import AdminLoans from "./AdminLoans";
import AdminDatabase from "./AdminDatabase";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/vaults" element={<Vaults />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/crypto" element={<Crypto />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/loans" element={<AdminLoans />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/database" element={<AdminDatabase />} />
      </Routes>
    </Router>
  );
}

export default App;
