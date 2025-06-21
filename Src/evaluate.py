import joblib
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from preprocess import load_data, clean_data, split_data

# Evaluate the model
def evaluate_model(model, x_test, y_test):
    y_pred = model.predict(x_test)  # Predictions
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))  # Matrix of actual vs predicted
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))  # Detailed metrics
    print("\nAccuracy Score:", accuracy_score(y_test, y_pred))  # Overall accuracy

if __name__ == "__main__":
    model_path = "../models/cyclone_model.pkl"  # Trained model file
    data_path = "/mnt/c/Users/athul/Desktop/Disaster-Alert-and-Location-Monitoring-system/Data/atlantic.csv"  # Data file path for wsl
    #data_path = "C:/Users/athul/Desktop/Disaster-Alert-and-Location-Monitoring-system/Data/atlantic.csv"  # Data file path for windows
    model = joblib.load(model_path)  # Load trained model
    df = load_data(data_path)  # Load raw data
    clean_df = clean_data(df)  # Clean data
    _, x_test, _, y_test = split_data(clean_df)  # Split data
    evaluate_model(model, x_test, y_test)  # Evaluate the model
