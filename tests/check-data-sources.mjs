import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const config = JSON.parse(readFileSync(resolve('data_sources.json'), 'utf8'));
const ids = new Set();
const symbols = new Set();
const allowedSources = new Set(['yahoo', 'fred']);

if (!Array.isArray(config.symbols) || config.symbols.length < 20) {
  throw new Error('Expected data_sources.json to contain a meaningful symbols array');
}

for (const row of config.symbols) {
  for (const key of ['id', 'name', 'group', 'source', 'asset_class', 'return_type', 'notes']) {
    if (!row[key]) throw new Error(`${row.id || '<unknown>'} is missing ${key}`);
  }
  if (ids.has(row.id)) throw new Error(`Duplicate data source id: ${row.id}`);
  ids.add(row.id);
  if (!allowedSources.has(row.source)) throw new Error(`${row.id} has unsupported source ${row.source}`);
  const symbol = row.ticker || row.series_id;
  if (!symbol) throw new Error(`${row.id} needs ticker or series_id`);
  const sourceSymbol = `${row.source}:${symbol}`;
  if (symbols.has(sourceSymbol)) throw new Error(`Duplicate source symbol: ${sourceSymbol}`);
  symbols.add(sourceSymbol);
}

console.log(`Validated ${config.symbols.length} data sources.`);
