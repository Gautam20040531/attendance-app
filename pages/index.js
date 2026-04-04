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
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>RFID Smart Attendance Dashboard</h1>
      <div style={{ marginTop: '30px' }}>
        {attendanceLog.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Waiting for student to tap card...</p>
        ) : (
          <table border="1" cellPadding="15" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
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
                  <td style={{ fontFamily: 'monospace' }}>{log.uid}</td>
                  <td>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}