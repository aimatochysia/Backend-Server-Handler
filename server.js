const express = require('express');
const path = require('path');
const { Client } = require('pg');
const cors = require('cors');

const app = express();

const DATABASE_URL = "postgresql://petra:Cd0DF6w8zIqedvVuLb91iQ@agile-db-9455.8nk.gcp-asia-southeast1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";
const client = new Client(DATABASE_URL);

client.connect()
  .then(() => console.log("Connected to the database"))
  .catch(err => console.error("Database connection error:", err));

app.use(express.json());
app.use(cors({
  origin: 'https://maritimal-illegal-ship-warning-system.vercel.app',
  credentials: true
}));

const selectUserQuery = `SELECT * FROM users WHERE email = $1;`;
const insertUserQuery = `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *;`;
const updateUserQuery = `UPDATE users SET password = $1 WHERE email = $2 RETURNING *;`;
const deleteUserQuery = `DELETE FROM users WHERE email = $1 RETURNING *;`;

async function getUserByEmail(email) {
  try {
    const result = await client.query(selectUserQuery, [email]);
    return result.rows[0];
  } catch (err) {
    console.error("Error selecting user:", err);
    throw err;
  }
}

async function createUser(email, password) {
  try {
    const result = await client.query(insertUserQuery, [email, password]);
    return result.rows[0];
  } catch (err) {
    console.error("Error inserting user:", err);
    throw err;
  }
}

async function updateUser(email, newPassword) {
  try {
    const result = await client.query(updateUserQuery, [newPassword, email]);
    return result.rows[0];
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
}

async function deleteUser(email) {
  try {
    const result = await client.query(deleteUserQuery, [email]);
    return result.rows[0];
  } catch (err) {
    console.error("Error deleting user:", err);
    throw err;
  }
}

app.get('/api/user/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const user = await getUserByEmail(email);
    if (user) {
      const formattedUser = JSON.stringify(user, null, 2);
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <html>
          <head>
            <meta name="color-scheme" content="light dark">
            <meta charset="utf-8">
            <style>
              /* You can add CSS styles for formatting here (optional) */
            </style>
          </head>
          <body>
            <pre>${formattedUser}</pre>
            <div class="json-formatter-container"></div> </body>
        </html>
      `);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Other CRUD routes remain unchanged...

app.listen(() => {
  console.log(`Server is running`);
});
