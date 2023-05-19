const express = require('express');
const sql = require('mssql');
const app = express();
app.use(express.json());

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

app.post('/data', async (req, res) => {
  const { column1, column2 } = req.body; // Assuming the request body contains column1 and column2 values
  const query = `INSERT INTO m_member (column1, column2) VALUES ('${column1}', '${column2}')`;
  await executeQuery(query);
  res.send('Data added successfully');
});

app.put('/data/:id', async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter
  const { column1, column2 } = req.body; // Assuming the request body contains column1 and column2 values
  const query = `UPDATE m_member SET column1 = '${column1}', column2 = '${column2}' WHERE id = ${id}`;
  await executeQuery(query);
  res.send('Data updated successfully');
});

app.delete('/data/:id', async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter
  const query = `DELETE FROM m_member WHERE id = ${id}`;
  await executeQuery(query);
  res.send('Data deleted successfully');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
