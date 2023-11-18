const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const secret = "543251423123123";

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//TODO - Change URI to Server URI
const uri = "mongodb://127.0.0.1:27017";
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ydmxw3q.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//getman
const gateman = (req, res, next) => {
  const token = req.cookies?.token;
  console.log(token);
  if (!token) {
    return res.status(401).send({ message: "NOT AUTHORIZED" });
  }
  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "NOT AUTHORIZED" });
    }
    // console.log(decoded);
    req.user = decoded;

    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const testCollection = client.db("carDatabaseDB").collection("Cars");
    //middlewares
    // verify token

    // JWT

    app.post("/api/auth/access-token", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, secret, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/api/user/logout", async (req, res) => {
      const user = req.body;
      res.clearCookie("token", {
        maxAge: 0,
        secure: true,
        sameSite: "none",
      });
      res.send({ success: true });
    });

    ///TODO -  api hare
    app.get("/api/test", gateman, async (req, res) => {
      const result = await testCollection.find().toArray();
      res.send(result);
    });

    // //NOTE - Pagination api

    // http://localhost:5000/api/all-assignments?limit=3&page=2
    // app.get("/api/all-assignments", async (req, res) => {
    //   const diffiFromUI = req.query?.difficulty;
    //   // console.log(req.query); // Corrected query parameter name

    //   const page = Number(req.query?.page);
    //   const limit = Number(req.query?.limit);
    //   const skip = (page - 1) * limit;

    //   let sortObj = {};
    //   let filter = {};

    //   if (diffiFromUI) {
    //     filter = { difficulty: diffiFromUI };
    //   }
    //   const result = await assignmentsCollection
    //     .find(filter)
    //     .skip(skip)
    //     .limit(limit)
    //     .toArray();
    //   const count = await assignmentsCollection.countDocuments(filter);
    //   res.send({ result, count });

    // });
    //

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Education is running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
