var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var config = {
  server: '203.154.222.73',
  authentication: {
    type: 'default',
    options: {
      userName: 'pmkadmin', // update me
      password: 'pmkadmin@2022' // update me
    }
  },
  options: {
    encrypt: false,
    database: 'CRM',
    port: 1433
  }
};

var connection = new Connection(config);
connection.on('connect', function(err) {
  if (err) console.log(err);
  else {
    console.log("Connected");
    executeStatement();
  }
});

connection.connect();

function executeStatement() {
  var request = new Request("SELECT * FROM m_member", function(err, rowCount) {
    if (err) {
      console.log(err);
    } else {
      console.log(rowCount + ' rows returned');
    }
    connection.close();
  });

  // Optionally, define input parameters if needed
  // request.addParameter('paramName', TYPES.VarChar, paramValue);

  request.on('row', function(columns) {
    // Process each row here
    columns.forEach(function(column) {
      console.log(column.metadata.colName + ": " + column.value);
    });
  });

  connection.execSql(request);
}
