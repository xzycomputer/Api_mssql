const express = require('express');
const sql = require('mssql');
const app = express();
const fs = require('fs');



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
  var Dataprepared = []

  for(var i in data) {
    let prepare = {
      cx_email : data[i].memberEmail,
      cx_createdDateTime : data[i].memberCreateDate,
      services : data[i].memberGender
     }
   
     if(prepare.services == 'O'){
       prepare.services = ["cargoChina2thai"]
     }
   
     const time = new Date(prepare.cx_createdDateTime).toISOString();
     const editedtime = time.replace(/\.\d{3}Z$/, 'Z');
     prepare.cx_createdDateTime = editedtime
     Dataprepared.push(prepare)

  }

  console.log(Dataprepared)
  Dataprepared = JSON.stringify(Dataprepared)
  fs.writeFileSync('./member.json', Dataprepared)
  
});


// app.post('/data', async (req, res) => {
//   const { column1, column2 } = req.body; 
//   const query = `INSERT INTO m_member (column1, column2) VALUES ('${column1}', '${column2}')`;
//   await executeQuery(query);
//   res.send('Data added successfully');
// });

app.put('https://api.connect-x.tech/connectx/api/customer?externalId=cx_email', async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter
  const { column1, column2 } = req.body; // Assuming the request body contains column1 and column2 values
  const query = `UPDATE m_member SET column1 = '${column1}', column2 = '${column2}' WHERE id = ${id}`;
  await executeQuery(query);
  res.send('Data updated successfully');
});

// app.delete('/data/:id', async (req, res) => {
//   const { id } = req.params; // Assuming the ID is passed as a URL parameter
//   const query = `DELETE FROM m_member WHERE id = ${id}`;
//   await executeQuery(query);
//   res.send('Data deleted successfully');
// });

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
