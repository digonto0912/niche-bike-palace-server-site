const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT ||5000;
const objectId = require('mongodb').ObjectId;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pwb5s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);


app.get('/', (req, res) => {
    res.send('Hello bike place!')
})

async function run(){
    try{
        await client.connect();
        const database = client.db('fahrad_portal');
        const orderCollection = database.collection('orders');
        const productCollection = database.collection('allProducts');
        const userCollection = database.collection('users');
        const revieCollection = database.collection('reviews');
        //post orders 
        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            console.log(result);   

            res.json(result);

        })
        // api for admin check
        app.get ('/users/:email',async(req,res)=>{
                const email = req.params.email;
                const query = {email:email};
                const user = await userCollection.findOne(query);
                let isAdmin = false;
                if(user?.role === 'admin'){
                    isAdmin =true;

                }
                res.json({admin:isAdmin})

            })

        //get data by users
        app.get('/orders',async(req,res)=>{
            const email = req.query.email;
            const query = {email:email}
            console.log(query);
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders); 


        })
        //get all products
        app.get('/allproducts',async (req,res)=>{
            const  cursor = productCollection.find({})
            const result = await cursor.toArray();
            res.json(result);
        })

        //get all order fro order
        app.get ('/allorder',async(req,res)=>{
            const cursor = orderCollection.find({})
            const result = await cursor.toArray();
            res.json(result);
        })
       // save user api 
       app.post('/users',async(req,res)=>{
           const user = req.body;
           const result =await userCollection.insertOne(user);
           res.json(result);
       })
       //upsert
       app.put('/users',async(req,res)=>{
           const user = req.body;
           console.log('put',user);
           const filter = {email:user.email};
           const options = {upsert:true};
           const updateDoc ={$set:user};
           const result =await userCollection.updateOne(filter,updateDoc,options);
           res.json(result);

       })
       // api make an admin

       app.put('/users/admin',async(req,res)=>{
           const user = req.body;
            console.log(user);
           const filter = {email:user.email};
           const updateDoc = {$set:{role:'admin'}};
           const result = await userCollection.updateOne(filter,updateDoc);
           res.json(result);
       })

       //add product
        app.post("/addproducts", async (req, res) => {
            console.log(req.body);
            const result = await productCollection.insertOne(req.body);
            console.log(result);


        })
        //api delete from my order+***

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('deleted from client', id);
            const query = {_id:objectId(id)};
            const result = await orderCollection.deleteOne(query);
            console.log('deleted from server', result);
            res.json(result);
        })
        // api delete from all product
        app.delete('/allproducts/:id',async(req,res)=>{
            const id =req.params.id;
            console.log('delete from all product',id)
            const query = {_id:objectId(id)};
            const result = await productCollection.deleteOne(query);
            console.log('deleted from all products');

            res.send(result);
        })
        //all order api
        app.get("/allOrders", async (req, res) => {
            // console.log("hello");
            const result = await orderCollection.find({}).toArray();
            res.send(result);
        });

        //api review
        app.post("/addSReview", async (req, res) => {
            const result = await revieCollection.insertOne(req.body);
            res.send(result);
        });
        //get review
        app.get("/allreview", async (req, res) => {
            // console.log("hello");
            const result = await revieCollection.find({}).toArray();
            res.send(result);
        });


        

    }
    finally{
       // await client.close();

    }
}
run().catch(console.dir);
app.listen(port, () => {
    console.log(` listening at http://localhost:${port}`)
})