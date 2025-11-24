import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
//const usersRoutes = require('./src/routes/users_routes');


app.use(express.json);

//app.use('/users', usersRoutes)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});