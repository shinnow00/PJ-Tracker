import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "cosmic_session";

function uid(){ return Math.random().toString(36).slice(2,9); }

export default function AdminPanel({ data, updateData }){
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [clientUser, setClientUser] = useState("");
  const [clientPass, setClientPass] = useState("");

  useEffect(()=>{
    const s = sessionStorage.getItem(STORAGE_KEY);
    if(!s){ nav("/admin/login"); return; }
    const session = JSON.parse(s);
    if(session.role !== "admin") nav("/admin/login");
  },[]);

  async function fileToDataURL(file){
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = ()=> res({id: uid(), name: file.name, type: file.type, dataUrl: r.result});
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  async function handleAddMilestone(e){
    e.preventDefault();
    const files = e.target.files?.files;
    const media = [];
    if(files && files.length){
      for(let f of files){
        media.push(await fileToDataURL(f));
      }
    }
    const m = { id: uid(), title, description: desc, date: date || new Date().toISOString().slice(0,10), status, media };
    const next = {...data, project: {...data.project, milestones: [m, ...data.project.milestones]}};
    updateData(next);
    setTitle(""); setDesc(""); setDate(""); setStatus("pending");
    alert("Milestone added.");
  }

  function handleCreateClient(e){
    e.preventDefault();
    if(!clientUser || !clientPass) return alert("enter both");
    const clients = [...(data.clients||[]), {user: clientUser, pass: clientPass}];
    const next = {...data, clients};
    updateData(next);
    setClientUser(""); setClientPass("");
    alert("Client account created.");
  }

  function handleDeleteMilestone(id){
    if(!confirm("Delete milestone?")) return;
    const next = {...data, project: {...data.project, milestones: data.project.milestones.filter(m=>m.id!==id)}};
    updateData(next);
  }

  function handleLogout(){
    sessionStorage.removeItem(STORAGE_KEY);
    nav("/admin/login");
  }

  function handleChangeAdminPass(){
    const p = prompt("Enter new admin password (will replace current):");
    if(p){
      const next = {...data, adminPass: p};
      updateData(next);
      alert("Admin pass updated.");
    }
  }

  async function handleAppendMedia(milestoneId, files){
    const arr = [];
    for(let f of files){
      arr.push(await fileToDataURL(f));
    }
    const next = {...data, project: {...data.project, milestones: data.project.milestones.map(m=> m.id===milestoneId ? {...m, media: [...(m.media||[]), ...arr]} : m)}};
    updateData(next);
    alert("Media appended.");
  }

  return (
    <div className="panel admin-panel">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <div className="admin-actions">
          <button className="btn" onClick={handleChangeAdminPass}>Change Admin Pass</button>
          <button className="btn outline" onClick={()=>{ navigator.clipboard.writeText(JSON.stringify(data)); alert("Copied project JSON"); }}>Copy JSON</button>
          <button className="btn red" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <section className="admin-section">
        <h3>Create Client Account</h3>
        <form onSubmit={handleCreateClient} className="form-inline">
          <input placeholder="client username" value={clientUser} onChange={e=>setClientUser(e.target.value)} />
          <input placeholder="client password" value={clientPass} onChange={e=>setClientPass(e.target.value)} />
          <button className="btn">Create</button>
        </form>
        <div className="hint">Existing clients: {data.clients.length}</div>
      </section>

      <section className="admin-section">
        <h3>Add Milestone (with media)</h3>
        <form onSubmit={handleAddMilestone} className="form">
          <input placeholder="Milestone title" value={title} onChange={e=>setTitle(e.target.value)} required />
          <textarea placeholder="description" value={desc} onChange={e=>setDesc(e.target.value)} />
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
          <select value={status} onChange={e=>setStatus(e.target.value)}><option>pending</option><option>in-progress</option><option>done</option></select>
          <input type="file" name="files" multiple accept="image/*,video/*" />
          <div>
            <button className="btn" type="submit">Add Milestone</button>
          </div>
        </form>
      </section>

      <section className="admin-section">
        <h3>Milestones</h3>
        <div className="milestone-list">
          {data.project.milestones.map(m => (
            <div key={m.id} className="milestone-card">
              <div className="milestone-head">
                <div><strong>{m.title}</strong> <span className="muted">{m.date}</span></div>
                <div>
                  <button className="btn outline" onClick={()=>{ const fileInput = document.createElement('input'); fileInput.type='file'; fileInput.multiple=true; fileInput.accept='image/*,video/*'; fileInput.onchange = (ev)=> handleAppendMedia(m.id, ev.target.files); fileInput.click(); }}>Append Media</button>
                  <button className="btn red" onClick={()=>handleDeleteMilestone(m.id)}>Delete</button>
                </div>
              </div>
              <div className="milestone-body">{m.description}</div>
              {m.media && m.media.length>0 && <div className="media-grid">
                {m.media.map(md => (
                  <div key={md.id} className="media-item">
                    {md.type && md.type.startsWith('video') ? (
                      <video src={md.dataUrl} controls />
                    ) : (
                      <img src={md.dataUrl} alt={md.name} />
                    )}
                  </div>
                ))}
              </div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
