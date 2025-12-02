# Gator Course Advisor

## Project Description

Gator Course Advisor is an upcoming AI-powered course recommendation tool designed specifically for University of Florida students. This project aims to help students select courses based on data-driven insights, analyzing course information, prerequisites, and student feedback to provide personalized recommendations.

The project is currently in its early stages of development. Our goal is to create a comprehensive system that will assist UF students in making informed decisions about their academic journey through intelligent course recommendations.

## Getting Started – Local Repository Setup Guide

### Prerequisites

Before setting up the project locally, ensure you have the following installed on your system:

- **Python 3.8 or higher**: Check your Python version by running `python --version` or `python3 --version`
- **Git**: Verify Git installation with `git --version`

### Step 1: Clone the Repository

#### For Both Windows and Mac:

```bash
git clone https://github.com/ishaan05desai/Gator-Course-Advisor.git
cd Gator-Course-Advisor
```

### Step 2: Create a Virtual Environment

#### On Windows:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

#### On Mac/Linux:

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### Step 3: Install Dependencies

Once your virtual environment is activated, install the project dependencies:

```bash
pip install -r requirements.txt
```

**Note**: The requirements.txt file and actual project dependencies may be added in future development phases as the project evolves.

### Step 4: Verify Setup

After completing the setup, you should see `(venv)` at the beginning of your command prompt, indicating that the virtual environment is active.

To deactivate the virtual environment when you're done working on the project:

```bash
deactivate
```

## Running the Semantic Search Feature

The Gator Course Advisor includes a content-based recommendation system that uses BERT sentence embeddings to help you find courses based on natural language descriptions.

### Installing ML Dependencies

After setting up your virtual environment (see steps above), install the required machine learning libraries:

```bash
pip install sentence-transformers scikit-learn pandas numpy
```

These packages include:
- `sentence-transformers`: BERT-based semantic search model
- `scikit-learn`: For cosine similarity calculations
- `pandas`: Data processing
- `numpy`: Numerical operations

### Running Semantic Search

Once the dependencies are installed, you can run the semantic search tool:

```bash
python semantic_search.py
```

or on Mac/Linux:

```bash
python3 semantic_search.py
```

### How to Use

The semantic search tool allows you to describe what you're looking for in natural language, and it will recommend the most relevant UF courses.

**Example queries:**
- "I want a beginner AI class with python"
- "Upper-level data science course with lots of projects"
- "Easy humanities gen-ed that focuses on culture and history"

The tool will display the top 5 matching courses with their descriptions, departments, and similarity scores.

To exit the tool, type `q`, `quit`, or `exit`.

**Note**: Make sure `CourseData.csv` is present in the project directory before running the semantic search feature.

## Running the Full Application (Frontend + Backend API)

The Gator Course Advisor now includes a web interface that connects to a semantic search API backend.

### Backend API Setup

1. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the API Server**:
   ```bash
   python api_server.py
   ```
   
   The server will start on `http://localhost:5000`. The first run will take some time as it loads the BERT model and processes course embeddings.

3. **Verify the API is Running**:
   - Visit `http://localhost:5000/api/health` in your browser
   - You should see a JSON response with the server status

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (or another port if 5173 is busy).

4. **Access the Application**:
   - Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)
   - The frontend will automatically connect to the API server running on port 5000

### API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/search` - Search for courses
  - Request body: `{ "query": "your search query", "top_k": 5 }`
  - Returns: List of matching courses with similarity scores
- `GET /api/courses` - Get all courses (optional `?limit=number` query parameter)

### Troubleshooting

- **Frontend can't connect to API**: Make sure the API server is running on port 5000
- **Model loading takes time**: The first API request will be slow as the BERT model loads. Subsequent requests will be faster.
- **CORS errors**: The API server has CORS enabled, but if you encounter issues, make sure both servers are running