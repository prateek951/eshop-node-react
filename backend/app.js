const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const DATABASE = require('./db');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  // Set CORS headers so that the React SPA is able to communicate with this server
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/products', productRoutes);
app.use('/', authRoutes);

const port = process.env.PORT || 3100;

DATABASE.INITIALISE_DATABASE((err,db) => {
  if(err) {
    console.log(err);
  }else {
    app.listen(port,() => console.log(`Server is running on the port: ${port}`));
  }
})
