import React from 'react';

const Sidebar = ({ activePage, setActivePage, logout, user, isOpen, setIsOpen }) => {
  return (
    <nav className={'sidebar ' + (isOpen ? 'open' : '')} id='sidebar'>
      <div className='logo'>
        <div className='logo-icon'>
          <svg viewBox='0 0 24 24'><path d='M4 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H4zm0 2h16v3h-4v2h4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm0 5h8v2H4v-2zm0 4h10v2H4v-2zm0 4h12v2H4v-2zm16-8h-2V7h2v2zm-2 2h2v10a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z'/></svg>
        </div>
        <div className='logo-text'>Focus<span>Forge</span></div>
      </div>

      <div className='nav-section'>Main</div>
      <div className={'nav-item ' + (activePage === 'dashboard' ? 'active' : '')} onClick={() => { setActivePage('dashboard'); setIsOpen(false); }}>
        <svg className='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><rect x='3' y='3' width='7' height='7' rx='1'/><rect x='14' y='3' width='7' height='7' rx='1'/><rect x='3' y='14' width='7' height='7' rx='1'/><rect x='14' y='14' width='7' height='7' rx='1'/></svg>
        Dashboard
      </div>
      <div className={'nav-item ' + (activePage === 'compilers' ? 'active' : '')} onClick={() => { setActivePage('compilers'); setIsOpen(false); }}>
        <svg className='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><polyline points='16 18 22 12 16 6'/><polyline points='8 6 2 12 8 18'/></svg>
        Online Compilers
      </div>
      <div className={'nav-item ' + (activePage === 'materials' ? 'active' : '')} onClick={() => { setActivePage('materials'); setIsOpen(false); }}>
        <svg className='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/><path d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/></svg>
        Study Materials
      </div>
      <div className={'nav-item ' + (activePage === 'tasks' ? 'active' : '')} onClick={() => { setActivePage('tasks'); setIsOpen(false); }}>
        <svg className='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><polyline points='9 11 12 14 22 4'/><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'/></svg>
        Assignments
      </div>
      <div className={'nav-item ' + (activePage === 'exams' ? 'active' : '')} onClick={() => { setActivePage('exams'); setIsOpen(false); }}>
        <svg className='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/></svg>
        Exams
      </div>
      <div className={'nav-item ' + (activePage === 'timetable' ? 'active' : '')} onClick={() => { setActivePage('timetable'); setIsOpen(false); }}>
        <svg className='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><rect x='3' y='3' width='18' height='18' rx='2'/><line x1='3' y1='9' x2='21' y2='9'/><line x1='3' y1='15' x2='21' y2='15'/><line x1='9' y1='3' x2='9' y2='21'/><line x1='15' y1='3' x2='15' y2='21'/></svg>
        Timetable
      </div>

      <div className='nav-section'>Focus</div>
      <div className={'nav-item ' + (activePage === 'focus' ? 'active' : '')} onClick={() => { setActivePage('focus'); setIsOpen(false); }}>
        <svg className='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg>
        Focus Session
      </div>
      <div className={'nav-item ' + (activePage === 'analytics' ? 'active' : '')} onClick={() => { setActivePage('analytics'); setIsOpen(false); }}>
        <svg className='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/></svg>
        Analytics
      </div>

      <div className='sidebar-bottom'>
        <div className='user-card'>
          <div className='avatar' style={{background:'var(--purple)', color:'white', fontWeight:'700'}}>{user?.name?.charAt(0).toUpperCase() || 'ST'}</div>
          <div className='user-info'>
            <div className='user-name'>{user?.name || 'Student Account'}</div>
            <div className='user-role' style={{display:'flex', alignItems:'center', gap:'4px'}}>
                University Portal 
                <span onClick={logout} style={{color:'var(--red)', cursor:'pointer', marginLeft:'4px', fontWeight:'700'}}>Logout</span>
            </div>
          </div>
          <div className='theme-btn' onClick={() => document.body.classList.toggle('dark-mode')} title='Toggle Dark/Light Mode'>
            <svg id='theme-icon' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='12' cy='12' r='5'></circle>
              <line x1='12' y1='1' x2='12' y2='3'></line>
              <line x1='12' y1='21' x2='12' y2='23'></line>
              <line x1='4.22' y1='4.22' x2='5.64' y2='5.64'></line>
              <line x1='18.36' y1='18.36' x2='19.78' y2='19.78'></line>
              <line x1='1' y1='12' x2='3' y2='12'></line>
              <line x1='21' y1='12' x2='23' y2='12'></line>
              <line x1='4.22' y1='19.78' x2='5.64' y2='18.36'></line>
              <line x1='18.36' y1='5.64' x2='19.78' y2='4.22'></line>
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;