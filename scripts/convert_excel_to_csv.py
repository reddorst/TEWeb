import pandas as pd
import os

input_file = r"c:\Users\User\Downloads\Índice de Precios de Gas Natural.xlsx"
output_file = r"c:\Users\User\Downloads\precios_gas_natural_2017-2025_updated.csv"

try:
    print(f"Reading {input_file}...")
    df = pd.read_excel(input_file)
    
    # Rename columns by index to avoid encoding issues
    # 0: Tipo -> region
    # 1: Ao -> anio
    # 2: Mes -> mes
    # 3: ndice (MXN/GJ) -> indice_mxn_gj
    # 4: ndice (USD/MBtu) -> indice_usd_mbtu
    
    # We'll create a new dataframe with just the columns we need, renamed
    new_df = pd.DataFrame()
    new_df['region'] = df.iloc[:, 0]
    new_df['anio'] = df.iloc[:, 1]
    new_df['mes'] = df.iloc[:, 2]
    new_df['indice_mxn_gj'] = df.iloc[:, 3]
    new_df['indice_usd_mbtu'] = df.iloc[:, 4]
    
    # Filter only for 'IPGN' if needed, but let's keep all for now to match original CSV structure
    # Actually, the user has other regions in the file too (Region I, etc.)
    # The import script filters for 'IPGN' anyway.
    
    print(f"Writing to {output_file}...")
    new_df.to_csv(output_file, index=False, encoding='utf-8')
    
    print("Conversion complete.")
    print(f"Total rows: {len(new_df)}")
    print("First 5 rows:")
    print(new_df.head())
    
except Exception as e:
    print(f"Error converting file: {e}")
