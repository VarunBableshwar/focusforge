import React, { useState } from 'react';

const Compilers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const compilers = [
    { name: 'Python 3', desc: 'Modern & Simple', icon: '🐍', url: 'https://www.programiz.com/python-programming/online-compiler/', color: '#facc15' },
    { name: 'Java', desc: 'Object Oriented', icon: '☕', url: 'https://www.programiz.com/java-programming/online-compiler/', color: '#ef4444' },
    { name: 'JavaScript', desc: 'Web Development', icon: '📜', url: 'https://www.programiz.com/javascript/online-compiler/', color: '#fde047' },
    { name: 'C++', desc: 'High Performance', icon: '⚙️', url: 'https://www.programiz.com/cpp-programming/online-compiler/', color: '#3b82f6' },
    { name: 'C Language', desc: 'System Programming', icon: '🧩', url: 'https://www.programiz.com/c-programming/online-compiler/', color: '#60a5fa' },
    { name: 'C# / .NET', desc: 'Enterprise Apps', icon: '💎', url: 'https://www.onlinegdb.com/online_csharp_compiler', color: '#a855f7' },
    { name: 'Go Play', desc: 'Fast & Concurrent', icon: '🐹', url: 'https://go.dev/play/', color: '#06b6d4' },
    { name: 'MySQL / SQL', desc: 'Database Query', icon: '🗄️', url: 'https://onecompiler.com/mysql', color: '#f97316' },
  ];

  const filteredCompilers = compilers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='page active'>
      <div className='compiler-search-wrapper' style={{ marginBottom: '32px' }}>
        <input 
          type='text' 
          className='compiler-search' 
          placeholder='Search for a language (e.g., Python, C++)...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: 'var(--bg2)', 
            border: '1px solid var(--border)',
            borderRadius: '30px',
            padding: '14px 24px',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            display: 'block',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: '14px'
          }}
        />
      </div>

      <div className='compiler-grid' style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {filteredCompilers.map((c, i) => (
          <div 
            key={i} 
            className='compiler-card' 
            style={{ 
              '--hover-color': c.color,
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => window.open(c.url, '_blank')}
          >
            <div className='compiler-icon' style={{ fontSize: '48px', marginBottom: '16px' }}>{c.icon}</div>
            <div className='compiler-name' style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{c.name}</div>
            <div className='compiler-desc' style={{ fontSize: '13px', color: 'var(--muted)' }}>{c.desc}</div>
          </div>
        ))}
      </div>
      
      {filteredCompilers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
          No compilers found for '{searchTerm}'
        </div>
      )}
    </div>
  );
};

export default Compilers;