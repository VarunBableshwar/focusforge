import React, { useState, useEffect } from 'react';

const Analytics = ({ tasks, exams, user }) => {
  const [subjects, setSubjects] = useState([]);
  
  useEffect(() => {
    // Derive subjects and stats from tasks and exams
    const subjectMap = {};
    
    tasks.forEach(task => {
      const sub = task.subject || 'General';
      if (!subjectMap[sub]) subjectMap[sub] = { name: sub, tasks: 0, completed: 0, exams: 0, hours: 0 };
      subjectMap[sub].tasks++;
      if (task.isCompleted) subjectMap[sub].completed++;
    });

    exams.forEach(exam => {
      const sub = exam.subject || 'General';
      if (!subjectMap[sub]) subjectMap[sub] = { name: sub, tasks: 0, completed: 0, exams: 0, hours: 0 };
      subjectMap[sub].exams++;
    });

    const colors = ['#7c3aed', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4'];
    const derived = Object.values(subjectMap).map((s, i) => ({
      ...s,
      color: colors[i % colors.length],
      hours: s.tasks * 2 + s.exams * 5, // Mock calculation: 2h per task, 5h per exam
      pct: s.tasks > 0 ? Math.round((s.completed / s.tasks) * 100) : 0
    }));

    setSubjects(derived);
  }, [tasks, exams]);

  const scores = user?.focusScores || { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;

  return (
    <div className='page active'>
      <div className='stat-grid'>
        <div className='stat-card' style={{ '--c': 'var(--accent)' }}>
          <div className='stat-label'>Coding Hrs (Estimated)</div>
          <div className='stat-value'>{subjects.reduce((acc, s) => acc + s.hours, 0)}h</div>
          <div className='stat-sub'>Based on tasks & exams</div>
        </div>
        <div className='stat-card' style={{ '--c': 'var(--green)' }}>
          <div className='stat-label'>Avg Task Completion</div>
          <div className='stat-value'>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</div>
          <div className='stat-sub'>Keep up the momentum!</div>
        </div>
        <div className='stat-card' style={{ '--c': 'var(--amber)' }}>
          <div className='stat-label'>Pending Tasks</div>
          <div className='stat-value'>{totalTasks - completedTasks}</div>
          <div className='stat-sub'>This week</div>
        </div>
        <div className='stat-card' style={{ '--c': 'var(--purple)' }}>
          <div className='stat-label'>Exams to Prep</div>
          <div className='stat-value'>{exams.length}</div>
          <div className='stat-sub'>Next month</div>
        </div>
      </div>

      <div className='two-col' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        <div className='card' style={{ display: 'flex', flexDirection: 'column' }}>
          <div className='section-title' style={{ marginBottom: '32px' }}>Weekly Focus Performance</div>
          <div className='analytics-bar-container' style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between', 
            height: '240px', 
            padding: '0 10px',
            gap: '12px'
          }}>
            {Object.entries(scores).map(([day, score]) => (
              <div key={day} style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '12px',
                height: '100%'
              }}>
                <div style={{ 
                    flex: 1, 
                    width: '100%', 
                    maxWidth: '44px', 
                    background: 'var(--bg3)', 
                    borderRadius: '10px', 
                    position: 'relative', 
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-end'
                }} title={`${day}: ${score}%`}>
                    <div 
                    className='analytics-bar' 
                    style={{ 
                        width: '100%',
                        height: `${score}%`, 
                        background: score > 85 ? 'var(--green)' : score > 70 ? 'var(--accent)' : 'var(--amber)',
                        borderRadius: '10px',
                        transition: 'height 1s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}
                    >
                        {score > 15 && <span style={{
                            position: 'absolute',
                            top: '8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '10px',
                            fontWeight: '800',
                            color: 'white',
                            opacity: 0.9
                        }}>{score}%</span>}
                    </div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{day}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className='card'>
          <div className='section-title' style={{ marginBottom: '20px' }}>Subject Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {subjects.length > 0 ? subjects.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.color, flexShrink: 0 }}></div>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', flex: 1 }}>{s.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{s.hours}h</span>
                </div>
                <div className='progress'>
                  <div className='progress-bar' style={{ background: s.color, width: `${(s.hours / 30) * 100}%` }}></div>
                </div>
              </div>
            )) : <p style={{color:'var(--muted)', fontSize:'13px'}}>No data available yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;