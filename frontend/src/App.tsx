import { lazy, Suspense, useState, useEffect } from "react";

import Footer from "./components/Footer";
import Header from "./components/Navbar";
import LoadingPage from "./components/Loading";
import CursorGlow from "./components/CursorGlow";

const LazyHome = lazy(() => import("./pages/Home"));
const LazyTeam = lazy(() => import("./pages/Team"));
const LazyEvents = lazy(() => import("./pages/PastEvents"));
const LazyProjects = lazy(() => import("./pages/Projects"));
const LazyContact = lazy(() => import("./pages/ContactUs"));
const LazyLogin = lazy(() => import("./pages/Login"));
const LazyNotFound = lazy(() => import("./pages/NotFound"));
const LazyDummy = lazy(() => import("./pages/Dummy"));
const LazyAuthCallback = lazy(() => import("./pages/AuthCallback"));

import { HashRouter as Router, Route, Routes } from "react-router-dom";
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
    <Router>
      <div className="relative min-h-screen w-screen overflow-hidden bg-white">
        <div className="relative z-10 flex flex-col min-h-screen bg-white text-white">
          <Header />

          <main className="flex-grow">
            <AnimatePresence>{isLoading && <LoadingPage />}</AnimatePresence>
            <CursorGlow />

            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<LazyHome />} />
                <Route path="/team" element={<LazyTeam />} />
                <Route path="/events" element={<LazyEvents />} />
                <Route path="/projects" element={<LazyProjects />} />
                <Route path="/contact" element={<LazyContact />} />
                <Route path="/login" element={<LazyLogin />} />
                <Route path="/auth/callback" element={<LazyAuthCallback />} />
                <Route path="/dummy" element={<LazyDummy />} />
                <Route path="*" element={<LazyNotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
