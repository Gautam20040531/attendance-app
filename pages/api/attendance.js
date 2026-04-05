// pages/api/attendance.js
const studentsDB = {
  "B417AB04": { name: "Gautam Pal", status: "Present" },
  "ADABD505": { name: "Student 2 (Keychain 1)", status: "Present" }
  "04A1311AE31094": { name: "Student 3 (Keychain 2)", status: "Present" }
  "513F8321": { name: "Student 4 (Keychain 3)", status: "Present" }
};

let latestAttendance = null;77

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { uid } = req.body;
    
    if (studentsDB[uid]) {
      latestAttendance = {
        name: studentsDB[uid].name,
        time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
        uid: uid
      };
      return res.status(200).json({ success: true, message: "Attendance Logged" });
    } else {
      return res.status(404).json({ success: false, message: "Unknown Card" });
    }
  } 
  
  else if (req.method === 'GET') {
    return res.status(200).json({ latestAttendance });
  }
}