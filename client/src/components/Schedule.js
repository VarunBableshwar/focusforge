import React, { useState, useEffect } from 'react';

const Schedule = ({ refreshTrigger }) => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const times = ['09:00', '11:00', '13:00', '14:00', '16:00'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5001/api/timetable', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const targetDay = (currentDay === 'Sun' || currentDay === 'Sat' ? 'Mon' : currentDay);
          const todayClasses = data.filter(c => c.day === targetDay);
          setTimetable(todayClasses);
        } else {
          setTimetable([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching schedule:", err);
        setTimetable([]);
        setLoading(false);
      });
  }, [currentDay, refreshTrigger]);

  if (loading) return <div className='page active'><p>Loading today's schedule...</p></div>;

  return (
    <div className='page active'>
      <div className='card'>
        <div className='section-header'>
          <h2 className='section-title'>Today's Classes ({currentDay})</h2>
        </div>
        
        <div style={{display:'flex', flexDirection:'column', gap:'16px', marginTop:'20px'}}>
          {times.map((time, idx) => {
            const timetableArray = Array.isArray(timetable) ? timetable : [];
            const classInfo = timetableArray.find(c => c.timeIdx === idx);
            return (
              <div key={time} style={{display:'flex', gap:'20px', alignItems:'center'}}>
                <div style={{width:'60px', fontSize:'12px', fontWeight:'600', color:'var(--muted)', fontFamily:'var(--font-mono)'}}>{time}</div>
                <div style={{
                  flex: 1, 
                  padding: '16px 20px', 
                  background: classInfo ? 'var(--accent-glow)' : 'var(--bg3)',
                  borderLeft: `4px solid ${classInfo ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{fontWeight:'700', color: classInfo ? 'var(--accent)' : 'var(--muted)'}}>
                      {classInfo ? classInfo.subject : 'No Class Scheduled'}
                    </div>
                    <div style={{fontSize:'12px', color:'var(--muted)', marginTop:'4px'}}>
                      {classInfo ? classInfo.room : 'Free Time'}
                    </div>
                  </div>
                  {classInfo && <span style={{fontSize:'11px', fontWeight:'600', background:'var(--bg2)', padding:'4px 10px', borderRadius:'20px', color:'var(--accent)'}}>Live Now</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;