import { Suspense, useState, useEffect } from "react";

import Footer from "./components/Footer";
import LoadingPage from "./components/Loading";
import CursorGlow from "./components/CursorGlow";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import FuturisticNavbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import OnboardingModal from "./components/OnboardingModal";

import AnimatedRoutes from "./components/AnimatedRoutes";

import { BrowserRouter as Router } from "react-router-dom";
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
              <AnimatedRoutes />
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
