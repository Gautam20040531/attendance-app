const studentsDB = {
  "B417AB04": { name: "Gautam Pal", roll: "CSE-01", status: "Present" },
  "ADABD505": { name: "Student 2", roll: "CSE-02", status: "Present" },
  "04A1311AE31094": { name: "Student 3", roll: "ECE-15", status: "Present" },
  "513F8321": { name: "Student 4", roll: "IT-08", status: "Present" }
};

let latestAttendance = null;

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { uid } = req.body;
    
    if (studentsDB[uid]) {
      const now = new Date();
      latestAttendance = {
        name: studentsDB[uid].name,
        roll: studentsDB[uid].roll,
        // সুন্দর ফরম্যাটে ডেট এবং টাইম
        time: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute:'2-digit', second:'2-digit' }),
        date: now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }),
        uid: uid,
        status: studentsDB[uid].status
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