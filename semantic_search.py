import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

CSV_PATH = "CourseData.csv"

COURSE_ID_COL = "Code"

COURSE_NAME_COL = "Name"

# Column(s) to build the semantic text from
TEXT_COLUMNS = [
    "Name",
    "Description",
    "Prerequisites",
    "Department"
]

# Truncates description when printing
MAX_DESC_LEN = 220

# SentenceTransformer model we'll use
MODEL_NAME = "all-MiniLM-L6-v2"


def load_course_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)

    # Basic sanity checks / fallback
    for col in [COURSE_ID_COL, COURSE_NAME_COL]:
        if col not in df.columns:
            raise ValueError(f"Expected column '{col}' not found in {csv_path}")

    missing_text_cols = [c for c in TEXT_COLUMNS if c not in df.columns]
    if missing_text_cols:
        print(f"Warning, these columns are missing in the CSV and will be skipped: {missing_text_cols}")

    return df

# Combine configured TEXT_COLUMNS into one text string per course
def build_course_text(df: pd.DataFrame) -> list[str]:
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

# EMBEDDING MODEL
def build_bert_embeddings(texts: list[str], model_name: str = MODEL_NAME):
    print(f"Loading sentence-transformer model: {model_name}")
    model = SentenceTransformer(model_name)

    print(f"Encoding {len(texts)} course descriptions...")
    embeddings = model.encode(texts, normalize_embeddings=True)
    embeddings = np.array(embeddings)
    print("Done encoding.")
    return model, embeddings

# RECOMMENDATION / SEARCH
def recommend_from_query(
    df: pd.DataFrame,
    model: SentenceTransformer,
    course_embeddings: np.ndarray,
    user_query: str,
    top_k: int = 5
):
    if not user_query.strip():
        print("Empty query. Please type a description of what you're looking for.")
        return

    query_embedding = model.encode([user_query], normalize_embeddings=True)
    sims = cosine_similarity(query_embedding, course_embeddings).flatten()
    indices = sims.argsort()[::-1][:top_k]

    print(f"\nQuery: \"{user_query}\"")
    print("-" * 80)
    print("Top matching courses:\n")

    for rank, i in enumerate(indices, start=1):
        course_id = df.loc[i, COURSE_ID_COL]
        course_name = df.loc[i, COURSE_NAME_COL]
        dept = df.loc[i, "Department"] if "Department" in df.columns else "N/A"

        desc = df.loc[i, "Description"] if "Description" in df.columns else ""
        if isinstance(desc, str) and len(desc) > MAX_DESC_LEN:
            desc = desc[:MAX_DESC_LEN] + "..."

        print(f"{rank}. {course_id} - {course_name}")
        print(f"   Department: {dept}")
        print(f"   Similarity: {sims[i]:.3f}")
        if desc:
            print(f"   Description: {desc}")
        print()

# MAIN CLI LOOP
def main():
    print("--- Gator Course Advisor: Semantic Search Demo ---")
    print("Loading course data from:", CSV_PATH)
    df = load_course_data(CSV_PATH)

    course_texts = build_course_text(df)
    model, embeddings = build_bert_embeddings(course_texts)

    print("\nType what you're looking for in a UF course.")
    print("Examples:")
    print("  - I want a beginner AI class with python")
    print("  - Upper-level data science course with lots of projects")
    print("  - Easy humanities gen-ed that focuses on culture and history")
    print("Type 'q' or 'quit' to exit.\n")

    while True:
        user_query = input("Describe your ideal course: ").strip()
        if user_query.lower() in {"q", "quit", "exit"}:
            print("Exiting. Goodbye!")
            break

        recommend_from_query(df, model, embeddings, user_query, top_k=5)


if __name__ == "__main__":
    main()
