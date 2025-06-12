const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

//MOU DATA
const excelPath = path.join(__dirname, "data", "mou_data.xlsx");

// Read MOU Excel data
const readData = () => {
  const wb = XLSX.readFile(excelPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
};

// Write MOU Excel data
const writeData = (data) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "MOU");
  XLSX.writeFile(wb, excelPath);
};

// File Upload Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/Users/HP/My Drive/MOU_Documents');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage });

// POST /submit-mou
app.post("/submit-mou", upload.single("document"), (req, res) => {
  const data = readData();
  const {
    IndustryName,
    Duration,
    FacultyName,
    FacultyDetails,
    AcademicYear,
    Purpose,
    Outcomes,
  } = req.body;

  const newEntry = {
    IndustryName,
    Duration,
    FacultyName,
    FacultyDetails,
    AcademicYear,
    Purpose,
    Outcomes,
    Document: req.file ? `/uploads/${req.file.filename}` : "",
  };

  data.push(newEntry);
  writeData(data);
  res.json({ message: "MOU submitted successfully!" });
});

// GET /download-mou
const tempDownloadPath = path.join(__dirname, "data", "filtered_mou.xlsx");

app.get("/download-mou", (req, res) => {
  const { AcademicYear, IndustryName, Duration, FacultyName } = req.query;

  let data = readData();

  if (AcademicYear) data = data.filter(row => row.AcademicYear === AcademicYear);
  if (IndustryName) data = data.filter(row => row.IndustryName === IndustryName);
  if (Duration) data = data.filter(row => row.Duration === Duration);
  if (FacultyName) data = data.filter(row => row.FacultyName === FacultyName);

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "FilteredMOU");

  XLSX.writeFile(wb, tempDownloadPath);

  res.download(tempDownloadPath, "FilteredMOU.xlsx", (err) => {
    if (!err) {
      fs.unlinkSync(tempDownloadPath); 
    }
  });
});

// GET /notifications
app.get("/notifications", (req, res) => {
  const filePath = path.join(__dirname, "data", "notifications.json");
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } else {
    res.json([]);
  }
});

//USER AUTHENTICATION 
const userExcelPath = path.join(__dirname, "data", "user.xlsx");

// Read users from Excel
const readUsers = () => {
  if (!fs.existsSync(userExcelPath)) return [];
  const wb = XLSX.readFile(userExcelPath);
  const sheet = wb.Sheets["Users"];
  return XLSX.utils.sheet_to_json(sheet);
};

// Write users to Excel
const writeUsers = (users) => {
  const ws = XLSX.utils.json_to_sheet(users);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  XLSX.writeFile(wb, userExcelPath);
};

// POST /register
app.post("/register", (req, res) => {
  const { name, dob, regno, email, password } = req.body;

  let users = readUsers();
  const userExists = users.find((u) => u.email === email);

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ name, dob, regno, email, password });
  writeUsers(users);

  res.json({ message: "Registration successful" });
});

// POST /login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let users = readUsers();

  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// START SERVER 
app.listen(5000, () => console.log("Server running at http://localhost:5000"));
require('./scheduler/notificationScheduler');
