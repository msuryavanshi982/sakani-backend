const axios = require('axios');
const mysql = require('mysql');
const fs = require("fs");
// MySQL database configuration
const dbConfig = {
    host: process.env.HOST_MYSQL,
    user: process.env.USER_MYSQL,
    database: process.env.DATABASE_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    port: process.env.PORT_MYSQL,
    waitForConnections: true,
    connectionLimit: 2000,
    queueLimit: 0,
    multipleStatements: true,
    // ssl: false
    ssl: { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") }
};

function tranformImages(img, t) {
    if (t) {
        var x = [];
        for (i of img) {
            x.push(i.file)
        }
        return x.join(',')
    } else {
        return img.join(',')
    }
}

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Function to insert data into the MySQL table
async function insertDataIntoTable(data) {
    const query = 'INSERT INTO sakanisV3 SET ?';
    console.log(data, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    try {
        const fxf = {
            amenities: await tranformImages(data.amenities, false),
            bathrooms: data.bathrooms,
            bedrooms: data.bedrooms,
            broker_company_name: data.broker_company_name,
            broker_phone: data.broker_phone,
            building_name: data.building_name,
            community: data.community,
            created: data.created,
            createdAt: data.createdAt,
            description: '',
            furnishing: data.furnishing,
            id: data.id,
            price: data.price,
            property_images: await tranformImages(data.property_images, true),
            property_type: data.property_type,
            purpose_1: data.purpose_1,
            purpose_2: data.purpose_2,
            short_description: data.short_description,
            size: data.size,
            sub_community: data.sub_community,
            updatedAt: data.updatedAt
        }
        pool.query(query, fxf, (err, result) => {
            if (err) {
                // Handle the error here (e.g., log the error, skip the record, etc.)
                console.error('Error inserting data:', err);
            } else {
                console.log('Data inserted successfully!');
            }
        });
    } catch (error) {
        console.log(error)
    }
}

// Function to process the API response and insert data into the table
async function processData(apiUrl) {
    try {
        const response = await axios.get(apiUrl);
        // console.log(response.data.results)
        const { next, results } = response.data;

        // Insert data one by one
        for (const item of results) {
            console.log(item)
            try {
                // Assuming the data structure matches the table columns
                await insertDataIntoTable(item);
            } catch (error) {
                // Handle the error during insertion (e.g., skip the record, log the error, etc.)
                console.error('Error processing data:', error);
            }
        }

        // If the 'next' URL is available, recursively call the function
        if (next) {
            await processData(next);
        }
    } catch (error) {
        console.error('Error fetching data from API:', error);
    }
}

// Start processing data from the API (assuming the API URL is https://localhost/?page=1)
processData('https://api.sakanihomes.com/api/v1/properties/');


function x() {

}

module.exports = x;