// pages/index.js
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
            const isDuplicate = prev.find(log => log.time === data.latestAttendance.time);
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
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ textAlign: 'center', color: '#fff' }}>RFID Smart Attendance Dashboard</h1>
      <div style={{ marginTop: '30px' }}>
        {attendanceLog.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#ccc' }}>Waiting for student to tap card...</p>
        ) : (
          <table border="1" cellPadding="15" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#000' }}>
            <thead>
              <tr style={{ background: '#0070f3', color: 'white' }}>
                <th>Student Name</th>
                <th>Card UID</th>
                <th>Time (IST)</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLog.map((log, index) => (
                <tr key={index} style={{ background: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ color: 'green', fontWeight: 'bold', fontSize: '18px' }}>{log.name}</td>
                  {/* এখানে লেখার রঙ কালো করে দেওয়া হয়েছে */}
                  <td style={{ fontFamily: 'monospace', color: '#333', fontWeight: 'bold' }}>{log.uid}</td>
                  <td style={{ color: '#333', fontWeight: 'bold' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}