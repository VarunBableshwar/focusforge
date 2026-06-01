import React, { useState, useEffect } from 'react';

const Timetable = ({ refreshTrigger }) => {
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const defaultSelectedDay = ['Sat', 'Sun'].includes(currentDay) ? 'Mon' : currentDay;
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [selectedTimeIdx, setSelectedTimeIdx] = useState(0);
  const [subjectName, setSubjectName] = useState('');
  const [roomName, setRoomName] = useState('');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const times = ['09:00', '11:00', '13:00', '14:00', '16:00'];

  const getSubjectColor = (subject) => {
    const colors = ['#7c3aed', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4'];
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    fetchTimetable();
  }, [refreshTrigger]);

  const fetchTimetable = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/timetable', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      const data = await response.json();
      
      const formatted = {};
      days.forEach(d => formatted[d] = Array(5).fill(null));
      
      if (Array.isArray(data)) {
        data.forEach(entry => {
          if (formatted[entry.day]) {
            formatted[entry.day][entry.timeIdx] = {
              subject: entry.subject,
              room: entry.room || 'TBD'
            };
          }
        });
      }
      
      setTimetableData(formatted);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      const empty = {};
      days.forEach(d => empty[d] = Array(5).fill(null));
      setTimetableData(empty);
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (!subjectName) return alert("Please enter a subject name");
    const token = localStorage.getItem('token');
    
    // Optimistic UI update
    setTimetableData(prev => {
      const updated = { ...prev };
      if (!updated[selectedDay]) updated[selectedDay] = Array(5).fill(null);
      else updated[selectedDay] = [...updated[selectedDay]];
      
      updated[selectedDay][selectedTimeIdx] = {
        subject: subjectName,
        room: roomName || 'TBD'
      };
      return updated;
    });

    try {
      const response = await fetch('http://localhost:5001/api/timetable', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          day: selectedDay,
          timeIdx: selectedTimeIdx,
          subject: subjectName,
          room: roomName
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setSubjectName('');
        setRoomName('');
        fetchTimetable(); // Ensure sync with server
      } else {
        // Revert on error
        fetchTimetable();
      }
    } catch (error) {
      console.error('Error saving class:', error);
      fetchTimetable(); // Revert on error
    }
  };

  const handleRemoveClass = async (day, timeIdx) => {
    if (!window.confirm(`Remove class from ${day} at ${times[timeIdx]}?`)) return;
    const token = localStorage.getItem('token');
    
    // Optimistic UI update
    setTimetableData(prev => {
      const updated = { ...prev };
      if (updated[day]) {
        updated[day] = [...updated[day]];
        updated[day][timeIdx] = null;
      }
      return updated;
    });
    
    try {
      await fetch('http://localhost:5001/api/timetable', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ day, timeIdx, subject: '', room: '' })
      });
      fetchTimetable(); // Ensure sync with server
    } catch (error) {
      console.error('Error removing class:', error);
      fetchTimetable(); // Revert on error
    }
  };

  if (loading) return <div className='page active'><p>Loading timetable...</p></div>;

  return (
    <div className='page active' style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div className='section-header' style={{ padding: '0 8px' }}>
      <div className='section-title' style={{ fontSize: '24px' }}>Class Timetable</div>
        <button className='btn btn-sm btn-primary' onClick={() => setIsModalOpen(true)}>+ Add Class</button>
      </div>
      
      <div className='timetable-container' style={{ marginTop: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className='timetable' id='full-timetable' style={{ flex: 1 }}>
          {/* Header Row */}
          <div className='tt-cell tt-header'>Time / Day</div>
          {days.map(day => (
            <div key={day} className={`tt-cell tt-header ${day === currentDay ? 'tt-today' : ''}`}>{day}</div>
          ))}

            {/* Content Rows */}
            {times.map((time, i) => (
              <React.Fragment key={time}>
                <div className='tt-cell tt-time'>{time}</div>
                {days.map(day => {
                  const entry = timetableData[day] ? timetableData[day][i] : null;
                  const subject = entry ? entry.subject : '';
                  const color = subject ? getSubjectColor(subject) : 'var(--accent)';
                  return (
                    <div key={day + time} className='tt-cell'>
                      {subject && (
                        <div 
                          className='tt-class' 
                          onClick={() => handleRemoveClass(day, i)}
                          style={{ background: color + '1a', borderLeft: '4px solid ' + color, color: color }}
                          data-tip-rm="Click to remove"
                        >
                          <div className="tt-subject">{subject}</div>
                          {entry.room && entry.room !== 'TBD' && (
                            <div className="tt-room"></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

      {isModalOpen && (
        <div className='modal-overlay show'>
          <div className='modal-box'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 className='modal-title' style={{ fontSize: '20px', margin: 0 }}>Add Class</h3>
              <button className='btn btn-sm' onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'var(--bg3)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: 'var(--muted)' }}>✕</button>
            </div>

            <div className='form-group'>
              <label className='form-label'>Subject Name</label>
              <input className='input' placeholder='e.g., Operating Systems' value={subjectName} onChange={(e) => setSubjectName(e.target.value)} />
            </div>

            {/* <div className='form-group'>
              <label className='form-label'>Room / Location</label>
              <input className='input' placeholder='e.g., Hall 402' value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            </div> */}

            <div className='form-row'>
              <div className='form-group'>
                <label className='form-label'>Day</label>
                <select className='input' value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className='form-group'>
                <label className='form-label'>Time Slot</label>
                <select className='input' value={selectedTimeIdx} onChange={(e) => setSelectedTimeIdx(parseInt(e.target.value))}>
                  {times.map((t, idx) => <option key={t} value={idx}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <button className='btn' onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className='btn btn-primary' onClick={handleAddClass}>Add Class</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;