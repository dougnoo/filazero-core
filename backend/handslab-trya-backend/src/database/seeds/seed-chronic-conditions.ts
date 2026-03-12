import fs from 'fs';
import path from 'path';
import AppDataSource from '../../database/data-source';

async function main() {
  const filePath = path.join(__dirname, 'condicoes_cronicas_trya.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const conditions: string[] = JSON.parse(raw);

  await AppDataSource.initialize();
  try {
    const batchSize = 500;
    for (let i = 0; i < conditions.length; i += batchSize) {
      const batch = conditions.slice(i, i + batchSize);
      const values = batch
        .map((_, idx) => `(uuid_generate_v4(), $${idx + 1}, now(), now())`)
        .join(',');
      await AppDataSource.query(
        `INSERT INTO "chronic_conditions" ("id", "name", "created_at", "updated_at")
				 VALUES ${values}
				 ON CONFLICT ("name") DO NOTHING`,
        batch,
      );
      console.log(
        `Processados ${Math.min(i + batchSize, conditions.length)}/${conditions.length}`,
      );
    }

    console.log(
      `Seeded ${conditions.length} chronic conditions (existing names skipped).`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
