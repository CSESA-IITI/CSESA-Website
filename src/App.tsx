import React from "react";
import Header from "./components/Navbar";
import Home from "./pages/Home";
import PastEvents from "./pages/PastEvents";
import Team from "./pages/Team";
import Projects from "./pages/Projects";
import About from "./pages/About";
import Login from "./pages/Login";
import ContactUs from "./pages/ContactUs";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Router>
      {/* Outer container for the whole app, relative for absolute positioning */}
      <div className="relative min-h-screen w-screen overflow-hidden bg-black">


       

        
        <div className="relative z-10 flex flex-col min-h-screen bg-black text-white"> 
          <Header />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/team" element={<Team />} />
              <Route path="/events" element={<PastEvents />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;