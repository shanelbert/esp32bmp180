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
  .get('/', (req, res) => res.sendFile(path.join(__dirname + '/pages/index.html')))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT id, sensor, location, temperature, altitude, pressure, timestamp FROM readings');
      const results = result.rows;
      
      var readings =``;
      results.forEach(elm => {
        // var timestamp = elm.date +" "+elm.time;
        readings +=  `
        <tr>
          <td>${elm.id}</td>
          <td>${elm.sensor}</td>
          <td>${elm.location}</td>
          <td>${elm.temperature}</td>
          <td>${elm.altitude}</td>
          <td>${elm.pressure}</td>
          <td>${elm.timestamp}</td>
        </tr>`
      });

      var content = `
      <!DOCTYPE html>
      <html>
        <head>
        </head>
      <body>
        <div class="container">
          <h2>Database Results</h2>
          <table cellspacing="5" cellpadding="5">
            <tr>
              <th>ID</th>
              <th>Sensor</th>
              <th>Location</th>
              <th>Temperature (°C)</th>
              <th>Altitude (m)</th>
              <th>Pressure (Pa)</th>
              <th>Timestamp</th>
            </tr>
            ${readings}
          </table>
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
      
      // var result = await client.query('SELECT COUNT(*) FROM readings;');
      // var id = parseInt(result.rows[0].count) + 1;

      var sensor = req.body.sensor;
      var location = req.body.location;
      var temperature = req.body.temperature;
      var altitude = req.body.altitude;
      var pressure = req.body.pressure;
      var timestamp = req.body.timestamp;

      client.query(`INSERT INTO readings (sensor,location,temperature,altitude,pressure,timestamp) VALUES ('${sensor}', '${location}', '${temperature}', '${altitude}', '${pressure}', '${timestamp}');`
      , (err, res) => {
        try {
          if (err) throw err;
        } catch {
          console.error("Can't store the data");
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
