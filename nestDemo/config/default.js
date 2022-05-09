const path = require('path');
const cfg = {
  name: 'app',
  env: 'dev',
  fileDir: path.resolve(__dirname, '../.dev/file'),
  db: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'test',
    password: 'test',
    database: 'test',
  },
  redis: {
    host: 'localhost',
    port: 6379,
    db: 6,
  },
};

module.exports = cfg;
