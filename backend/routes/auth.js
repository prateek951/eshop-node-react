const Router = require("express").Router;
const jwt = require("jsonwebtoken");
const HTTP_STATUS_CODES = require('http-status-codes');
const bcrypt = require("bcryptjs");
const db = require("../db");
const router = Router();

const createToken = () => {
  return jwt.sign({}, "secret", { expiresIn: "1h" });
};

router.post("/login", (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;

  db.GET_DATABASE()
    .db()
    .collection('users')
    .findOne({ email: email })
    .then(user => {
      // returns a Promise
      return bcrypt.compare(pw, user.password);
    })
    .then(result => {
      if(!result) {
        throw Error();
      }
      const token = createToken();
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ message: "Authentication succeeded", token: token });
    })
    .catch(err => {
      console.log(err);
      res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        message: "Authentication failed, invalid username or password"
      });
    });
});

// Adding an index to make the email unique
// db.users.createIndex({email:1},{unique: true})

router.post("/signup", (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;
  // Hash password before storing it in database => Encryption at Rest
  bcrypt
    .hash(pw, 12)
    .then(hashedPW => {
      // Store hashedPW in database
      console.log(hashedPW);
      db.GET_DATABASE()
        .db()
        .collection("users")
        .insertOne({
          email: email,
          password: hashedPW
        })
        .then(result => {
          console.log(result);
          const token = createToken();
          res.status(HTTP_STATUS_CODES.CREATED).json({ token: token, user: { email: email } });
        })
        .catch(err => {
          console.log(err);
          res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Creating the user failed." });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Creating the user failed." });
    });
  // Add user to database
});

module.exports = router;
