import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "cosmic_session";

export default function ClientLogin({ data }){
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  function handleLogin(e){
    e.preventDefault();
    const found = data.clients.find(c => c.user === user && c.pass === pass);
    if(found){
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({role:"client", user}));
      nav("/client");
    } else setErr("Credentials not found. Ask admin to create your account.");
  }

  return (
    <div className="panel center-panel">
      <h2>Client Login</h2>
      <form onSubmit={handleLogin} className="form">
        <input placeholder="username" value={user} onChange={e=>setUser(e.target.value)} />
        <input placeholder="password" value={pass} onChange={e=>setPass(e.target.value)} type="password" />
        <button className="btn">Login</button>
      </form>
      {err && <div className="error">{err}</div>}
      <div className="hint">If you don't have credentials ask the admin to create them in the Admin panel.</div>
    </div>
  );
}
