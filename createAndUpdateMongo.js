const MongoClient = require('mongodb').MongoClient;
const { setIntervalAsync } = require('set-interval-async/dynamic')


const connectionString = process.env.Connection_STRING;


async function newConnectToMongo(url,price,email){
	let mongoClient = await new MongoClient(connectionString, { useUnifiedTopology: false});
	let client = await mongoClient.connect()
	const db = await client.db('Users');
	await db.collection('stuff').countDocuments({ "productUrl" : url, "email" : email},(err,data)=>{
		if(data==0){
			console.log('Creating MongoDB Entry');
			db.collection('stuff').insertOne({
				productUrl: url,
				desiredPrice: price,
				email : email
			});


			// Call amazon_Affiliate_Login here and return affiliate link
			// to be displayed at the bottom of the page
			




		}else if(data==1){
			console.log('Updating MongoDB Entry');
			db.collection('stuff').updateOne({
				productUrl : url,
				email : email
			},
			{
				$set : { 'desiredPrice' : price }
			})
		}
	})
}


// Gets entire array from MongoDB to be passed to puppeteer for page scraping
async function pullMongoArray(){
	console.log('Pulling MongoDB Array')
	const client = new MongoClient(connectionString, { useUnifiedTopology: false });
	await client.connect()
	let object = await client.db('Users').collection('stuff').find().toArray();
	await client.close();
	return object;
};

// Delete Item From MongoDB
async function deleteItem(productLink){
	const deleteClient = new MongoClient(connectionString, { useUnifiedTopology: false })	
	await deleteClient.connect();
	console.log('Connected To MongoDB to Delete')
	let db = deleteClient.db('Users');
	console.log('Found Delete Database');
	await console.log(productLink)
	await db.collection('stuff').deleteOne({ "productUrl": productLink }) 
	console.log('Deleted Product')
	await deleteClient.close();
}


module.exports = {
	pullMongoArray : pullMongoArray,
	newConnectToMongo : newConnectToMongo,
	deleteItem : deleteItem
};