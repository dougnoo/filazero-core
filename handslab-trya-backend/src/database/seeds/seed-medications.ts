import fs from 'fs';
import path from 'path';
import AppDataSource from '../../database/data-source';

type MedicationSeedItem = {
  nome: string;
  principio_ativo: string;
};

async function main() {
  const filePath = path.join(__dirname, 'medicamentos_uso_continuo_br.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const items: MedicationSeedItem[] = JSON.parse(raw);

  await AppDataSource.initialize();
  try {
    const batchSize = 500;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const values = batch
        .map((_, idx) => {
          const base = idx * 2;
          return `(uuid_generate_v4(), $${base + 1}, $${base + 2}, now(), now())`;
        })
        .join(',');
      const params = batch.flatMap((item) => [
        item.nome.trim(),
        (item.principio_ativo || '').trim(),
      ]);

      await AppDataSource.query(
        `INSERT INTO "medications" ("id", "name", "active_principle", "created_at", "updated_at")
         VALUES ${values}
         ON CONFLICT ("name") DO UPDATE SET "active_principle" = EXCLUDED."active_principle", "updated_at" = now()`,
        params,
      );
      console.log(
        `Processados ${Math.min(i + batchSize, items.length)}/${items.length}`,
      );
    }
    console.log(`✅ ${items.length} medicamentos inseridos/atualizados`);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
