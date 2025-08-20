import React, { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import ClientLogin from "./pages/ClientLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import ClientDashboard from "./pages/ClientDashboard";

const STORAGE_KEY = "cosmic_data";
const defaultData = {
  adminPass: "daredare",
  clients: [],
  project: {
    title: "Cosmic Crash - Project",
    description: "Progress dashboard for the Cosmic Crash animation project.",
    milestones: []
  }
};

function readData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return JSON.parse(JSON.stringify(defaultData));
    }
    return JSON.parse(raw);
  }catch(e){
    console.error(e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function writeData(data){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App(){
  const [data, setData] = useState(readData());

  useEffect(()=> writeData(data), [data]);

  function updateData(updater){
    setData(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeData(next);
      return next;
    });
  }

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">Cosmic Crash</div>
        <nav>
          <Link to="/client/login" className="navlink">Client</Link>
          <Link to="/admin/login" className="navlink">Admin</Link>
        </nav>
      </header>

      <main className="main-area">
        <Routes>
          <Route path="/" element={<Navigate to="/client/login" replace />} />
          <Route path="/client/login" element={<ClientLogin data={data} />} />
          <Route path="/client" element={<ClientDashboard data={data} />} />
          <Route path="/admin/login" element={<AdminLogin data={data} updateData={updateData} />} />
          <Route path="/admin" element={<AdminPanel data={data} updateData={updateData} />} />
        </Routes>
      </main>

      <footer className="footer">Prototype - For production use integrate secure backend & storage.</footer>
    </div>
  );
}
