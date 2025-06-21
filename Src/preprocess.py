import pandas as pd
import numpy as np
import re
from sklearn.model_selection import train_test_split


def load_data(file_path):
    """
    Load the cyclone dataset.
    :param file_path: Path to the CSV file containing cyclone data.
    :return: DataFrame containing the loaded data.
    """
    return pd.read_csv(file_path)


def clean_data(df):
    """
    Clean and preprocess the cyclone dataset.
    Includes handling missing values, converting coordinates, and encoding categories.

    :param df: Raw DataFrame.
    :return: Cleaned DataFrame.
    """
    NaNvalue = -999
    df = df.replace(NaNvalue, np.nan)

    # Convert Latitude and Longitude to numerical values
    def to_numerical(coord):
        direction = re.findall(r'[NSWE]', coord)[0]  # Extract direction
        num = re.match(r'[\d.]+', coord)[0]         # Extract numeric value
        return float(num) if direction in ['N', 'E'] else -float(num)

    df['Latitude'] = df['Latitude'].apply(to_numerical)
    df['Longitude'] = df['Longitude'].apply(to_numerical)

    # Drop unnecessary columns
    dropped_features = ['ID', 'Name', 'Date', 'Time', 'Event']
    df = df.drop(columns=dropped_features, errors='ignore')

    # Drop rows with missing values
    df = df.dropna()

    # Encode the 'Status' column as a categorical feature
    df['Status'] = df['Status'].astype('category').cat.codes

    return df


def split_data(df, target_column='Status', test_size=0.2):
    """
    Split the dataset into training and testing sets.
    :param df: Cleaned DataFrame.
    :param target_column: Target column to predict.
    :param test_size: Fraction of data to use as the test set.
    :return: x_train, x_test, y_train, y_test
    """
    X = df.drop(columns=[target_column])
    y = df[target_column]
    return train_test_split(X, y, test_size=test_size, stratify=y, random_state=42)


if __name__ == "__main__":

    file_path = "/mnt/c/Users/athul/Desktop/Disaster-Alert-and-Location-Monitoring-system/Data/atlantic.csv"
    #In windows use the below path
    #file_path = "C:/Users/athul/Desktop/Disaster-Alert-and-Location-Monitoring-system/Data/atlantic.csv"

    df = load_data(file_path)
    clean_df = clean_data(df)

    print("Splitting data into training and testing sets...")
    x_train, x_test, y_train, y_test = split_data(clean_df)

    print(f"Training data shape: {x_train.shape}")
    print(f"Test data shape: {x_test.shape}")
