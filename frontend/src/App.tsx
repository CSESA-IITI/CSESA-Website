// src/App.tsx

import { lazy, Suspense } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingPage from "./components/Loading";
import CursorGlow from "./components/CursorGlow";
import "./App.css";

// Lazy-loaded components
const LazyHome = lazy(() => import("./pages/Home"));
const LazyTeam = lazy(() => import("./pages/Team"));
const LazyEvents = lazy(() => import("./pages/PastEvents"));
const LazyProjects = lazy(() => import("./pages/Projects"));
const LazyContact = lazy(() => import("./pages/ContactUs"));
const LazyLogin = lazy(() => import("./pages/Login"));
const LazyNotFound = lazy(() => import("./pages/NotFound"));
const LazyDummy = lazy(() => import("./pages/Dummy"));
const LazyProfile = lazy(() => import("./pages/Profile"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen w-screen overflow-hidden bg-white">
          <div className="relative z-10 flex flex-col min-h-screen bg-white text-white">
            <CursorGlow />
            <Header />

            <main className="flex-grow">
              <Suspense fallback={<LoadingPage />}>
                <Routes>
                  <Route path="/" element={<LazyHome />} />
                  <Route path="/team" element={<LazyTeam />} />
                  <Route path="/events" element={<LazyEvents />} />
                  <Route path="/projects" element={<LazyProjects />} />
                  <Route path="/contact" element={<LazyContact />} />
                  <Route path="/login" element={<LazyLogin />} />
                  <Route path="/dummy" element={<LazyDummy />} />
                  <Route path="/profile" element={<LazyProfile />} />
                  <Route path="*" element={<LazyNotFound />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;