import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export type RecordMap = { [key: string]: any };

const DATA_DIR = path.resolve(process.cwd(), 'api', 'data');
const CONTENTS_FILE = path.join(DATA_DIR, 'contents.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONTENTS_FILE)) fs.writeFileSync(CONTENTS_FILE, '[]', 'utf8');
}

function readAll(): RecordMap[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(CONTENTS_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAll(items: RecordMap[]) {
  ensureDataFile();
  fs.writeFileSync(CONTENTS_FILE, JSON.stringify(items, null, 2));
}

export function list(page = 1, limit = 10) {
  const items = readAll().sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  const total = items.length;
  const offset = (page - 1) * limit;
  const pageItems = items.slice(offset, offset + limit);
  return {
    data: pageItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export function getById(id: string) {
  return readAll().find((it) => String(it.id) === String(id)) || null;
}

export function create(attrs: RecordMap) {
  const now = new Date().toISOString();
  const rec = { id: randomUUID(), created_at: now, updated_at: now, ...attrs };
  const items = readAll();
  items.unshift(rec);
  writeAll(items);
  return rec;
}

export function update(id: string, attrs: RecordMap) {
  const items = readAll();
  const idx = items.findIndex((it) => String(it.id) === String(id));
  if (idx === -1) return null;
  const now = new Date().toISOString();
  items[idx] = { ...items[idx], ...attrs, updated_at: now };
  writeAll(items);
  return items[idx];
}

export function remove(id: string) {
  const items = readAll();
  const next = items.filter((it) => String(it.id) !== String(id));
  writeAll(next);
  return next.length !== items.length;
}

