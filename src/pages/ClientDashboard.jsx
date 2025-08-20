import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SESSION_KEY = "cosmic_session";
const STORAGE_KEY = "cosmic_data";

function readData(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }

export default function ClientDashboard({ data }){
  const nav = useNavigate();
  const [project, setProject] = useState(data.project || {milestones:[]});

  useEffect(()=>{
    const s = sessionStorage.getItem(SESSION_KEY);
    if(!s){ nav("/client/login"); return; }
    const ss = JSON.parse(s);
    if(ss.role !== "client") { nav("/client/login"); return; }
    setProject(readData().project || {milestones:[]});
  },[]);

  function handleLogout(){
    sessionStorage.removeItem(SESSION_KEY);
    nav("/client/login");
  }

  const progress = Math.round(((project.milestones || []).filter(m=>m.status==='done').length / Math.max(1, (project.milestones||[]).length)) *100);

  return (
    <div className="panel client-panel">
      <div className="client-header">
        <h2>{data.project.title}</h2>
        <div className="client-actions">
          <div className="progress">Progress: <strong>{progress}%</strong></div>
          <button className="btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="content-grid">
        <aside className="left-col">
          <div className="big-head">THE<br/>HEADLINE</div>
          <p className="lead">{data.project.description}</p>
          <button className="btn big">EXPAND</button>
        </aside>

        <section className="right-col">
          <div className="gallery-grid">
            {(project.milestones || []).map(m => (
              <div key={m.id} className="card">
                <div className="card-head">
                  <h4>{m.title}</h4>
                  <span className="muted">{m.date} • {m.status}</span>
                </div>
                <p className="muted small">{m.description}</p>
                {m.media && m.media.length>0 && <div className="card-media">
                  {m.media.slice(0,4).map(md => (
                    <div key={md.id} className="thumb">
                      {md.type && md.type.startsWith('video') ? <video src={md.dataUrl} controls /> : <img src={md.dataUrl} alt={md.name} />}
                    </div>
                  ))}
                </div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
