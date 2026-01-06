// data/paes-analysis.json.js
import * as duckdb from "npm:@duckdb/duckdb-wasm";

export default async function() {
  // Initialize DuckDB
  const db = await duckdb.createDB();
  const conn = await db.connect();

  // Your SQL queries here - this ensures they're run during build
  const results = {};

  // Add your key queries
  const valoresDeciles = await conn.query(`
    WITH tabla as (SELECT
      paes.RBD,
      NOM_RBD,
      NOM_COM_RBD,
      GRUPO_DEPENDENCIA,
      CLEC_REG_ACTUAL,
      MATE1_REG_ACTUAL,
      (CLEC_REG_ACTUAL+MATE1_REG_ACTUAL) / 2 as PROMEDIO
      FROM "data/Rinden_Admisión2026/ArchivoC_Adm2026REG.csv" paes
      LEFT JOIN "data/Directorio-Oficial-EE-2025/20250926_Directorio_Oficial_EE_2025_20250430_WEB.csv" dir
        ON paes.RBD = dir.RBD
      WHERE SITUACION_EGRESO = 1 AND CLEC_REG_ACTUAL > 0 AND MATE1_REG_ACTUAL > 0
    )
    SELECT
      'Decil ' || (ROW_NUMBER() OVER (ORDER BY percentile)) as decil,
      ROUND(percentile, 1) as valor_minimo
    FROM (
      SELECT DISTINCT
        QUANTILE(PROMEDIO, 0.1) OVER () as p10,
        QUANTILE(PROMEDIO, 0.2) OVER () as p20,
        QUANTILE(PROMEDIO, 0.3) OVER () as p30,
        QUANTILE(PROMEDIO, 0.4) OVER () as p40,
        QUANTILE(PROMEDIO, 0.5) OVER () as p50,
        QUANTILE(PROMEDIO, 0.6) OVER () as p60,
        QUANTILE(PROMEDIO, 0.7) OVER () as p70,
        QUANTILE(PROMEDIO, 0.8) OVER () as p80,
        QUANTILE(PROMEDIO, 0.9) OVER () as p90
      FROM tabla
    )
    UNPIVOT (percentile FOR decil_name IN (p10, p20, p30, p40, p50, p60, p70, p80, p90))
  `);

  results.valoresDeciles = valoresDeciles.toArray();

  await conn.close();
  await db.close();

  return results;
}