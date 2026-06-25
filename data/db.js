const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname);

function ensureFile(filename, defaultData = []) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
  }
}

function read(filename) {
  const filepath = path.join(DATA_DIR, filename);
  ensureFile(filename, []);
  const raw = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(raw);
}

function write(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function findById(filename, id) {
  const items = read(filename);
  return items.find(item => item.id === id);
}

function insertOne(filename, item) {
  const items = read(filename);
  items.push(item);
  write(filename, items);
  return item;
}

function updateOne(filename, id, updates) {
  const items = read(filename);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  write(filename, items);
  return items[index];
}

function deleteOne(filename, id) {
  const items = read(filename);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  write(filename, filtered);
  return true;
}

module.exports = { read, write, findById, insertOne, updateOne, deleteOne, ensureFile };
