const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});

express()
  .use(bodyParser.json())
  .get('/', (req, res) => res.sendFile(path.join(__dirname + '/pages/index.html'), {headers: {'Content-Type': 'text/html'}}))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM readings');
      const results = (result) ? result.rows : null;
      
      var readings =``;
      results.forEach(elm => {
        readings +=  `<li>ID: ${elm.id} Sensor: ${elm.sensor} Location:${elm.location} Temperature:${elm.temperature} Altitude:${elm.altitude} Pressure:${elm.pressure} Timestamp::${elm.tstamp}</li>`
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
      res.status(500).send("Error " + err);
      client.release();
    }
  })
  .post('/dbpost', async (req, res) => {
    try {
      const client = await pool.connect();
      
      const nbelement = client.query('SELECT COUNT(*) FROM readings;')

      // client.query(`INSERT INTO readings VALUES (${nbelement+1}, '${req.body.sensor}', '${req.body.location}', ${parseFloat(req.body.temperature)}, ${parseFloat(req.body.altitude)}, ${parseFloat(req.body.pressure)}, '${req.body.timestamp}');`
      client.query(`INSERT INTO readings VALUES (${nbelement+1}, '${req.body.sensor}', '${req.body.location}', ${req.body.temperature}, ${req.body.altitude}, ${req.body.pressure}, '${req.body.timestamp}');`
      , (err, res) => {
        try {
          if (err) throw err;
        } catch {
          console.error("Can't store the data");
          console.log(req.body);
        }
      });
      res.sendStatus(200);
      client.release();
    } catch (err) {
      console.error(err);
      res.status(500).send("Error " + err);
      client.release();
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
