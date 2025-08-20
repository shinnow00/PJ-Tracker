import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin({ data }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  function handleLogin(e){
    e.preventDefault();
    if(pass === data.adminPass){
      sessionStorage.setItem("cosmic_session", JSON.stringify({role:"admin"}));
      nav("/admin");
    } else {
      setErr("Incorrect admin password.");
    }
  }

  return (
    <div className="panel center-panel">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} className="form">
        <input placeholder="Admin password" value={pass} onChange={e=>setPass(e.target.value)} type="password" />
        <button className="btn">Enter Admin</button>
      </form>
      {err && <div className="error">{err}</div>}
      <div className="hint">Default admin pass is <strong>daredare</strong>. Change it later in Settings.</div>
    </div>
  );
}
