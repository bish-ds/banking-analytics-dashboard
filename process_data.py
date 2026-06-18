"""
Process Banking.csv and generate data.js for the banking analytics dashboard.
"""

import pandas as pd
import numpy as np
import json
import os

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(SCRIPT_DIR, "..", "Banking.csv")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "data.js")

def main():
    # Read CSV
    df = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df)} rows, {len(df.columns)} columns")
    print(f"Columns: {list(df.columns)}")

    # --- Build client records ---
    gender_map = {1: "Male", 2: "Female"}

    def income_band(income):
        if income < 100_000:
            return "Low"
        elif income < 300_000:
            return "Mid"
        else:
            return "High"

    clients = []
    for _, row in df.iterrows():
        clients.append({
            "age": int(row["Age"]),
            "nationality": str(row["Nationality"]),
            "gender": gender_map.get(int(row["GenderId"]), "Unknown"),
            "loyalty": str(row["Loyalty Classification"]),
            "feeStructure": str(row["Fee Structure"]),
            "riskWeighting": int(row["Risk Weighting"]),
            "income": round(float(row["Estimated Income"]), 2),
            "bankLoans": round(float(row["Bank Loans"]), 2),
            "bankDeposits": round(float(row["Bank Deposits"]), 2),
            "savingAccounts": round(float(row["Saving Accounts"]), 2),
            "checkingAccounts": round(float(row["Checking Accounts"]), 2),
            "businessLending": round(float(row["Business Lending"]), 2),
            "foreignCurrency": round(float(row["Foreign Currency Account"]), 2),
            "creditCardBalance": round(float(row["Credit Card Balance"]), 2),
            "superannuation": round(float(row["Superannuation Savings"]), 2),
            "propertiesOwned": int(row["Properties Owned"]),
            "creditCards": int(row["Amount of Credit Cards"]),
            "incomeBand": income_band(float(row["Estimated Income"])),
        })

    print(f"Built {len(clients)} client records")

    # --- Compute correlation matrix ---
    corr_columns = {
        "Estimated Income": "Income",
        "Superannuation Savings": "Superannuation",
        "Credit Card Balance": "CC Balance",
        "Bank Loans": "Bank Loans",
        "Bank Deposits": "Bank Deposits",
        "Checking Accounts": "Checking",
        "Saving Accounts": "Savings",
        "Foreign Currency Account": "Foreign Currency",
        "Business Lending": "Business Lending",
    }

    corr_df = df[list(corr_columns.keys())].astype(float)
    corr_matrix = corr_df.corr().values
    corr_matrix = np.round(corr_matrix, 2).tolist()

    labels = list(corr_columns.values())
    print(f"Computed {len(labels)}x{len(labels)} correlation matrix")

    # --- Assemble output ---
    banking_data = {
        "clients": clients,
        "correlationMatrix": {
            "labels": labels,
            "values": corr_matrix,
        },
    }

    # Write data.js
    json_str = json.dumps(banking_data, indent=2)
    js_content = f"const BANKING_DATA = {json_str};\n"

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(js_content)

    file_size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"Written {OUTPUT_PATH} ({file_size_kb:.1f} KB)")
    print("Done!")

if __name__ == "__main__":
    main()
