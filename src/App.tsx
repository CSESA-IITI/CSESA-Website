import React from 'react';
import Header from './components/Navbar';
import Home from './pages/Home';
import PastEvents from "./pages/PastEvents";
import Team from "./pages/Team";
import Projects from "./pages/Projects";
import About from './pages/About';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css"

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col border">
        <Header />
        {/* <Sidebar/> */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/team" element={<Team/>}/>
            <Route path="/events" element={<PastEvents/>}/>
            <Route path="/projects" element={<Projects/>}/>
            <Route path='/about' element={<About/>}/>
          </Routes>
        </main>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;