from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
CSV_PATH = "CourseData.csv"
COURSE_ID_COL = "Code"
COURSE_NAME_COL = "Name"
TEXT_COLUMNS = ["Name", "Description", "Prerequisites", "Department"]
MODEL_NAME = "all-MiniLM-L6-v2"

# Global variables to store loaded data
df = None
model = None
course_embeddings = None
course_texts = None


def load_course_data(csv_path: str) -> pd.DataFrame:
    """Load course data from CSV file."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Course data file not found: {csv_path}")
    
    df = pd.read_csv(csv_path)
    
    # Basic sanity checks
    for col in [COURSE_ID_COL, COURSE_NAME_COL]:
        if col not in df.columns:
            raise ValueError(f"Expected column '{col}' not found in {csv_path}")
    
    missing_text_cols = [c for c in TEXT_COLUMNS if c not in df.columns]
    if missing_text_cols:
        print(f"Warning: These columns are missing and will be skipped: {missing_text_cols}")
    
    return df


def build_course_text(df: pd.DataFrame) -> list[str]:
    """Combine configured TEXT_COLUMNS into one text string per course."""
    parts = []
    for col in TEXT_COLUMNS:
        if col in df.columns:
            parts.append(df[col].fillna("").astype(str))
    
    if not parts:
        raise ValueError("No valid TEXT_COLUMNS found to build course text.")
    
    combined = parts[0]
    for p in parts[1:]:
        combined = combined + " " + p
    
    return combined.tolist()


def initialize_model():
    """Initialize the BERT model and embeddings."""
    global df, model, course_embeddings, course_texts
    
    print("Loading course data...")
    df = load_course_data(CSV_PATH)
    
    print("Building course text representations...")
    course_texts = build_course_text(df)
    
    print(f"Loading sentence-transformer model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)
    
    print(f"Encoding {len(course_texts)} course descriptions...")
    course_embeddings = model.encode(course_texts, normalize_embeddings=True)
    course_embeddings = np.array(course_embeddings)
    print("Done encoding. API ready to serve requests.")


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "courses_loaded": len(df) if df is not None else 0})


@app.route('/api/search', methods=['POST'])
def search_courses():
    """Search for courses based on natural language query."""
    global df, model, course_embeddings
    
    if df is None or model is None or course_embeddings is None:
        return jsonify({"error": "Model not initialized"}), 500
    
    try:
        data = request.get_json()
        user_query = data.get('query', '').strip()
        top_k = data.get('top_k', 5)
        
        if not user_query:
            return jsonify({"error": "Query is required"}), 400
        
        # Perform semantic search
        query_embedding = model.encode([user_query], normalize_embeddings=True)
        sims = cosine_similarity(query_embedding, course_embeddings).flatten()
        indices = sims.argsort()[::-1][:top_k]
        
        # Build response
        courses = []
        for i in indices:
            course_code = df.loc[i, COURSE_ID_COL]
            course_name = df.loc[i, COURSE_NAME_COL]
            dept = df.loc[i, "Department"] if "Department" in df.columns else "N/A"
            desc = df.loc[i, "Description"] if "Description" in df.columns else ""
            
            courses.append({
                "code": str(course_code),
                "title": str(course_name),
                "description": str(desc) if desc else "No description available",
                "department": str(dept),
                "similarity": float(sims[i])
            })
        
        return jsonify({
            "query": user_query,
            "courses": courses
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/courses', methods=['GET'])
def get_all_courses():
    """Get all courses (for debugging/testing)."""
    global df
    
    if df is None:
        return jsonify({"error": "Data not loaded"}), 500
    
    try:
        limit = request.args.get('limit', type=int)
        courses = []
        
        for idx, row in df.iterrows():
            if limit and len(courses) >= limit:
                break
            
            courses.append({
                "code": str(row[COURSE_ID_COL]),
                "title": str(row[COURSE_NAME_COL]),
                "description": str(row.get("Description", "")),
                "department": str(row.get("Department", "N/A"))
            })
        
        return jsonify({"courses": courses, "total": len(df)})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("Initializing Gator Course Advisor API...")
    initialize_model()
    print("\nStarting Flask server on http://localhost:5000")
    print("API endpoints:")
    print("  GET  /api/health - Health check")
    print("  POST /api/search - Search courses (body: {query: string, top_k?: number})")
    print("  GET  /api/courses - Get all courses (query param: ?limit=number)")
    print("\nPress Ctrl+C to stop the server.\n")
    
    app.run(debug=True, port=5000)

