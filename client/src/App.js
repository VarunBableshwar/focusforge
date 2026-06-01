import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Pomodoro from './components/Pomodoro';
import Timetable from './components/Timetable';
import Schedule from './components/Schedule';
import Compilers from './components/Compilers';
import Materials from './components/Materials';
import Assignments from './components/Assignments';
import Exams from './components/Exams';
import Analytics from './components/Analytics';
import Login from './components/Login';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('task'); // 'task', 'exam', 'class', 'material'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focusScore, setFocusScore] = useState(100);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('Med');
  const [classDay, setClassDay] = useState('Mon');
  const [classTime, setClassTime] = useState('0');
  const [selectedFile, setSelectedFile] = useState(null);

  // ── GLOBAL FOCUS STATE ───────────────────────────────────────
  const [pomRunning, setPomRunning] = useState(false);
  const [pomSecs, setPomSecs] = useState(25 * 60);
  const [pomCount, setPomCount] = useState(0);
  const [pomBaseMinutes, setPomBaseMinutes] = useState(25);
  const [currentPhaseTotalSecs, setCurrentPhaseTotalSecs] = useState(25 * 60);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [activeSecs, setActiveSecs] = useState(0);
  const [totalSecs, setTotalSecs] = useState(0);
  const [idleCount, setIdleCount] = useState(0);
  const [status, setStatus] = useState('active');
  const [alertShown, setAlertShown] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState(null);
  const [warnAfter, setWarnAfter] = useState(15);
  const [alertAfter, setAlertAfter] = useState(30);
  const [logs, setLogs] = useState([{ time: '08:57 PM', msg: 'Focus Session initialized', type: 'active' }]);

  const lastActivityRef = useRef(Date.now());
  const snoozeUntilRef = useRef(null);
  const pomIntervalRef = useRef(null);

  const fmt = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const addLog = (msg, type) => {
    setLogs(prev => {
      if (prev.length > 0 && prev[0].msg === msg && prev[0].type === type) return prev;
      return [{ time: ts(), msg, type }, ...prev].slice(0, 50);
    });
  };

  const nextPomodoro = () => {
    setPomCount(prev => {
      const nextIdx = (prev + 1) % 4;
      const isBreak = nextIdx % 2 === 1;
      const nextSecs = isBreak ? (nextIdx === 3 ? 15 * 60 : 5 * 60) : pomBaseMinutes * 60;
      setPomSecs(nextSecs);
      setCurrentPhaseTotalSecs(nextSecs);
      addLog(isBreak ? 'Break started' : 'Work session started', 'back');
      return nextIdx;
    });
  };

  const toggleFocusTimer = () => {
    setPomRunning(!pomRunning);
    addLog(!pomRunning ? 'Focus session resumed' : 'Session paused', !pomRunning ? 'active' : 'warn');
  };

  const resetPomodoro = () => {
    setPomSecs(pomBaseMinutes * 60);
    setCurrentPhaseTotalSecs(pomBaseMinutes * 60);
    setPomRunning(false);
  };

  const confirmPresence = () => {
    setAlertShown(false);
    lastActivityRef.current = Date.now();
    setStatus('active');
    addLog('Presence confirmed', 'back');
  };

  const takeBreak = () => {
    setAlertShown(false);
    setPomRunning(false);
    const until = Date.now() + 5 * 60 * 1000;
    setSnoozeUntil(until);
    snoozeUntilRef.current = until;
    addLog('Taking a 5m break', 'warn');
  };

  // Timer Engine
  useEffect(() => {
    if (pomRunning) {
      pomIntervalRef.current = setInterval(() => {
        setPomSecs(prev => {
          if (prev <= 1) {
            setPomRunning(false);
            nextPomodoro();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(pomIntervalRef.current);
    }
    return () => clearInterval(pomIntervalRef.current);
  }, [pomRunning, pomBaseMinutes]);

  // Activity Monitor Engine
  useEffect(() => {
    const ticker = setInterval(() => {
      if (snoozeUntilRef.current) {
        if (Date.now() < snoozeUntilRef.current) {
          lastActivityRef.current = Date.now();
          return;
        } else {
          snoozeUntilRef.current = null;
          setSnoozeUntil(null);
          addLog('Break ended automatically', 'active');
        }
      }

      setTotalSecs(prev => prev + 1);
      const idleSecs = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      
      if (idleSecs < warnAfter) {
        setActiveSecs(prev => prev + 1);
        setStatus('active');
      } else if (idleSecs >= warnAfter && idleSecs < alertAfter) {
        setStatus('warn');
      } else if (idleSecs >= alertAfter) {
        if (!alertShown) {
          setAlertShown(true);
          setIdleCount(prev => prev + 1);
          setStatus('idle');
          addLog('Idle alert triggered', 'idle');
        }
      }
    }, 1000);

    const onActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, onActivity, { passive: true }));

    return () => {
      clearInterval(ticker);
      events.forEach(e => document.removeEventListener(e, onActivity));
    };
  }, [warnAfter, alertAfter, alertShown]);

  // Sync Global Focus Score to Backend
  useEffect(() => {
    const globalFocusScore = totalSecs > 0 ? Math.round((activeSecs / totalSecs) * 100) : 100;
    const throttledUpdate = setInterval(() => {
      if (isAuthenticated) {
        updateFocusScore(globalFocusScore);
        if (pomRunning && pomCount % 2 === 0 && selectedSubject) {
          updateSubjectFocusTime(selectedSubject, 30);
        }
      }
    }, 30000);
    return () => clearInterval(throttledUpdate);
  }, [activeSecs, totalSecs, pomRunning, pomCount, selectedSubject, isAuthenticated]);

  const globalFocusScore = totalSecs > 0 ? Math.round((activeSecs / totalSecs) * 100) : 100;

  // ── APP EFFECTS ──────────────────────────────────────────────
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchExams();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://localhost:5001/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setIsAuthenticated(true);
          setUser(data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    }
    setLoading(false);
  };

  const setAuth = (status, userData) => {
    setIsAuthenticated(status);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateFocusScore = async (score) => {
    const token = localStorage.getItem('token');
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    try {
      const response = await fetch('http://localhost:5001/api/auth/focus', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score, day })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(prev => ({ ...prev, focusScores: data.focusScores, streak: data.streak }));
        setFocusScore(score);
      }
    } catch (err) { console.error('Failed to update focus score:', err); }
  };

  const updateSubjectFocusTime = async (subject, incrementSecs) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/auth/focus-subject', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, incrementSecs })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(prev => ({ ...prev, subjectFocusTime: data.subjectFocusTime, streak: data.streak }));
      }
    } catch (err) { console.error('Failed to update subject focus time:', err); }
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (error) {
      console.error('Backend connection failed:', error);
    }
  };

  const fetchExams = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/exams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const toggleTask = async (id, isCompleted) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5001/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isCompleted: !isCompleted })
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (err) { console.error(err); }
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const response = await fetch(`http://localhost:5001/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (err) { console.error(err); }
  };

  const handleAdd = async () => {
    if (modalType !== 'class' && !title) return alert("Title is required");
    if (modalType === 'class' && !subject) return alert("Subject is required");
    const token = localStorage.getItem('token');

    if (modalType === 'task') {
      try {
        const response = await fetch('http://localhost:5001/api/tasks', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, priority, dueDate: date || new Date() })
        });
        if (response.ok) {
          fetchTasks();
          closeModal();
          setRefreshTrigger(prev => prev + 1);
        }
        } catch (err) { console.error(err); }
        } else if (modalType === 'exam') {
        try {
        const response = await fetch('http://localhost:5001/api/exams', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: title, subject, date: date || new Date(), progress: 0 })
        });
        if (response.ok) {
          fetchExams();
          closeModal();
          setRefreshTrigger(prev => prev + 1);
        }
        } catch (err) { console.error(err); }
        } else if (modalType === 'class') {
        try {
            const response = await fetch('http://localhost:5001/api/timetable', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject, day: classDay, timeIdx: parseInt(classTime) })
            });
            if (response.ok) {
                closeModal();
                setRefreshTrigger(prev => prev + 1);
                alert("Class added to timetable!");
            }
        } catch (err) { console.error(err); }
        } else if (modalType === 'material') {
        if (!selectedFile) return alert("Please select a file to upload");
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('type', 'PDF');
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:5001/api/materials', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (response.ok) {
                closeModal();
                setRefreshTrigger(prev => prev + 1);
                alert("Study Material added!");
            }
        } catch (err) { console.error(err); }
        }
        };
  const closeModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setSubject('');
    setDate('');
    setPriority('Med');
    setModalType('task');
    setSelectedFile(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard tasks={tasks} exams={exams} user={user} refreshTrigger={refreshTrigger} toggleTask={toggleTask} />;
      case 'focus': return (
        <Pomodoro 
          pomRunning={pomRunning}
          toggleFocusTimer={toggleFocusTimer}
          pomSecs={pomSecs}
          pomCount={pomCount}
          nextPomodoro={nextPomodoro}
          resetPomodoro={resetPomodoro}
          pomBaseMinutes={pomBaseMinutes}
          setPomBaseMinutes={setPomBaseMinutes}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          activeSecs={activeSecs}
          totalSecs={totalSecs}
          idleCount={idleCount}
          status={status}
          focusScore={globalFocusScore}
          alertShown={alertShown}
          setAlertShown={setAlertShown}
          warnAfter={warnAfter}
          setWarnAfter={setWarnAfter}
          alertAfter={alertAfter}
          setAlertAfter={setAlertAfter}
          fmt={fmt}
          logs={logs}
          confirmPresence={confirmPresence}
          takeBreak={takeBreak}
        />
      );
      case 'timetable': return <Timetable refreshTrigger={refreshTrigger} />;
      case 'schedule': return <Schedule refreshTrigger={refreshTrigger} />;
      case 'compilers': return <Compilers />;
      case 'materials': return <Materials refreshTrigger={refreshTrigger} />;
      case 'tasks': return <Assignments tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} />;
      case 'exams': return <Exams exams={exams} />;
      case 'analytics': return <Analytics tasks={tasks} exams={exams} user={user} />;
      default: return <Dashboard tasks={tasks} exams={exams} user={user} refreshTrigger={refreshTrigger} toggleTask={toggleTask} />;
    }
  };

  if (loading) return <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>Loading...</div>;

  if (!isAuthenticated) {
    return <Login setAuth={setAuth} />;
  }

  return (
    <div className='app'>
      <Sidebar activePage={activePage} setActivePage={setActivePage} logout={logout} user={user} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className={'main ' + (isSidebarOpen ? 'shifted' : '')}>
        <div className='topbar'>
          <button className='menu-toggle' onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <svg viewBox='0 0 24 24' width='24' height='24' stroke='currentColor' strokeWidth='2' fill='none'><line x1='3' y1='12' x2='21' y2='12'/><line x1='3' y1='6' x2='21' y2='6'/><line x1='3' y1='18' x2='21' y2='18'/></svg>
          </button>
          <div className='page-title'>{activePage.toUpperCase()}</div>
          <div className='topbar-actions'>
            <div className='user-meta-desktop' style={{display:'flex', alignItems:'center', gap:'12px', marginRight:'12px'}}>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'13px', fontWeight:'700', color:'var(--text)'}}>{user?.name}</div>
                <div style={{fontSize:'11px', color:'var(--muted)'}}>{user?.email}</div>
              </div>
              <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800', fontSize:'14px'}}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <button className='btn btn-primary btn-sm' onClick={() => setIsModalOpen(true)}>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' width='16' height='16'><line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/></svg>
              <span className='btn-text-desktop'>Add New</span>
            </button>
          </div>
        </div>

        <div className='page-content'>
          {renderPage()}
        </div>
      </div>

      {isModalOpen && (
        <div className='modal-overlay show'>
          <div className='modal-box'>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px'}}>
              <h3 className='modal-title' style={{fontSize:'20px', margin:0}}>Add New Item</h3>
              <button className='btn btn-sm' onClick={closeModal} style={{border:'none', background:'var(--bg3)', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', padding:0, color:'var(--muted)'}}>✕</button>
            </div>

            <div className='form-group'>
              <label className='form-label'>Item Type</label>
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                <button className={'btn btn-sm ' + (modalType === 'task' ? 'btn-primary' : '')} onClick={() => setModalType('task')}>Assignment</button>
                <button className={'btn btn-sm ' + (modalType === 'exam' ? 'btn-primary' : '')} onClick={() => setModalType('exam')}>Exam</button>
                <button className={'btn btn-sm ' + (modalType === 'class' ? 'btn-primary' : '')} onClick={() => setModalType('class')}>Class</button>
                <button className={'btn btn-sm ' + (modalType === 'material' ? 'btn-primary' : '')} onClick={() => setModalType('material')}>Study Material</button>
              </div>
            </div>

            {modalType !== 'class' && (
                <div className='form-group'>
                    <label className='form-label'>{modalType === 'material' ? 'Material Name' : 'Title'}</label>
                    <input className='input' value={title} onChange={e => setTitle(e.target.value)} placeholder={modalType === 'task' ? 'e.g., Study OS' : modalType === 'exam' ? 'e.g., Mid-Sem Exam' : 'e.g., Unit 2 Notes'} />
                </div>
            )}

            <div className='form-group'>
              <label className='form-label'>Subject</label>
              <select className='input' value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="">Select Subject</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Algorithms">Algorithms</option>
              </select>
            </div>

            {modalType === 'class' ? (
                <div className='form-row'>
                    <div className='form-group'>
                        <label className='form-label'>Day</label>
                        <select className='input' value={classDay} onChange={e => setClassDay(e.target.value)}>
                            <option>Mon</option><option>Tue</option><option>Wed</option><option>Thu</option><option>Fri</option>
                        </select>
                    </div>
                    <div className='form-group'>
                        <label className='form-label'>Time Slot</label>
                        <select className='input' value={classTime} onChange={e => setClassTime(e.target.value)}>
                            <option value="0">09:00</option>
                            <option value="1">11:00</option>
                            <option value="2">13:00</option>
                            <option value="3">14:00</option>
                            <option value="4">16:00</option>
                        </select>
                    </div>
                </div>
            ) : (
                <div className='form-group'>
                    <label className='form-label'>{modalType === 'material' ? 'Upload File' : 'Due Date'}</label>
                    <input 
                      className='input' 
                      type={modalType === 'material' ? 'file' : 'date'} 
                      onChange={e => modalType === 'material' ? setSelectedFile(e.target.files[0]) : setDate(e.target.value)} 
                      value={modalType === 'material' ? undefined : date} 
                      min={modalType === 'material' ? undefined : new Date().toISOString().split('T')[0]}
                    />
                </div>
            )}

            {modalType === 'task' && (
                <div className='form-group'>
                    <label className='form-label'>Priority</label>
                    <select className='input' value={priority} onChange={e => setPriority(e.target.value)}>
                        <option>High</option>
                        <option>Med</option>
                        <option>Low</option>
                    </select>
                </div>
            )}

            <div style={{display:'flex', gap:'12px', justifyContent:'flex-end', marginTop:'28px', paddingTop:'20px', borderTop:'1px solid var(--border)'}}>
              <button className='btn' onClick={closeModal} style={{background:'var(--bg)', borderColor:'var(--border2)', color:'var(--text)'}}>Cancel</button>
              <button className='btn btn-primary' onClick={handleAdd}>Add item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
