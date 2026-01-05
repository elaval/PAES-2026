import pandas as pd

df = pd.read_csv('ArchivoC_Adm2026REG.csv', sep=';', decimal=',')
df.to_parquet('ArchivoC_Adm2026REG.parquet')