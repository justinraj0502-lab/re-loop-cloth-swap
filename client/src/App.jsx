import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import CreateListing from "./pages/CreateListing";
import Marketplace from "./pages/Marketplace";
import ItemDetails from "./pages/ItemDetails";
import RequestSwap from "./pages/RequestSwap";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import SwapValue from "./pages/SwapValue";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminListings from "./pages/AdminListings";
import AdminSwaps from "./pages/AdminSwaps";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminLogin from "./pages/AdminLogin";

import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Favorites from "./pages/Favorites";

import "./App.css";


/* =========================================================
   SCROLL TO TOP
   ========================================================= */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}


/* =========================================================
   APP CONTENT
   ========================================================= */

function AppContent() {
  return (
    <>
      <ScrollToTop />

      {/* Ambient editorial atmosphere */}
      <div
        className="ambient-light one"
        aria-hidden="true"
      />

      <div
        className="ambient-light two"
        aria-hidden="true"
      />

      <main className="page-shell">
        <Routes>

          {/* =================================================
              PUBLIC / AUTH
          ================================================= */}

          <Route
            path="/"
            element={<Navigate to="/register" replace />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />


          {/* =================================================
              MARKETPLACE
          ================================================= */}

          <Route
            path="/marketplace"
            element={<Marketplace />}
          />

          <Route
            path="/favorites"
            element={<Favorites />}
          />

          <Route
            path="/item/:id"
            element={<ItemDetails />}
          />

          <Route
            path="/create-listing"
            element={<CreateListing />}
          />

          <Route
            path="/request-swap/:id"
            element={<RequestSwap />}
          />

          <Route
            path="/swap-value"
            element={<SwapValue />}
          />


          {/* =================================================
              USER AREA
          ================================================= */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/chat/:swapRequestId"
            element={<Chat />}
          />


          {/* =================================================
              ADMIN
          ================================================= */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/listings"
            element={<AdminListings />}
          />

          <Route
            path="/admin/swaps"
            element={<AdminSwaps />}
          />

          <Route
            path="/admin/analytics"
            element={<AdminAnalytics />}
          />


          {/* =================================================
              FALLBACK
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/marketplace"
                replace
              />
            }
          />

        </Routes>
      </main>
    </>
  );
}


/* =========================================================
   APP
   ================================================= */

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}


export default App;