import React, { useState, useEffect, useRef, useCallback } from 'react';

const Pomodoro = ({ 
  // Global Timer State
  pomRunning, 
  toggleFocusTimer, 
  pomSecs, 
  pomCount, 
  nextPomodoro,
  resetPomodoro,
  pomBaseMinutes,
  setPomBaseMinutes,
  
  // Subject State
  selectedSubject,
  setSelectedSubject,

  // Stats State
  activeSecs,
  totalSecs,
  idleCount,
  status,
  focusScore,
  
  // Alert State
  alertShown,
  setAlertShown,
  
  // Idle Settings
  warnAfter,
  setWarnAfter,
  alertAfter,
  setAlertAfter,
  
  // Utils
  fmt,
  logs,
  confirmPresence,
  takeBreak
}) => {
  const isBreak = pomCount % 2 === 1;

  return (
    <div className='page active'>
      <div className='focus-layout'>
        <div className='focus-column'>
          {/* MAIN TIMER CARD */}
          <div className='pom-timer-card'>
            <div className='pom-session-label'>Current Session</div>
            
            <select className="pom-subject-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={pomRunning}>
                <option value="" disabled>Select Subject — Topic</option>
                <option value="Data Structures — Trees">Data Structures — Trees</option>
                <option value="Operating Systems — Kernels">Operating Systems — Kernels</option>
                <option value="Database Systems — SQL">Database Systems — SQL</option>
                <option value="Computer Networks — TCP/IP">Computer Networks — TCP/IP</option>
                <option value="Algorithms — Sorting">Algorithms — Sorting</option>
                <option value="Artificial Intelligence — Neural Networks">Artificial Intelligence — Neural Networks</option>
            </select>

            <div className='pom-timer-text'>{fmt(pomSecs)}</div>

            <div className='pom-duration-wrap'>
              <span className='pom-duration-label'>Duration:</span>
              <select className="pom-duration-select" value={pomBaseMinutes} onChange={(e) => setPomBaseMinutes(parseInt(e.target.value))} disabled={pomRunning}>
                  <option value="15">15 min</option>
                  <option value="25">25 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
              </select>
            </div>

            <div className='pom-controls'>
              <button className="pom-btn pom-btn-primary" onClick={toggleFocusTimer}>
                {pomRunning ? '⏸ Pause Focus' : '▶ Start Focus'}
              </button>
              <button className="pom-btn pom-btn-outline" onClick={resetPomodoro}>↺ Reset</button>
              <button className="pom-btn pom-btn-outline" onClick={nextPomodoro}>⏭ Skip</button>
            </div>

            <div className='pom-dots'>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`pom-dot ${i <= pomCount ? 'active' : ''}`}></div>
              ))}
            </div>

            <div className='pom-idle-box'>
              <div className='pom-idle-title'>Idle Detection Settings</div>
              <div className='pom-slider-row'>
                <span className='pom-slider-label'>Warn after</span>
                <input type="range" className='pom-slider warn' min="5" max="60" value={warnAfter} step="5" onChange={(e) => setWarnAfter(parseInt(e.target.value))} />
                <span className='pom-slider-val warn'>{warnAfter}s</span>
              </div>
              <div className='pom-slider-row'>
                <span className='pom-slider-label'>Alert after</span>
                <input type="range" className='pom-slider alert' min="10" max="120" value={alertAfter} step="5" onChange={(e) => setAlertAfter(parseInt(e.target.value))} />
                <span className='pom-slider-val alert'>{alertAfter}s</span>
              </div>
            </div>
          </div>

          {/* BOTTOM STAT CARDS */}
          <div className='pom-stat-row'>
            <div className='pom-stat-card'>
              <div className='pom-stat-title'>Active Time</div>
              <div className='pom-stat-val green'>{fmt(activeSecs)}</div>
            </div>
            <div className='pom-stat-card'>
              <div className='pom-stat-title'>Idle Alerts</div>
              <div className='pom-stat-val orange'>{idleCount}</div>
            </div>
            <div className='pom-stat-card'>
              <div className='pom-stat-title'>Focus Score</div>
              <div className='pom-stat-val green'>{focusScore}%</div>
            </div>
          </div>
        </div>

        <div className='focus-sidebar'>
          {/* ACTIVITY MONITOR / RING CARD */}
          <div className='pom-side-card' style={{ marginBottom: '24px' }}>
            <div className='pom-status-bar'>
              <div className='pom-status-dot' style={{ background: status === 'active' ? '#10b981' : status === 'warn' ? '#f59e0b' : '#ef4444' }}></div>
              <span className='pom-status-text'>
                {status === 'active' ? 'Student is active' : status === 'warn' ? 'Activity drifting...' : 'Student is idle!'}
              </span>
            </div>
            
            <div className="pom-ring-wrap">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="82" fill="none" stroke="var(--bg3)" strokeWidth="12"/>
                <circle cx="90" cy="90" r="82" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round" strokeDasharray="515" strokeDashoffset={515 - (515 * (focusScore / 100))} style={{ transition: 'stroke-dashoffset 1s ease' }}/>
              </svg>
              <div className="pom-ring-label">
                <div className="pom-ring-pct">{focusScore}%</div>
                <div className="pom-ring-sub">Score</div>
              </div>
            </div>
          </div>

          {/* ACTIVITY LOG CARD */}
          <div className='pom-side-card'>
            <div className='pom-log-title'>Activity Log</div>
            <div className="pom-log-list">
              {logs.map((log, i) => (
                <div key={i} className={'pom-log-pill ' + log.type}>
                  <div className='pom-log-dot' style={{ background: log.type === 'active' ? '#10b981' : log.type === 'warn' ? '#f59e0b' : '#ef4444' }}></div>
                  <span className='pom-log-time'>{log.time}</span>
                  <span className='pom-log-msg'>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {alertShown && (
        <div className='modal-overlay show'>
          <div className='modal-box' style={{textAlign:'center', padding:'40px'}}>
            <div style={{fontSize:'64px', marginBottom:'20px'}}>😴</div>
            <h3 style={{fontSize:'24px', fontWeight:'800', marginBottom:'12px'}}>Still with us?</h3>
            <p style={{color:'var(--muted)', marginBottom:'32px', fontSize:'15px'}}>No activity detected. Confirm presence or take a short break!</p>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                <button className='btn btn-primary' style={{width:'100%', padding:'16px', borderRadius:'12px', fontSize:'16px'}} onClick={confirmPresence}>✓ I'm back, keep focusing</button>
                <button className='btn pom-btn-outline' style={{width:'100%', padding:'16px', borderRadius:'12px', fontSize:'16px'}} onClick={takeBreak}>☕ Take a 5 min break</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;
