import os
import joblib

model_path = os.path.join(os.path.dirname(__file__), 'catboost_model.pkl')

print("model path is", model_path)
#loding our model
model = joblib.load(model_path)
