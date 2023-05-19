const express = require('express');
const sql = require('mssql');
const app = express();

const config = {
  server: '203.154.222.73',
  database: 'CRM',
  user: 'pmkadmin',
  password: 'pmkadmin@2022',
  port: 1433,
  options: {
    encrypt: false
  }
};

async function executeQuery(query) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.log('Error: ', err);
  }
}

app.get('/data', async (req, res) => {
  const query = 'SELECT * FROM m_member';
  const data = await executeQuery(query);
  res.json(data);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});