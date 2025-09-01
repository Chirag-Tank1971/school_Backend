const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// MySQL Connection with better error handling
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'school_db',
  connectTimeout: 60000
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err);
    // Don't exit the process, just log the error
    return;
  }
  console.log('Connected to MySQL database');
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'school-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to check for duplicate school name
const checkDuplicateSchool = (name, callback) => {
  const sql = 'SELECT id FROM schools WHERE name = ?';
  db.execute(sql, [name], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results.length > 0);
  });
};

// Routes with better error handling
app.post('/api/schools', upload.single('image'), (req, res) => {
  console.log('Received request to add school:', req.body);
  
  const { name, address, city, state, contact, email_id } = req.body;
  const image = req.file ? req.file.filename : null;

  // Input validation
  if (!name || !address || !city || !state || !contact || !email_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // First check for duplicate school name
  checkDuplicateSchool(name, (err, isDuplicate) => {
    if (err) {
      console.error('Database error during duplicate check:', err);
      return res.status(500).json({ error: 'Failed to check for duplicate school', details: err.message });
    }
    
    if (isDuplicate) {
      return res.status(409).json({ error: 'A school with this name already exists' });
    }
    
    // If no duplicate, proceed with insertion
    const sql = `INSERT INTO schools (name, address, city, state, contact, image, email_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.execute(sql, [name, address, city, state, contact, image, email_id], 
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to add school', details: err.message });
        }
        res.status(201).json({ message: 'School added successfully', id: results.insertId });
      });
  });
});

app.get('/api/schools', (req, res) => {
  console.log('Received request to fetch schools');
  
  const sql = 'SELECT id, name, address, city, image FROM schools ORDER BY id DESC';
  
  db.execute(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch schools', details: err.message });
    }
    console.log(`Fetched ${results.length} schools`);
    res.json(results);
  });
});

// Get a specific school by ID
app.get('/api/schools/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'SELECT * FROM schools WHERE id = ?';
  
  db.execute(sql, [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch school', details: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }
    
    res.json(results[0]);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  db.execute('SELECT 1', (err) => {
    if (err) {
      return res.status(500).json({ status: 'Database connection failed', error: err.message });
    }
    res.json({ status: 'OK', message: 'Server is running' });
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: error.message });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});