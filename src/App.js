import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Quest from "./pages/Quest";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/quest" element={<Quest />} />
    </Routes>
  );
}

export default App;