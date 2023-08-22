const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
app.listen(3000);
console.log("Hello Bus");
module.exports = app;
