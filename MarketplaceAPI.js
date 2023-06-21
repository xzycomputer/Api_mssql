const express = require('express');
const sql = require('mssql');
const app = express();
const { v4: uuidv4 } = require('uuid');

app.use(express.json());

const config = {
  server: '203.151.26.110',
  database: 'db_wms',
  user: 'csmile',
  password: 'csmile@12345',
  port: 14339,
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

//getcustomer
app.get('/Getcustomer', async (req, res) => {
  const query = `select Id, CustomerCode, CustomerName from Customer`;
  const data = await executeQuery(query);
  res.json(data);
});

//getcustomer ใส่ { "Customerid": "E81B2BC4-8421-4AAE-BA29-9AEB7B5520F0" }
app.get('/Getproduct', async (req, res) => {
  const query = `select p.id, p.ProductName, p.CustomerID, c.CustomerName, p.UnitId from Product p
  left join Customer c on p.CustomerID = c.Id
  where p.CustomerId = '${req.body.Customerid}'`;
  const data = await executeQuery(query);
  res.json(data);
});




app.post('/CreateSO', async (req, res) => {
  try {
    const GetSO = await createCustomerAddress(req.body);
    res.status(200).json({ GetSO });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer address.' });
  }
});

async function createCustomerAddress(addressData) {
  try {
    let ts = Date.now();
    let date_ob = new Date(ts);

    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let time = `${year}-${month}-${date}`;

    const query = `INSERT INTO CustomerAddress (CustomerId, Contact, Tel, Address, AddressType, ShippingType, IsActive, CreateBy, CreateDate, IsDelete)
    VALUES ('${addressData.Customerid}', '${addressData.Contact}', '${addressData.Tel}', '${addressData.Address}', 'ผู้รับ', 'ลูกค้า', 1, 'API', '${time}', 0)`;

    await executeQuery(query);

    const addressIdQuery = `SELECT TOP 1 Id FROM CustomerAddress WHERE CustomerId = '${addressData.Customerid}' ORDER BY Id DESC`;
    const addressIdData = await executeQuery(addressIdQuery);

    const SaleOrderHDQuery = `
    insert into SaleOrderHD (Id,BranchId, DocumentNo, DocumentDate, CustomerId, Status, Contact, DueDate, PaymentType, SaleId, IsCancel, AmountPaid, RecipientAddressId, SenderAddressId, IsActive, CreateApp, CreateBy, CreateDate, IsDelete, DocumentType, ReceiveHDId, DealerId)
    Values ('${uuidv4()}',1, '${addressData.Ordernumber}', '${addressData.Orderdate}', '${addressData.Customerid}', 'รอยืนยัน', '${addressData.Contact}', '${time}', '${addressData.PaymentType}', 3, 0, ${addressData.Amount}, ${addressIdData[0].Id}, 10702, 1, 'API', 'API', '${time}', 0, 'การสั่งเบิกสินค้า', '00000000-0000-0000-0000-000000000000', ${addressData.DeliveryBy})`;

    await executeQuery(SaleOrderHDQuery);

    const GetSOHeaderQuery = `select Id from SaleOrderHD where DocumentNo = '${addressData.Ordernumber}'`;
    const GetSOHeaderData = await executeQuery(GetSOHeaderQuery);


    const orderItems = addressData.OrderItems;
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const SaleOrderDTQuery = `
        insert into SaleOrderDT(HDId, ProductId, UnitId, Qty, IsActive, IsDelete, CreateBy, CreateDate, UnitPrice, Amount)
        values ('${GetSOHeaderData[0].Id}', ${item.Product}, ${item.UnitId}, ${item.Quantity}, 1, 0, 'API', '${time}', ${item.UnitPrice}, ${item.LineAmount})`;
      console.log(i)
      await executeQuery(SaleOrderDTQuery);
    }


  } catch (error) {
    throw new Error('Failed to create customer address.');
  }
}



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});



