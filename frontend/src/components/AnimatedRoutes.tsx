import { lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
const LazyHome = lazy(() => import("../pages/Home"));
const LazyTeam = lazy(() => import("../pages/Team"));
const LazyEvents = lazy(() => import("../pages/Events"));
const LazyProjects = lazy(() => import("../pages/Projects"));
const LazyContact = lazy(() => import("../pages/ContactUs"));
const LazyLogin = lazy(() => import("../pages/Login"));
const LazyProfile = lazy(() => import("../pages/Profile"));
const LazyNotFound = lazy(() => import("../pages/NotFound"));
export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LazyHome /></PageTransition>} />
        <Route path="/team" element={<PageTransition><LazyTeam /></PageTransition>} />
        <Route path="/events" element={<PageTransition><LazyEvents /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><LazyProjects /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><LazyContact /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LazyLogin /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><LazyProfile /></PageTransition>} />
        <Route path="*" element={<PageTransition><LazyNotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
