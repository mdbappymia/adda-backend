const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.s3twy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const run = async () => {
  try {
    await client.connect();
    console.log("Database connected");
    const database = client.db("adda");
    const userCollection = database.collection("users");
    const postCollection = database.collection("posts");
    // get all user
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.json(result);
    });
    // get a single user

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.find({ email: email }).toArray();
      res.json(result);
    });
    // post a user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
    });
    // get a single user by specific email
    app.get("/users/:email", async (req, res) => {
      const query = { email: req.params.email };
      const result = await userCollection.findOne(query);
      res.json(result);
    });
    // post a single post
    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne(post);
      res.json(result);
    });
    // get all post
    app.get("/posts", async (req, res) => {
      const result = await postCollection.find({}).toArray();
      res.json(result);
    });
    // delete a single post
    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await postCollection.deleteOne(query);
      res.json(result);
    });
    // update a post
    app.put("/posts/:id", async (req, res) => {
      const updateText = req.body.updateText;
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          postText: updateText,
        },
      };
      console.log(updateText);
      const result = await postCollection.updateOne(query, updateDoc);
      res.json(result);
    });

    // update user to database
    app.put("/users", async (req, res) => {
      const options = { upsert: true };
      const query = { email: req.headers.email };
      const updateUser = {
        $set: req.body,
      };
      const result = await userCollection.updateOne(query, updateUser, options);
      res.json(result);
    });

    // update like
    app.put("/likes/:id", async (req, res) => {
      const likes = req.body;
      const id = req.params.id;
      const options = { upsert: true };
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          like: likes,
        },
      };
      const result = await postCollection.updateOne(query, updateDoc, options);
      res.json(result);
    });
  } finally {
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Server is running on port", port);
});
