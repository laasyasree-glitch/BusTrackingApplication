const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
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

app.get("/user/:user_id", authenticationToken, async (req, res) => {
  const { user_id } = req.params;

  const getQuery = `
       select * from USER where user_id=${user_id}
    `;

  const result = await db.get(getQuery);
  const obj = { susses: true, data: result };

  res.send(obj);
});

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

module.exports = app;
