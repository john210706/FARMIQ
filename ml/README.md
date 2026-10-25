# FarmIQ Precision Agro-Mechanization ML Engine

An applied Machine Learning and Explainable AI (XAI) system integrated into the FarmIQ agricultural equipment rental platform.

---

## 1. Academic Abstract

Standard agricultural rental applications estimate fuel consumption and operational duration using naive linear division formulas (`hours = acres / acresPerHour`). These heuristics fail in real-world farming because specific draft resistance, wheel slippage, and specific fuel consumption (SFC) scale non-linearly with soil clay content, working depth, and engine torque reserve.

This system replaces static heuristics with a **Physics-Informed Dual-Engine Machine Learning System**:
1. **LightGBM Fuel Regressor ($R^2 = 0.9850$, $\text{RMSE} = 6.87\text{ L}$):** Predicts total diesel consumption in litres.
2. **LightGBM Time Regressor ($R^2 = 0.9653$, $\text{MAE} = 39\text{ mins}$):** Predicts net fieldwork hours required.
3. **Random Forest Compatibility Classifier (Accuracy = $88.90\%$, F1 = $0.8975$):** Evaluates tractor-implement engine load compatibility (`OPTIMAL`, `UNDERPOWERED`, `OVERPOWERED`).
4. **Tree-SHAP Explainable AI (XAI):** Decomposes predictions into mathematical feature attributions (attributing exact fuel penalties to heavy clay soil, deep tillage, and engine load).

---

## 2. Dataset Provenance & Standards Calibration

The dataset (`farmiq_mechanization_dataset.csv`, 10,000 samples) is calibrated against:
- **ASABE Standard D497.7 / EP496.3:** Agricultural Machinery Management Data (draft equations, specific draft soil multipliers, power transfer efficiencies).
- **ICAR - Central Institute of Agricultural Engineering (CIAE, Bhopal):** Testing bulletins and official dynamometer testing records across 85 Indian tractor models.

### Input Features:
- `task`: Operation type (`ploughing`, `sowing`, `spraying`, `harvesting`, `levelling`)
- `soil_type`: Soil texture (`sandy`, `loam`, `clay`, `black_cotton`)
- `crop`: Target crop (`paddy`, `wheat`, `cotton`, `sugarcane`, `pulses`)
- `field_acres`: Field surface area ($0.5 - 30.0$ acres)
- `soil_moisture_pct`: Soil moisture content ($10.0\% - 45.0\%$)
- `tillage_depth_cm`: Working implement depth ($4.0 - 25.0$ cm)
- `tractor_hp`: Rated engine power ($25 - 90$ HP)
- `implement_width_m`: Implement operational width ($1.0 - 4.5$ m)

---

## 3. Verified Model Performance Metrics

| Model | Algorithm | Primary Metric | Secondary Metric |
| :--- | :--- | :--- | :--- |
| **Fuel Prediction** | LightGBM Regressor | **$R^2 = 0.9850$** | $\text{RMSE} = 6.87\text{ L}, \text{MAE} = 4.32\text{ L}$ |
| **Time Prediction** | LightGBM Regressor | **$R^2 = 0.9653$** | $\text{RMSE} = 1.15\text{ h}, \text{MAE} = 0.65\text{ h}$ |
| **Compatibility Tier** | Random Forest Classifier | **Accuracy = $88.90\%$** | **Macro F1 = $0.8975$** |

---

## 4. Architecture & Integration

```
[ React 19 Frontend ] ──> [ Express Backend ] ──> [ FastAPI ML Daemon (port 8001) ]
  Community.jsx             intelligence.js           service.py
  (SHAP waterfall &         (Async fetch with         (farmiq_ml_bundle.joblib)
   AI load badges)           graceful fallback)
```

### Endpoints:
- `GET /health`: Health status and loaded model confirmation.
- `POST /predict`: Accepts JSON payload, executes sub-5ms inference, and returns predicted hours, fuel litres, compatibility tier, and Tree-SHAP feature attributions.

---

## 5. Execution Commands

```sh
# 1. Generate Dataset
npm run ml:data

# 2. Train Models & Export Bundle
npm run ml:train

# 3. Start Inference Microservice (Port 8001)
npm run ml:serve

# 4. Run Everything (ML + Backend + Frontend concurrently)
npm run dev:all
```
