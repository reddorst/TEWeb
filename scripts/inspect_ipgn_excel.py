import pandas as pd
import os

file_path = r"c:\Users\User\Downloads\Índice de Precios de Gas Natural.xlsx"

try:
    # Read the Excel file
    # We'll read the first sheet by default
    df = pd.read_excel(file_path)
    
    print("--- Sheet Names ---")
    print(df.keys())
    
    print("\n--- Columns ---")
    print(df.columns.tolist())
    
    print("\n--- First 5 Rows ---")
    print(df.head(5))
    
    print("\n--- Rows 95 to 105 (User mentioned 99-103) ---")
    # Adjusting for 0-based index vs 1-based usually used by users
    # User said rows 99-103. Let's print a range around there.
    print(df.iloc[90:110])
    
except Exception as e:
    print(f"Error reading Excel file: {e}")
