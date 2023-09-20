//Import Statements

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");

//Utilities
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

//Database Initialization
let db = null;
console.log("Hello");
const dbPath = path.join(__dirname, "busApplication.db");
const initializeAndSetUpDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3020, () =>
      console.log("Local Host Server started at port 3020")
    );
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeAndSetUpDatabase();

//Authentication(middleware) using JWT token
const authenticationToken = (req, res, next) => {
  let jwtToken;
  const authHeader = req.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    res.status(401);
    res.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        res.status(401);
        res.send("Invalid JWT Token");
      } else {
        req.user_name = payload.user_name;
        next();
      }
    });
  }
};

//Login API
app.post("/login/", async (req, res) => {
  const { user_name, password } = req.body;
  const selectQuery = `
    SELECT * FROM user WHERE user_name='${user_name}';
    `;
  const dbUser = await db.get(selectQuery);
  console.log(dbUser);
  if (dbUser === undefined) {
    res.status(400);
    res.send("Invalid user");
  } else {
    const payload = {
      user_name: user_name,
    };
    const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
    res.send({ jwtToken });
  }
});

//Get Specific User
app.get("/user/:user_id", authenticationToken, async (req, res) => {
  const { user_id } = req.params;

  const getQuery = `
       select * from USER where user_id=${user_id}
    `;

  const result = await db.get(getQuery);
  const obj = { susses: true, data: result };

  res.send(obj);
});

//Get all users
app.get("/users/", authenticationToken, async (req, res) => {
  const getQuery = `
       select * from user
    `;

  const result = await db.all(getQuery);
  const obj = { susses: true, data: result };

  res.send(obj);
});

//Add new user
app.post("/users/", async (request, response) => {
  const {
    username,
    password,
    phone_number,
    email_id,
    organization_id,
    default_bus_id,
    my_stop,
  } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE user_name = '${user_name}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        user (username, password, phone_number,email_id,organization_id,default_bus_id,my_stop) 
      VALUES 
        (
          '${username}', 
          '${password}',
          '${phone_number}', 
          '${email_id}',
          '${organization_id}',
          '${default_bus_id}',
          '${my_stop}'
        )`;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

//Get Specific driver details
app.get("/driver/:driver_id", authenticationToken, async (req, res) => {
  const { driver_id } = req.params;

  const getQuery = `
       select * from driver where driver_id=${driver_id}
    `;

  const result = await db.get(getQuery);
  const obj = { susses: true, data: result };

  res.send(obj);
});

//Get drivers list
app.get("/drivers/", authenticationToken, async (req, res) => {
  const getQuery = `
       select * from driver
    `;

  const result = await db.all(getQuery);
  const obj = { susses: true, data: result };

  res.send(obj);
});

//Add new driver
app.post("/driver/", async (request, response) => {
  const { driver_name, phone_number, location, bus_id } = request.body;
  const selectUserQuery = `SELECT * FROM driver WHERE driver_name = '${driver_name}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
       driver (driver_name,phone_number,location,bus_id) 
      VALUES 
        (
          '${driver_name}', 
          '${phone_number}',
          '${location}', 
          '${bus_id}'
        )`;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status = 400;
    response.send(
      "User already exists, if you want to update driver details click on update"
    );
  }
});

//Get Specific Bus details
app.get("/bus/:bus_id", authenticationToken, async (req, res) => {
  const { bus_id } = req.params;

  const getQuery = `
       select * from bus where bus_id=${bus_id}
    `;

  const result = await db.get(getQuery);
  const obj = { susses: true, data: result };

  res.send(obj);
});

//Get drivers list
app.get("/buses/", authenticationToken, async (req, res) => {
  const getQuery = `
       select * from bus
    `;

  const result = await db.all(getQuery);
  const obj = { susses: true, data: result };

  res.send(obj);
});

//Add new driver
app.post("/bus/", async (request, response) => {
  const { bus_number, number_plate } = request.body;
  const selectUserQuery = `SELECT * FROM driver WHERE bus_number = '${bus_number}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
       bus (bus_number,number_plate) 
      VALUES 
        (
          '${bus_number}', 
          '${number_plate}',
        )`;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status = 400;
    response.send(
      "User already exists, if you want to update driver details click on update"
    );
  }
});

module.exports = app;
