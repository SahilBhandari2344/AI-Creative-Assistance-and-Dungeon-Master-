# 🎲 How to Run

## 1. Ollama
```bash
ollama serve
ollama pull phi3:mini
ollama run phi3:mini
```

## 2. Backend
```bash
cd dnd-backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## 3. Frontend
```bash
cd dnd-frontend-fixed
npm install
npm run dev
```

Open `http://localhost:3000` 🚀
