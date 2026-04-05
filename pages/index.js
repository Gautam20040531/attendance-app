import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [attendanceLog, setAttendanceLog] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/attendance');
        const data = await res.json();
        
        if (data.latestAttendance) {
          setAttendanceLog((prev) => {
            const isDuplicate = prev.find(log => log.time === data.latestAttendance.time && log.uid === data.latestAttendance.uid);
            if (isDuplicate) return prev;
            return [data.latestAttendance, ...prev];
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '40px 20px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: '#f8fafc' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#38bdf8', letterSpacing: '1px' }}>Digontom Technologies</h1>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Enterprise RFID Attendance Portal</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '10px 25px', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Present</span>
            <strong style={{ fontSize: '28px', color: '#10b981' }}>{attendanceLog.length}</strong>
          </div>
        </div>

        {/* Table Section */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', overflow: 'hidden', border: '1px solid #334155' }}>
          {attendanceLog.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
              <svg style={{ width: '60px', height: '60px', margin: '0 auto 15px auto', opacity: 0.5, color: '#38bdf8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
              <p style={{ fontSize: '20px', margin: 0, fontWeight: '500', color: '#94a3b8' }}>System Active & Monitoring</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Please tap an RFID card on the scanner to log attendance.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '18px 24px', borderBottom: '1px solid #334155' }}>Student Details</th>
                  <th style={{ padding: '18px 24px', borderBottom: '1px solid #334155' }}>Roll No.</th>
                  <th style={{ padding: '18px 24px', borderBottom: '1px solid #334155' }}>Card UID</th>
                  <th style={{ padding: '18px 24px', borderBottom: '1px solid #334155' }}>Date & Time</th>
                  <th style={{ padding: '18px 24px', borderBottom: '1px solid #334155', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLog.map((log, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #334155', transition: 'background-color 0.2s', backgroundColor: index % 2 === 0 ? '#1e293b' : '#1a2235' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '500', color: '#f8fafc', fontSize: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', marginRight: '12px', boxShadow: '0 0 8px #10b981' }}></div>
                        {log.name}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#cbd5e1', fontSize: '14px' }}>{log.roll}</td>
                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: '#94a3b8', fontSize: '14px' }}>{log.uid}</td>
                    <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: '500' }}>{log.date}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{log.time}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}