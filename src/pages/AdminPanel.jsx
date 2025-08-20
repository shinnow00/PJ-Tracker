// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SESSION_KEY = "cosmic_session";
const STORAGE_KEY = "cosmic_data";
function uid(){ return Math.random().toString(36).slice(2,9); }

export default function AdminPanel({ data, updateData }){
  const nav = useNavigate();
  const [localData, setLocalData] = useState(data);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [clientUser, setClientUser] = useState("");
  const [clientPass, setClientPass] = useState("");
  const [editing, setEditing] = useState(null); // milestone being edited
  const [replaceFiles, setReplaceFiles] = useState(null); // files to replace media
  const [appendFiles, setAppendFiles] = useState(null); // files to append

  useEffect(()=>{
    const s = sessionStorage.getItem(SESSION_KEY);
    if(!s){ nav("/admin/login"); return; }
    const session = JSON.parse(s);
    if(session.role !== "admin") nav("/admin/login");
  },[]);

  useEffect(()=> setLocalData(data), [data]);

  // helper: read file -> dataUrl object
  function fileToDataURL(file){
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = ()=> res({id: uid(), name: file.name, type: file.type, dataUrl: r.result});
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  // --- Add milestone (works same as before) ---
  async function handleAddMilestone(e){
    e.preventDefault();
    const filesInput = e.target.querySelector('input[name="files"]');
    const files = filesInput ? filesInput.files : [];
    const media = [];
    if(files && files.length){
      for(let f of files) media.push(await fileToDataURL(f));
    }
    const m = {
      id: uid(),
      title: title || "Untitled milestone",
      description: desc || "",
      date: date || new Date().toISOString().slice(0,10),
      status,
      media
    };
    const next = {...data, project: {...data.project, milestones: [m, ...(data.project.milestones||[])]}};
    updateData(next);
    setTitle(""); setDesc(""); setDate(""); setStatus("pending");
    if(filesInput) filesInput.value = null;
    alert("Milestone added.");
  }

  // --- Create client account ---
  function handleCreateClient(e){
    e.preventDefault();
    if(!clientUser || !clientPass) return alert("enter both username and password");
    const clients = [...(data.clients||[]), {user: clientUser, pass: clientPass}];
    const next = {...data, clients};
    updateData(next);
    setClientUser(""); setClientPass("");
    alert("Client account created.");
  }

  // --- Delete milestone ---
  function handleDeleteMilestone(id){
    if(!confirm("Delete milestone?")) return;
    const next = {...data, project: {...data.project, milestones: data.project.milestones.filter(m=>m.id!==id)}};
    updateData(next);
  }

  // --- Change admin pass ---
  function handleChangeAdminPass(){
    const p = prompt("Enter new admin password (will replace current):");
    if(p){
      const next = {...data, adminPass: p};
      updateData(next);
      alert("Admin pass updated.");
    }
  }

  // --- Append media to milestone (files list) ---
  async function handleAppendMedia(milestoneId, files){
    if(!files || !files.length) return;
    const arr = [];
    for(let f of files) arr.push(await fileToDataURL(f));
    const next = {
      ...data,
      project: {
        ...data.project,
        milestones: data.project.milestones.map(m => m.id===milestoneId ? {...m, media: [...(m.media||[]), ...arr]} : m)
      }
    };
    updateData(next);
    alert("Media appended.");
  }

  // --- Replace entire media array for milestone ---
  async function handleReplaceMedia(milestoneId, files){
    if(!files || !files.length) return;
    const arr = [];
    for(let f of files) arr.push(await fileToDataURL(f));
    const next = {
      ...data,
      project: {
        ...data.project,
        milestones: data.project.milestones.map(m => m.id===milestoneId ? {...m, media: arr} : m)
      }
    };
    updateData(next);
    alert("Media replaced.");
  }

  // --- Remove single media item from milestone ---
  function removeMediaItem(milestoneId, mediaId){
    const next = {
      ...data,
      project: {
        ...data.project,
        milestones: data.project.milestones.map(m => m.id===milestoneId ? {...m, media: m.media.filter(md => md.id !== mediaId)} : m)
      }
    };
    updateData(next);
  }

  // --- Start editing ---
  function startEdit(m){
    setEditing({...m}); // shallow copy
    setReplaceFiles(null);
    setAppendFiles(null);
  }

  // --- Save edited milestone (title/desc/date/status + optional replace/append) ---
  async function saveEdit(){
    if(!editing) return;
    const milestoneId = editing.id;
    let updatedMedia = editing.media || [];
    if(replaceFiles && replaceFiles.length){
      // replace
      const arr = [];
      for(let f of replaceFiles) arr.push(await fileToDataURL(f));
      updatedMedia = arr;
    } else if (appendFiles && appendFiles.length){
      // append
      const arr = [];
      for(let f of appendFiles) arr.push(await fileToDataURL(f));
      updatedMedia = [...(updatedMedia||[]), ...arr];
    }

    const next = {
      ...data,
      project: {
        ...data.project,
        milestones: data.project.milestones.map(m => m.id===milestoneId ? {...m, title: editing.title, description: editing.description, date: editing.date, status: editing.status, media: updatedMedia} : m)
      }
    };
    updateData(next);
    setEditing(null);
    setReplaceFiles(null);
    setAppendFiles(null);
    alert("Milestone updated.");
  }

  return (
    <div className="panel admin-panel">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <div className="admin-actions">
          <button className="btn" onClick={handleChangeAdminPass}>Change Admin Pass</button>
          <button className="btn outline" onClick={()=>{ navigator.clipboard.writeText(JSON.stringify(data)); alert("Copied project JSON"); }}>Copy JSON</button>
        </div>
      </div>

      <section className="admin-section">
        <h3>Create Client Account</h3>
        <form onSubmit={handleCreateClient} className="form-inline">
          <input placeholder="client username" value={clientUser} onChange={e=>setClientUser(e.target.value)} />
          <input placeholder="client password" value={clientPass} onChange={e=>setClientPass(e.target.value)} />
          <button className="btn">Create</button>
        </form>
        <div className="hint">Existing clients: {data.clients?.length || 0}</div>
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

      <section className="admin-section" style={{marginBottom:20}}>
        <h3>Milestones</h3>
        <div className="milestone-list">
          { (data.project.milestones || []).map(m => (
            <div key={m.id} className="milestone-card">
              <div className="milestone-head">
                <div><strong>{m.title}</strong> <span className="muted">{m.date}</span></div>
                <div>
                  <button className="btn outline" onClick={()=>startEdit(m)}>Edit</button>
                  <button className="btn outline" onClick={()=>{ const fileInput = document.createElement('input'); fileInput.type='file'; fileInput.multiple=true; fileInput.accept='image/*,video/*'; fileInput.onchange = (ev)=> handleAppendMedia(m.id, ev.target.files); fileInput.click(); }}>Append Media</button>
                  <button className="btn red" onClick={()=>handleDeleteMilestone(m.id)}>Delete</button>
                </div>
              </div>

              <div className="milestone-body">{m.description}</div>

              {m.media && m.media.length>0 &&
                <div className="media-grid">
                  {m.media.map(md => (
                    <div key={md.id} className="media-item">
                      {md.type && md.type.startsWith('video') ? <video src={md.dataUrl} controls /> : <img src={md.dataUrl} alt={md.name} />}
                      <div style={{marginTop:6,display:'flex',gap:6,justifyContent:'center'}}>
                        <button className="btn outline" onClick={()=>removeMediaItem(m.id, md.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )) }
        </div>
      </section>

      {/* Edit modal */}
      {editing && (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)'}}>
          <div style={{width:760,maxHeight:'90%',overflowY:'auto',background:'#0f0f10',padding:20,borderRadius:12}}>
            <h3>Edit Milestone</h3>

            <div style={{display:'grid',gridTemplateColumns:'1fr 260px',gap:12}}>
              <div>
                <label>Title</label>
                <input value={editing.title} onChange={e=>setEditing({...editing, title:e.target.value})} />
                <label style={{marginTop:8}}>Description</label>
                <textarea value={editing.description} onChange={e=>setEditing({...editing, description:e.target.value})} />
                <label style={{marginTop:8}}>Date</label>
                <input type="date" value={editing.date} onChange={e=>setEditing({...editing, date:e.target.value})} />
                <label style={{marginTop:8}}>Status</label>
                <select value={editing.status} onChange={e=>setEditing({...editing, status:e.target.value})}><option>pending</option><option>in-progress</option><option>done</option></select>

                <div style={{marginTop:12}}>
                  <div className="hint">Append new media (will be added to existing):</div>
                  <input type="file" multiple accept="image/*,video/*" onChange={(e)=> setAppendFiles(e.target.files)} />
                </div>

                <div style={{marginTop:12}}>
                  <div className="hint">Or replace all media (checked files will replace current):</div>
                  <input type="file" multiple accept="image/*,video/*" onChange={(e)=> setReplaceFiles(e.target.files)} />
                </div>
              </div>

              <div>
                <div style={{fontSize:13,color:'#bfc4c9',marginBottom:8}}>Current media (remove individual items if needed)</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  { (editing.media||[]).map(md => (
                    <div key={md.id} style={{background:'#000',borderRadius:8,overflow:'hidden',padding:6,display:'flex',flexDirection:'column',alignItems:'center'}}>
                      {md.type && md.type.startsWith('video') ? <video src={md.dataUrl} controls style={{width:'100%',height:120,objectFit:'cover'}} /> : <img src={md.dataUrl} alt={md.name} style={{width:'100%',height:120,objectFit:'cover'}} />}
                      <div style={{marginTop:6,display:'flex',gap:6}}>
                        <button className="btn outline" onClick={()=>{ // remove from editing view and also from saved on save
                          setEditing(prev => ({...prev, media: (prev.media||[]).filter(x=>x.id!==md.id)}));
                        }}>Remove</button>
                      </div>
                    </div>
                  )) }
                </div>
              </div>
            </div>

            <div style={{marginTop:12,display:'flex',justifyContent:'flex-end',gap:8}}>
              <button className="btn outline" onClick={()=> setEditing(null)}>Cancel</button>
              <button className="btn" onClick={saveEdit}>Save changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
