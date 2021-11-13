const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//midleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a7yox.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("cycleValleyDB");

        const orderCollection = database.collection("products");
        const singleOrderCollection = database.collection("order");
        const reviewCollection = database.collection("review");
        const usersCollection = database.collection("users");
        
        //Get, Post, Delete product
        app.post('/addProduct', async (req, res) => {
            const services = req.body;
               const result = await orderCollection.insertOne(services);
               res.json(result);
        })

        app.get('/allProducts', async (req, res) => {
            const result = await orderCollection.find({}).toArray();
            console.log(result);
            res.send(result)
       })

        //Delete Product

        app.delete('/deleteProduct/:id', async (req, res) => {
            const deleteItem = (req.params.id);
            const result = await orderCollection.deleteOne({_id:ObjectId(deleteItem)})
            res.send(result)
        })


       //User collection

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.send({ admin: isAdmin });
       })

        app.post('/users',async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.send(result);
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result);
        })

        //get order  ....


        app.get('/singleOrder/:id',async (req, res) => {
            const result = await orderCollection.find({ _id: ObjectId(req.params.id) }).toArray();
            res.send(result[0]);
        })

        //Order confirm
        app.post('/confirmOrder',async (req, res) => {
            const orders = req.body;
            const result = await singleOrderCollection.insertOne(orders);
            res.send(result);
            console.log(result);
        })

        app.get('/manageOrder', async (req, res) => {
            const allOrders = await singleOrderCollection.find({}).toArray();
            console.log(allOrders);
            res.send(allOrders)
        })

        //my Order
        app.get('/myOrder/:email', async (req, res) => {
            const result = await singleOrderCollection.find({email: req.params.email}).toArray([]);
            res.send(result);
            console.log(result);
        })
        
        //Delete myOrders
        app.delete('/deleteOrder/:id', async (req, res) => {
            const deleteItem = (req.params.id);
            const result = await singleOrderCollection.deleteOne({_id:ObjectId(deleteItem)})
            res.send(result)
        })

        //Post review
        app.post('/review',async (req, res) => {
            const orders = req.body;
            const result = await reviewCollection.insertOne(orders);
            res.send(result);
            console.log(result);
        })

        //Get review
        app.get('/review',async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.send(result);
        })

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Cycle valley server is running')
})

app.listen(port, () => {
    console.log('Listening port on',port);
})