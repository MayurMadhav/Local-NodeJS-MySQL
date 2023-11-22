const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON body
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// MySQL database connection configuration
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'mysql',
    database: 'covid19'
});


const covidData = [
    { stateName: 'State1', positiveCases: 100 },
    { stateName: 'State2', positiveCases: 150 },
    // Add more data as needed
];


// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get('/', (req, res) => {
    // Fetch data from the database
    db.query('SELECT * FROM covid_details', (err, results) => {
        if (err) {
            console.error('Error fetching data from the database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Pass the fetched data to the EJS template
        res.render('index', { covidData: results });
    });
});


// Route to handle form submissions
app.post('/submitData', (req, res) => {
    const data = req.body;

    // Perform SQL INSERT query
    const sql = `
        INSERT INTO Covid_details
        (State_Name, Date_of_Record, No_of_Samples, No_of_Deaths, No_of_Positive, No_of_Negative, No_of_Discharge)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        data.stateName,
        data.recordDate,
        data.samples,
        data.deaths,
        data.positiveCases,
        data.negativeCases,
        data.discharge,
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data into the database:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        console.log('Data inserted successfully');
        res.json({ success: true });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
