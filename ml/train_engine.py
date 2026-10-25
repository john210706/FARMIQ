"""
FarmIQ Deep Stacking Agro-Mechanization Model Training Pipeline
Architectures:
  1. Stacking Regressor (LightGBM + XGBoost + Deep MLP Neural Network with Meta-Ridge) for Fuel & Hours
  2. Multi-class Random Forest Classifier for Engine Load Compatibility
  3. Tree-SHAP Explainable AI attribution generator
Exports:
  - farmiq_ml_bundle.joblib
  - metrics_summary.json
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from xgboost import XGBRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.ensemble import RandomForestClassifier, StackingRegressor
from sklearn.linear_model import RidgeCV
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
import shap

current_dir = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(current_dir, 'farmiq_mechanization_dataset.csv')

print(f"Loading 25,000-sample terramechanics dataset from: {dataset_path}")
df = pd.read_csv(dataset_path)

categorical_cols = ['task', 'soil_type', 'crop', 'drive_type']
numeric_cols = [
    'field_acres', 'soil_moisture_pct', 'tillage_depth_cm', 'tractor_hp',
    'implement_width_m', 'cone_index_kpa', 'terrain_slope_pct', 'ambient_temp_c'
]

# 1. Pipeline Feature Transformers
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_cols),
        ('cat', OneHotEncoder(sparse_output=False, handle_unknown='ignore'), categorical_cols)
    ]
)

X_processed = preprocessor.fit_transform(df[numeric_cols + categorical_cols])
cat_feature_names = preprocessor.named_transformers_['cat'].get_feature_names_out(categorical_cols).tolist()
all_feature_names = numeric_cols + cat_feature_names

y_fuel = df['total_fuel_litres'].values
y_time = df['total_hours'].values
y_slip = df['slip_ratio_pct'].values
y_compat = df['compatibility'].values

# Split 80/20 with fixed seed
X_train, X_test, y_f_train, y_f_test, y_t_train, y_t_test, y_s_train, y_s_test, y_c_train, y_c_test = train_test_split(
    X_processed, y_fuel, y_time, y_slip, y_compat, test_size=0.20, random_state=42
)

print(f"Training partition: {X_train.shape[0]} samples | Testing partition: {X_test.shape[0]} samples")
print("=" * 70)

# 2. Build High-Level Stacking Fuel Regressor (LGBM + XGBoost + Deep MLP)
print("Building High-Level Stacking Fuel Ensemble (LightGBM + XGBoost + Deep MLP)...")

base_fuel_estimators = [
    ('lgbm', LGBMRegressor(n_estimators=250, learning_rate=0.05, num_leaves=31, random_state=42, verbose=-1)),
    ('xgb', XGBRegressor(n_estimators=200, learning_rate=0.06, max_depth=6, random_state=42, tree_method='hist')),
    ('mlp', MLPRegressor(hidden_layer_sizes=(128, 64, 32), max_iter=200, early_stopping=True, random_state=42))
]

fuel_stack = StackingRegressor(
    estimators=base_fuel_estimators,
    final_estimator=RidgeCV(),
    cv=3,
    n_jobs=-1
)
fuel_stack.fit(X_train, y_f_train)
y_f_pred = fuel_stack.predict(X_test)

fuel_r2 = float(r2_score(y_f_test, y_f_pred))
fuel_rmse = float(np.sqrt(mean_squared_error(y_f_test, y_f_pred)))
fuel_mae = float(mean_absolute_error(y_f_test, y_f_pred))

print(f"  [Fuel Stacking Ensemble] R² Score: {fuel_r2:.4f}")
print(f"  [Fuel Stacking Ensemble] RMSE:     {fuel_rmse:.4f} Litres")
print(f"  [Fuel Stacking Ensemble] MAE:      {fuel_mae:.4f} Litres")
print("=" * 70)

# 3. Build Stacking Fieldwork Time Regressor
print("Building High-Level Stacking Operational Time Ensemble (LightGBM + XGBoost)...")
base_time_estimators = [
    ('lgbm', LGBMRegressor(n_estimators=220, learning_rate=0.06, num_leaves=27, random_state=42, verbose=-1)),
    ('xgb', XGBRegressor(n_estimators=180, learning_rate=0.07, max_depth=5, random_state=42, tree_method='hist'))
]
time_stack = StackingRegressor(
    estimators=base_time_estimators,
    final_estimator=RidgeCV(),
    cv=3,
    n_jobs=-1
)
time_stack.fit(X_train, y_t_train)
y_t_pred = time_stack.predict(X_test)

time_r2 = float(r2_score(y_t_test, y_t_pred))
time_rmse = float(np.sqrt(mean_squared_error(y_t_test, y_t_pred)))
time_mae = float(mean_absolute_error(y_t_test, y_t_pred))

print(f"  [Time Stacking Ensemble] R² Score: {time_r2:.4f}")
print(f"  [Time Stacking Ensemble] RMSE:     {time_rmse:.4f} Hours")
print(f"  [Time Stacking Ensemble] MAE:      {time_mae:.4f} Hours (~{int(time_mae * 60)} mins)")
print("=" * 70)

# 4. Train Wheel Slip Regressor
print("Training Wheel Slip Predictor (LightGBM)...")
slip_model = LGBMRegressor(n_estimators=150, learning_rate=0.06, num_leaves=25, random_state=42, verbose=-1)
slip_model.fit(X_train, y_s_train)
y_s_pred = slip_model.predict(X_test)
slip_r2 = float(r2_score(y_s_test, y_s_pred))
print(f"  [Wheel Slip Predictor] R² Score: {slip_r2:.4f}")
print("=" * 70)

# 5. Train Compatibility Classifier (Random Forest)
print("Training Multi-Class Tractor Compatibility Classifier (Random Forest)...")
compat_model = RandomForestClassifier(n_estimators=180, max_depth=14, class_weight='balanced', random_state=42, n_jobs=-1)
compat_model.fit(X_train, y_c_train)
y_c_pred = compat_model.predict(X_test)

target_names = ['UNDERPOWERED', 'OPTIMAL', 'OVERPOWERED']
class_report = classification_report(y_c_test, y_c_pred, target_names=target_names, output_dict=True)
conf_matrix = confusion_matrix(y_c_test, y_c_pred).tolist()

print(f"  [Compatibility Classifier] Accuracy:    {class_report['accuracy']:.4f}")
print(f"  [Compatibility Classifier] Macro F1:    {class_report['macro avg']['f1-score']:.4f}")
print("=" * 70)

# 6. Fit Tree-SHAP Explainer on base LightGBM regressor
print("Extracting Tree-SHAP Explainer for Explainability Waterfall...")
base_lgbm = fuel_stack.named_estimators_['lgbm']
explainer = shap.TreeExplainer(base_lgbm)
expected_val = float(np.ravel(explainer.expected_value)[0])
print(f"  Tree-SHAP Baseline Expected Fuel: {expected_val:.2f} Litres")

# 7. Serialize Bundle
bundle_path = os.path.join(current_dir, 'farmiq_ml_bundle.joblib')
artifacts = {
    'fuel_stack': fuel_stack,
    'time_stack': time_stack,
    'slip_model': slip_model,
    'compat_model': compat_model,
    'preprocessor': preprocessor,
    'numeric_cols': numeric_cols,
    'categorical_cols': categorical_cols,
    'feature_names': all_feature_names,
    'base_fuel_expected_val': expected_val,
    'metrics': {
        'fuel': {'r2': fuel_r2, 'rmse': fuel_rmse, 'mae': fuel_mae},
        'time': {'r2': time_r2, 'rmse': time_rmse, 'mae': time_mae},
        'slip': {'r2': slip_r2},
        'classification': class_report
    }
}
joblib.dump(artifacts, bundle_path)
print(f"\nStacked ML Bundle successfully exported: {bundle_path}")

metrics_path = os.path.join(current_dir, 'metrics_summary.json')
with open(metrics_path, 'w') as f:
    json.dump({
        'model_architecture': 'Stacked Ensemble (LightGBM + XGBoost + Deep MLP Regressor with RidgeCV Meta-Learner)',
        'samples': len(df),
        'fuel_metrics': {'r2': fuel_r2, 'rmse_litres': fuel_rmse, 'mae_litres': fuel_mae},
        'time_metrics': {'r2': time_r2, 'rmse_hours': time_rmse, 'mae_hours': time_mae},
        'slip_metrics': {'r2': slip_r2},
        'accuracy': class_report['accuracy'],
        'macro_f1': class_report['macro avg']['f1-score'],
        'confusion_matrix': conf_matrix
    }, f, indent=2)

print(f"Updated metrics summary written to: {metrics_path}")
print("High-level ML model training complete!")
