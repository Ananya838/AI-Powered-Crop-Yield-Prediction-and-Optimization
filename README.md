# 🌾 AI-Powered Crop Yield Prediction & Optimization

An end-to-end machine learning application that helps farmers **predict crop yields** and receive **AI-driven optimization recommendations** based on soil conditions, weather data, and crop type.

---

## 🚀 Features

| Feature | Description |
|---|---|
| **Yield Prediction** | Predict crop yield (kg/ha) using soil NPK, pH, weather inputs and XGBoost/Random Forest models |
| **Farm Optimization** | Get prioritized recommendations (fertilizer, irrigation, soil health) to improve yield |
| **Crop Encyclopedia** | Browse ideal growing conditions for 23+ crops |
| **Analytics Dashboard** | Bar charts, radar charts, prediction history |
| **REST API** | FastAPI backend with interactive Swagger docs at `/docs` |

---

## 🗂️ Project Structure

```
AI-Powered-Crop-Yield-Prediction-and-Optimization/
│
├── backend/                        # Python FastAPI backend
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── config.py               # Settings (pydantic-settings)
│   │   ├── models/
│   │   │   └── schemas.py          # Pydantic request/response models
│   │   ├── api/routes/
│   │   │   ├── predictions.py      # POST /api/v1/predictions/
│   │   │   ├── optimization.py     # POST /api/v1/optimization/
│   │   │   └── crops.py            # GET  /api/v1/crops/
│   │   └── services/
│   │       ├── prediction_service.py   # ML inference + heuristic fallback
│   │       └── crop_service.py         # Crop encyclopedia data
│   ├── ml/
│   │   ├── train.py                # Generate data + train models
│   │   ├── evaluate.py             # Evaluation plots + per-crop metrics
│   │   └── models/                 # Saved .joblib model files (generated)
│   ├── data/                       # Training CSV + evaluation reports (generated)
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                       # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx                 # Router + layout
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing page
│   │   │   ├── PredictPage.jsx     # Yield prediction form + results
│   │   │   ├── OptimizePage.jsx    # Optimization form + recommendations
│   │   │   ├── CropsPage.jsx       # Crop encyclopedia
│   │   │   └── DashboardPage.jsx   # Charts + history
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   └── services/api.js         # Axios API client
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── notebooks/
│   ├── 01_data_exploration.ipynb   # EDA: distributions, correlations
│   └── 02_model_training.ipynb     # Training + model comparison
│
├── docker-compose.yml              # One-command full-stack deployment
├── .env.example                    # Environment variable template
└── README.md
```

---

## ⚡ Quick Start

### Option 1 — Docker (recommended)

```bash
# Clone and start full stack
git clone https://github.com/Ananya838/AI-Powered-Crop-Yield-Prediction-and-Optimization.git
cd AI-Powered-Crop-Yield-Prediction-and-Optimization

docker-compose up --build
```

- Frontend: http://localhost:80
- API docs: http://localhost:8000/docs

---

### Option 2 — Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the ML model (generates ml/models/*.joblib)
python ml/train.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API available at: http://localhost:8000  
Swagger UI: http://localhost:8000/docs

#### Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend available at: http://localhost:5173

---

## 🤖 ML Model Details

### Features Used

| Feature | Description |
|---|---|
| `nitrogen` | Soil nitrogen (kg/ha) |
| `phosphorus` | Soil phosphorus (kg/ha) |
| `potassium` | Soil potassium (kg/ha) |
| `ph` | Soil pH |
| `organic_carbon` | Organic carbon (%) |
| `temperature` | Avg temperature (°C) |
| `rainfall` | Annual rainfall (mm) |
| `humidity` | Avg humidity (%) |
| `sunshine_hours` | Daily sunshine hours |
| `crop_code` | Encoded crop type |
| `season` | Encoded growing season |

### Training

- Generates **synthetic agronomic data** (9,200 samples across 23 crops)
- Trains **XGBoost**, **Random Forest**, and **Gradient Boosting**
- Selects best model by R² on 20% test split
- Saves model + scaler as `ml/models/*.joblib`

> Without a trained model, the API falls back to a heuristic formula for instant predictions.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/predictions/` | Predict crop yield |
| `POST` | `/api/v1/optimization/` | Get farm optimization recommendations |
| `GET` | `/api/v1/crops/` | List all crops with ideal conditions |
| `GET` | `/api/v1/crops/{name}` | Get details for a specific crop |
| `GET` | `/health` | Health check |

### Example Prediction Request

```bash
curl -X POST http://localhost:8000/api/v1/predictions/ \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "rice",
    "season": "Kharif",
    "area_hectares": 2.5,
    "soil": {"nitrogen": 90, "phosphorus": 42, "potassium": 43, "ph": 6.5, "organic_carbon": 2.1},
    "weather": {"temperature": 25, "rainfall": 1200, "humidity": 80, "sunshine_hours": 7}
  }'
```

### Example Response

```json
{
  "crop_type": "rice",
  "predicted_yield_kg_per_ha": 4182.5,
  "total_predicted_yield_kg": 10456.25,
  "confidence_score": 0.87,
  "yield_category": "High",
  "model_used": "XGBoost (trained)"
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, Pydantic v2 |
| ML | scikit-learn, XGBoost, pandas, numpy |
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Containerization | Docker, docker-compose |
| API docs | Swagger UI (auto-generated) |

---

## 📊 Supported Crops

Rice, Wheat, Maize, Chickpea, Kidney Beans, Pigeon Peas, Moth Beans, Mung Bean, Black Gram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee

---

## 🔮 Future Enhancements

- [ ] Real weather API integration (OpenWeatherMap)
- [ ] User authentication + farm profiles
- [ ] PostgreSQL database for prediction history
- [ ] Market price integration for profit estimation
- [ ] Mobile app (React Native)
- [ ] Satellite imagery analysis
- [ ] Multi-language support for farmers

---

## 📄 License

MIT License — free to use, modify, and distribute.
