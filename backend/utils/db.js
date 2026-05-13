const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../models/db.json');

const readDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = { users: [], products: [], carts: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

const mockModel = (collectionName) => ({
  findOne: async (query) => {
    const db = readDB();
    const collection = db[collectionName] || [];
    return collection.find((item) => {
      return Object.entries(query).every(([key, value]) => {
        if (typeof value === 'object' && value.$or) {
          return value.$or.some((subQuery) => {
            const [subKey, subVal] = Object.entries(subQuery)[0];
            return item[subKey] === subVal;
          });
        }
        return item[key] === value;
      });
    });
  },
  findById: async (id) => {
    const db = readDB();
    const collection = db[collectionName] || [];
    return collection.find((item) => item.id === id || item._id === id);
  },
  create: async (data) => {
    const db = readDB();
    if (!db[collectionName]) db[collectionName] = [];
    const newItem = {
      id: `mock_${Date.now()}`,
      _id: `mock_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (newItem.password) {
      newItem.password = await bcrypt.hash(newItem.password, 10);
    }
    db[collectionName].push(newItem);
    writeDB(db);
    return newItem;
  },
  save: async (item) => {
    const db = readDB();
    const idx = db[collectionName].findIndex((i) => i.id === item.id || i._id === item._id);
    if (idx !== -1) {
      db[collectionName][idx] = { ...item, updatedAt: new Date().toISOString() };
      writeDB(db);
    }
    return item;
  }
});

module.exports = { readDB, writeDB, mockModel };
