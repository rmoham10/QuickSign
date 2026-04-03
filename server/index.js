require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

console.log("Client URL:", process.env.CLIENT_URL)
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT, () =>
  console.log(`Server running on http://localhost:${process.env.PORT}`)
);