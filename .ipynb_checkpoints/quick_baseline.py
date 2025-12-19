# Quick baseline models without hyperparameter tuning
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import numpy as np

# Load data
df = pd.read_csv('Attrition.csv')
df['Attrition'] = df['Attrition'].map({'Yes': 1, 'No': 0})

target = 'Attrition'
X = df.drop(columns=[target])
y = df[target]

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Quick encoding
cat_cols = X_train.select_dtypes(include=['object']).columns
num_cols = X_train.select_dtypes(exclude=['object']).columns

encoder = OneHotEncoder(sparse_output=False, drop='first')
X_train_encoded = encoder.fit_transform(X_train[cat_cols])
X_test_encoded = encoder.transform(X_test[cat_cols])

X_train_final = np.concatenate([X_train[num_cols].values, X_train_encoded], axis=1)
X_test_final = np.concatenate([X_test[num_cols].values, X_test_encoded], axis=1)

# Test models with default params
models = {
    'Random Forest': RandomForestClassifier(random_state=42),
    'KNN': KNeighborsClassifier(),
    'SVM': SVC(random_state=42)
}

results = []
for name, model in models.items():
    print(f'Training {name}...')
    model.fit(X_train_final, y_train)
    train_acc = accuracy_score(y_train, model.predict(X_train_final))
    test_acc = accuracy_score(y_test, model.predict(X_test_final))
    results.append({
        'Model': name,
        'Train Accuracy': f'{train_acc:.3f}',
        'Test Accuracy': f'{test_acc:.3f}'
    })

print('\nRESULTS:')
for result in results:
    print(f"{result['Model']}: Train={result['Train Accuracy']}, Test={result['Test Accuracy']}")

print(f"\nData shape: {X_train_final.shape[1]} features, {len(y_train)} training samples")
print(f"Attrition rate: {y_train.mean():.1%}")
