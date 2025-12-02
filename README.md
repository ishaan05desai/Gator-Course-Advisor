# Gator Course Advisor

## Project Description

Gator Course Advisor is an AI-powered course recommendation tool designed specifically for University of Florida students. This project helps students select courses based on data-driven insights, analyzing course information, prerequisites, and student feedback to provide personalized recommendations.

## Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python 3.8 or higher**
  - Check your version: `python --version` or `python3 --version`
  - Download from [python.org](https://www.python.org/downloads/) if needed
- **Node.js 16 or higher** (includes npm)
  - Check your version: `node --version` and `npm --version`
  - Download from [nodejs.org](https://nodejs.org/) if needed
- **Git**
  - Check your version: `git --version`
  - Download from [git-scm.com](https://git-scm.com/downloads) if needed

### Step 1: Clone the Repository

```bash
git clone https://github.com/ishaan05desai/Gator-Course-Advisor.git
cd Gator-Course-Advisor
```

### Step 2: Set Up Python Backend

#### 2.1 Create a Virtual Environment

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` at the beginning of your command prompt, indicating the virtual environment is active.

#### 2.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages including:
- Flask (web framework)
- sentence-transformers (BERT model for semantic search)
- scikit-learn (similarity calculations)
- pandas & numpy (data processing)
- flask-cors (CORS support)

**Note:** The first installation may take several minutes as it downloads the BERT model and dependencies.

#### 2.3 Verify Course Data

Ensure that `CourseData.csv` is present in the project root directory. This file contains the course information needed for the application.

### Step 3: Set Up Frontend

#### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

#### 3.2 Install Node.js Dependencies

```bash
npm install
```

This will install React, TypeScript, Vite, and other frontend dependencies.

#### 3.3 Return to Project Root

```bash
cd ..
```

## Running the Application

The Gator Course Advisor consists of two components that need to run simultaneously:
1. **Backend API Server** (Python/Flask) - Handles course search requests
2. **Frontend Development Server** (React/Vite) - Provides the web interface

You'll need **two terminal windows** (or terminal tabs) to run both servers.

### Terminal 1: Start the Backend API Server

1. **Activate the virtual environment** (if not already active):

   **On Windows:**
   ```bash
   venv\Scripts\activate
   ```

   **On Mac/Linux:**
   ```bash
   source venv/bin/activate
   ```

2. **Start the Flask server:**
   ```bash
   python api_server.py
   ```

   **On Mac/Linux, you may need:**
   ```bash
   python3 api_server.py
   ```

3. **Wait for initialization:**
   - The server will load the course data and BERT model (this may take 1-2 minutes on first run)
   - You'll see messages like:
     ```
     Loading course data...
     Building course text representations...
     Loading sentence-transformer model: all-MiniLM-L6-v2
     Encoding X course descriptions...
     Done encoding. API ready to serve requests.
     Starting Flask server on http://localhost:5000
     ```

4. **Verify the backend is running:**
   - Open your browser and visit: `http://localhost:5000/api/health`
   - You should see a JSON response: `{"status": "healthy", "courses_loaded": <number>}`
   - **Keep this terminal window open** - the server must remain running

### Terminal 2: Start the Frontend Development Server

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - The terminal will display a local URL (typically `http://localhost:5173`)
   - Open this URL in your web browser
   - The frontend will automatically connect to the backend API on port 5000

### Using the Application

Once both servers are running:

1. **Open your browser** to the frontend URL (usually `http://localhost:5173`)
2. **Enter a search query** in natural language, for example:
   - "I want a beginner AI class with python"
   - "Upper-level data science course with lots of projects"
   - "Easy humanities gen-ed that focuses on culture and history"
3. **View results** - The application will display the top matching courses with descriptions, departments, and similarity scores

## Alternative: Running Semantic Search (Command Line)

If you prefer to use the command-line interface instead of the web application:

1. **Activate the virtual environment** (if not already active)
2. **Run the semantic search script:**
   ```bash
   python semantic_search.py
   ```
3. **Enter queries** when prompted
4. **Exit** by typing `q`, `quit`, or `exit`

## API Endpoints

The backend API provides the following endpoints:

- **`GET /api/health`** - Health check endpoint
  - Returns: `{"status": "healthy", "courses_loaded": <number>}`

- **`POST /api/search`** - Search for courses
  - Request body: `{ "query": "your search query", "top_k": 5 }`
  - Returns: List of matching courses with similarity scores

- **`GET /api/courses`** - Get all courses
  - Optional query parameter: `?limit=number` to limit results
  - Returns: List of all courses in the database

## Stopping the Application

- **Backend server:** Press `Ctrl+C` in Terminal 1
- **Frontend server:** Press `Ctrl+C` in Terminal 2
- **Deactivate virtual environment:** Run `deactivate` in Terminal 1 (optional)

## Troubleshooting

### Common Issues

**Backend won't start:**
- Ensure the virtual environment is activated (you should see `(venv)` in your prompt)
- Verify `CourseData.csv` exists in the project root
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Make sure port 5000 is not already in use by another application

**Frontend won't start:**
- Ensure you're in the `frontend` directory
- Verify Node.js dependencies are installed: `npm install`
- Check that port 5173 (or the displayed port) is not already in use

**Frontend can't connect to backend:**
- Verify the backend server is running on `http://localhost:5000`
- Check the backend terminal for error messages
- Test the backend directly: visit `http://localhost:5000/api/health` in your browser
- Ensure both servers are running simultaneously

**Model loading is slow:**
- The first API request will be slow (1-2 minutes) as the BERT model loads
- Subsequent requests will be much faster
- This is normal behavior on first run

**CORS errors:**
- The API server has CORS enabled by default
- If you encounter CORS issues, ensure both servers are running
- Check that the frontend is using the correct API endpoint

**"CourseData.csv not found" error:**
- Ensure `CourseData.csv` is in the project root directory (same level as `api_server.py`)
- The file should be present before starting the backend server

### Getting Help

If you encounter issues not covered here:
1. Check that all prerequisites are installed and up to date
2. Verify you're using the correct Python/Node.js versions
3. Ensure both terminal windows have the correct working directories
4. Review error messages in both terminal windows for specific issues
