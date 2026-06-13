import { lazy, Suspense, useState, useEffect } from "react";

import Footer from "./components/Footer";
import LoadingPage from "./components/Loading";
import CursorGlow from "./components/CursorGlow";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import FuturisticNavbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import OnboardingModal from "./components/OnboardingModal";

const LazyHome = lazy(() => import("./pages/Home"));
const LazyTeam = lazy(() => import("./pages/Team"));
const LazyEvents = lazy(() => import("./pages/Events"));
const LazyProjects = lazy(() => import("./pages/Projects"));
const LazyContact = lazy(() => import("./pages/ContactUs"));
const LazyLogin = lazy(() => import("./pages/Login"));
const LazyProfile = lazy(() => import("./pages/Profile"));
const LazyNotFound = lazy(() => import("./pages/NotFound"));

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <main className="flex-grow">
            <AnimatePresence>{isLoading && <LoadingPage />}</AnimatePresence>
            <CursorGlow />
            <FuturisticNavbar />
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<LazyHome />} />
                <Route path="/team" element={<LazyTeam />} />
                <Route path="/events" element={<LazyEvents />} />
                <Route path="/projects" element={<LazyProjects />} />
                <Route path="/contact" element={<LazyContact />} />
                <Route path="/login" element={<LazyLogin />} />
                <Route path="/profile" element={<LazyProfile />} />
                <Route path="*" element={<LazyNotFound />} />
              </Routes>
            </Suspense>
            <OnboardingModal />
          </main>
          <Footer />
          <ToastContainer />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
