const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT ||5000;

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
        //post orders 
        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            console.log(result);   

            res.json(result);

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
        

    }
    finally{
       // await client.close();

    }
}
run().catch(console.dir);
app.listen(port, () => {
    console.log(` listening at http://localhost:${port}`)
})