import React, { useState, useEffect } from 'react';

const Materials = ({ refreshTrigger }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newType, setNewType] = useState('PDF');
  const [newUrl, setNewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [addMethod, setAddMethod] = useState('file'); // 'file' or 'url'

  useEffect(() => {
    fetchMaterials();
  }, [refreshTrigger]);

  const fetchMaterials = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/materials', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setMaterials(data);
      } else {
        setMaterials([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMaterials([]);
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!newTitle || !newSubject) return alert("Please fill in title and subject");
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('title', newTitle);
    formData.append('subject', newSubject);
    formData.append('type', newType);

    if (addMethod === 'file' && selectedFile) {
      formData.append('file', selectedFile);
    } else {
      formData.append('url', newUrl);
    }
    
    try {
      const response = await fetch('http://localhost:5001/api/materials', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const savedMaterial = await response.json();
        setMaterials(prev => Array.isArray(prev) ? [savedMaterial, ...prev] : [savedMaterial]);
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding material:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this study material?")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5001/api/materials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMaterials(prev => prev.filter(m => m._id !== id));
      }
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewSubject('');
    setNewUrl('');
    setSelectedFile(null);
    setAddMethod('file');
  };

  const filters = ['All', 'PDFs', 'Code Snippets', 'Links'];

  const getIcon = (type) => {
    if (type === 'PDF') return { char: '📄', color: 'var(--red)', bg: 'var(--red-bg)' };
    if (type === 'Code') return { char: '💻', color: 'var(--green)', bg: 'var(--green-bg)' };
    if (type === 'Link') return { char: '🔗', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
    return { char: '📁', color: 'var(--muted)', bg: 'var(--bg3)' };
  };

  const materialsArray = Array.isArray(materials) ? materials : [];
  const filteredMaterials = materialsArray.filter(m => {
    const title = m.title || '';
    const subject = m.subject || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'PDFs') return matchesSearch && m.type === 'PDF';
    if (activeFilter === 'Code Snippets') return matchesSearch && m.type === 'Code';
    if (activeFilter === 'Links') return matchesSearch && m.type === 'Link';
    return matchesSearch;
  });

  const handleOpenMaterial = (m) => {
    if (m.filePath) {
      window.open(`http://localhost:5001${m.filePath}`, '_blank');
    } else if (m.url) {
      const url = m.url.startsWith('http') ? m.url : `https://${m.url}`;
      window.open(url, '_blank');
    }
  };

  if (loading) return <div className='page active'><p>Loading materials...</p></div>;

  return (
    <div className='page active'>
      <div style={{display:'flex', gap:'12px', marginBottom:'24px', flexWrap:'wrap', alignItems:'center'}}>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add File
        </button>
        <div style={{width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px'}}></div>
        
        {filters.map(f => (
          <button 
            key={f} 
            className={'btn btn-sm ' + (activeFilter === f ? 'btn-primary' : '')} 
            onClick={() => setActiveFilter(f)}
          >{f}</button>
        ))}
        <input 
          className="input" 
          placeholder="Search notes..." 
          style={{maxWidth:'260px', marginLeft:'auto'}}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="material-grid">
        {filteredMaterials.map((m, i) => {
          const icon = getIcon(m.type);
          return (
            <div key={m._id || i} className="material-card">
              <div className="material-icon" style={{background: icon.bg, color: icon.color}}>{icon.char}</div>
              <div className="material-info">
                <div className="material-title">{m.title}</div>
                <div className="material-meta">{m.subject} • {m.type}</div>
                <div className="material-actions">
                  <button className="btn btn-sm" onClick={() => handleOpenMaterial(m)}>
                    {m.type === 'Link' ? 'Open Link' : m.type === 'Code' ? 'Copy Code' : 'View'}
                  </button>
                  {m.filePath && <button className="btn btn-sm" onClick={() => window.open(`http://localhost:5001${m.filePath}`, '_blank')}>Download</button>}
                  <button className="btn btn-sm" onClick={() => handleDelete(m._id)} style={{color: 'var(--red)', borderColor: 'var(--red-bg)'}}>Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className='modal-overlay show'>
          <div className='modal-box' style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h3 className='modal-title' style={{ fontSize: '20px' }}>Add Study Material</h3>
              <button className='btn btn-sm' onClick={() => { setIsModalOpen(false); resetForm(); }} style={{border:'none', background:'var(--bg3)', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: 'var(--muted)'}}>✕</button>
            </div>

            <div className='form-group'>
              <label className='form-label'>Material Title</label>
              <input className='input' placeholder='e.g., OS Unit 2 Notes' value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>

            <div className='form-group'>
              <label className='form-label'>Subject</label>
              <input className='input' placeholder='e.g., Operating Systems' value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
            </div>

            <div className='form-row'>
              <div className='form-group'>
                <label className='form-label'>Resource Type</label>
                <select className='input' value={newType} onChange={(e) => setNewType(e.target.value)}>
                  <option value='PDF'>PDF Document</option>
                  <option value='Code'>Code Snippet</option>
                  <option value='Link'>External Link</option>
                </select>
              </div>
              <div className='form-group'>
                <label className='form-label'>Method</label>
                <div style={{ display: 'flex', gap: '12px', height: '42px', alignItems: 'center', background: 'var(--bg3)', padding: '0 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    <input type='radio' checked={addMethod === 'file'} onChange={() => setAddMethod('file')} /> File
                  </label>
                  <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    <input type='radio' checked={addMethod === 'url'} onChange={() => setAddMethod('url')} /> URL
                  </label>
                </div>
              </div>
            </div>

            <div className='form-group' style={{ marginBottom: '32px' }}>
              <label className='form-label'>{addMethod === 'file' ? 'Select File' : 'Source URL'}</label>
              {addMethod === 'file' ? (
                <div style={{ position: 'relative' }}>
                  <input type='file' className='input' style={{ padding: '8px' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
                </div>
              ) : (
                <input className='input' placeholder='https://example.com/resource' value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <button className='btn' onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</button>
              <button className='btn btn-primary' onClick={handleAddMaterial}>Add Material</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;