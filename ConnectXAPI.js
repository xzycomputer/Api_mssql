const express = require('express');
const sql = require('mssql');
const axios = require('axios');
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
  let ts = Date.now();
  let date_ob = new Date(ts);

  let date = date_ob.getDate();
  let month = date_ob.getMonth() + 1;
  let year = date_ob.getFullYear();
  let time = `${year}-${month}-${date}`;

  console.log(time)

  const query = `SELECT * FROM m_member WHERE memberCreateDate >= '${time}'`;
  const data = await executeQuery(query);
  res.json(data);

  for (var i in data) {
    // edit table to post
    let prepare = {
      cx_email: data[i].memberEmail,
      cx_createdDateTime: data[i].memberCreateDate,
      services: data[i].memberGender
    };

    if (prepare.services == 'O') {
      prepare.services = ["cargoChina2thai"];
    }

    const time = new Date(prepare.cx_createdDateTime).toISOString();
    const editedtime = time.replace(/\.\d{3}Z$/, 'Z');
    prepare.cx_createdDateTime = editedtime;

    try {
      const access_token = await loginAndGetAccessToken();
      await patchMemberData(access_token, prepare);
    } catch (error) {
      console.log('Error while patching member data:', error);
    }
   
  }
  
});

async function loginAndGetAccessToken() {
  try {
    const response = await axios.post('https://api.connect-x.tech/connectx/api/auth/login', {
      "email": "ctt-api@connect-x.tech",
      "password": "fb61b8fab6404e288b734ef2b8e755fc7dcd02d0"
    });
    const { access_token } = response.data;
    return access_token;
  } catch (error) {
    console.log('Error while logging in:', error.response.data);
    throw error;
  }
}

async function patchMemberData(access_token, data) {
  try {
    const response = await axios.patch('https://api.connect-x.tech/connectx/api/customer?externalId=cx_email', data, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Member data patched successfully:', response.data);
  } catch (error) {
    console.log('Error while patching member data:', error.response.data);
    throw error;
  }
}

app.post('/login', async (req, res) => {
  try {
    const access_token = await loginAndGetAccessToken();
    res.json({ access_token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
