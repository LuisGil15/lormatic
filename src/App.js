import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Quest from "./pages/Quest";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quest" element={<Quest />} />
      </Routes>
    </Router>
  );
}

export default App;
