📚 School Management Backend

This is the backend service for the School Management App.
It is built using Express.js, MySQL, and Multer to handle school data and image uploads.

🚀 Features

RESTful APIs built with Express.js

MySQL integration for storing school details

Multer for handling school image uploads

API routes for:

Adding a new school (POST /api/schools)

Fetching all schools (GET /api/schools)

Stores uploaded images in the schoolImages/ folder

Validations for email and required fields

🛠️ Tech Stack

Node.js

Express.js

MySQL (mysql2 package)

Multer for file uploads

CORS enabled for frontend communication

📂 Project Structure
backend/
│── config/
│   └── db.js          # MySQL database connection
│── routes/
│   └── schoolRoutes.js # School API routes
│── controllers/
│   └── schoolController.js # API logic
│── schoolImages/      # Uploaded images folder
│── server.js          # Entry point
│── package.json
│── .env               # Environment variables

⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/school-management-backend.git
cd school-management-backend

2️⃣ Install dependencies
npm install

3️⃣ Setup environment variables

Create a .env file in the root:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=school_db

4️⃣ Run the server
npm run dev


Server will start at:
👉 http://localhost:5000

📌 API Endpoints
➕ Add a School

POST /api/schools
Content-Type: multipart/form-data

Field	Type	Required	Description
name	string	✅	School name
address	string	✅	School address
city	string	✅	City of the school
state	string	✅	State of the school
contact	number	✅	Contact number
email_id	string	✅	Valid email
image	file	✅	School image upload

✅ Example using cURL:

curl -X POST http://localhost:5000/api/schools \
  -F "name=ABC School" \
  -F "address=Main Road" \
  -F "city=Mumbai" \
  -F "state=Maharashtra" \
  -F "contact=9876543210" \
  -F "email_id=abc@school.com" \
  -F "image=@school.jpg"

📖 Get All Schools

GET /api/schools

Response:

[
  {
    "id": 1,
    "name": "ABC School",
    "address": "Main Road",
    "city": "Mumbai",
    "image": "schoolImages/abc.jpg"
  }
]

🖼️ Image Storage

Uploaded images are stored in the schoolImages/ folder.

The database stores only the image filename/path.

🧑‍💻 Author

Created by Chirag Tank
