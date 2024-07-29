const { createPool } = require('mysql2/promise');

const config = {
  host: '106.75.233.89',
  port: 3306,
  password: '990415',
  user: 'root',
  database: 'sso',
  connectionLimit: 10,
  multipleStatements: false,
  namedPlaceholders: true,
  flags: ['-FOUND_ROWS'],
};
const pool = createPool(config);

const query = async (sql, params) => {
  let connection = null;
  try {
    connection = await pool.getConnection();
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    console.error(sql, params);
    console.error(error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// debug
// query('select * from account').then((res) => {
//   console.log('db', res);
// });

exports.query = query;
