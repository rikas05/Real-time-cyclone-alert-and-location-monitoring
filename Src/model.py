import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV
from imblearn.over_sampling import SMOTE
from preprocess import load_data, clean_data, split_data


def oversample_data(x_train, y_train):
    """Oversample minority classes using SMOTE."""
    smote = SMOTE(random_state=42)
    x_resampled, y_resampled = smote.fit_resample(x_train, y_train)
    return x_resampled, y_resampled


def hyperparameter_tuning(x_train, y_train):
    """Perform hyperparameter tuning using GridSearchCV."""
    model = RandomForestClassifier(random_state=42, n_jobs=-1)
    param_grid = {
        "n_estimators": [100, 200, 300],
        "max_depth": [None, 10, 20],
        "max_features": ["sqrt", 0.1, 0.2],
        "class_weight": ["balanced", "balanced_subsample"],
    }
    grid_search = GridSearchCV(model, param_grid, cv=3, scoring="accuracy", n_jobs=-1)
    grid_search.fit(x_train, y_train)
    print("Best Parameters:", grid_search.best_params_)
    return grid_search.best_estimator_


def save_model(model, file_path):
    """Save the trained model to a file."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    joblib.dump(model, file_path)


if __name__ == "__main__":
    file_path = "/mnt/c/Users/athul/Desktop/Disaster-Alert-and-Location-Monitoring-system/Data/atlantic.csv"
    df = load_data(file_path)
    clean_df = clean_data(df)
    x_train, x_test, y_train, y_test = split_data(clean_df)

    # Handle class imbalance
    x_train, y_train = oversample_data(x_train, y_train)

    # Train the model with hyperparameter tuning
    model = hyperparameter_tuning(x_train, y_train)

    # Save the best model
    save_model(model, "../models/cyclone_model.pkl")
    print("Model training complete and saved.")
