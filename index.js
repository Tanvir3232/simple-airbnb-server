const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xpliwro.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const categoryCollection = client.db('simpleAirbnb').collection('categories');
    const serviceCollection = client.db('simpleAirbnb').collection('services');
    // Category related api
    app.get('/categories',async(req,res)=>{
        const result = await categoryCollection.find().toArray();
        res.send(result);
    })
    app.post('/add-category',async(req,res)=>{
        const newCategory = req.body;
        console.log(newCategory);
        const result = await categoryCollection.insertOne(newCategory);
        res.send(result);
    })
    // Service related api
    app.get('/services',async(req,res)=>{
        let query = {};
        if(req.query?.category){
          query = {category: req.query.category}
        }
        if (req.query?.searchText) {
          const searchTextRegex = new RegExp(req.query.searchText, "i");
          query = {
            $or: [
              { propertyType: { $regex: searchTextRegex } },
              { propertyTitle: { $regex: searchTextRegex } },
              { category: { $regex: searchTextRegex } },
              { address: { $regex: searchTextRegex } },
              { guests: { $regex: searchTextRegex } },
              { bedrooms: { $regex: searchTextRegex } },
              { bathrooms: { $regex: searchTextRegex } },
              { nightlyRate: { $regex: searchTextRegex } },
              { availabilityCalendar: { $regex: searchTextRegex } },
              { beds: { $regex: searchTextRegex } }
            ]
          };
         
        }
        
        const result = await serviceCollection.find(query).toArray();
        res.send(result);
    })
    app.post('/add-service',async(req,res)=>{
        const newService = req.body
        const result = await serviceCollection.insertOne(newService);
        res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
     // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Airbnb Server running');
})
app.listen(port, () => {
    console.log('Airbnb server running on port:', port);
})