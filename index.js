const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});

express()
  .get('/', (req, res) => res.sendFile(path.join(__dirname + '/pages/index.html'), {headers: {'Content-Type': 'text/html'}}))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM readings');
      const results = (result) ? result.rows : null;
      
      var readings =``;
      results.forEach(elm => {
        readings +=  `<li>ID: ${elm.id} Name: ${elm.name}</li>`
      });

      var content = `
      <!DOCTYPE html>
      <html>
      <head>
      </head>
      <body>

      <div class="container">
      <h2>Database Results</h2>
      <ul>
      ${readings}
      </ul>
      </div>

      </body>
      </html>
      `;

    res.send(content);
    client.release();

    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
