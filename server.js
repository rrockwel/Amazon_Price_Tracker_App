require('dotenv').config();
const express = require('express');
const path = require('path');
const puppeteer = require('./puppeteer.js');
const createMongo = require('./createAndUpdateMongo.js');
const session = require('express-session');
const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/fixed')
const amazonLogin = require('./amazon_Affiliates_Login.js')

// Initiate Express App
const app = express();
app.use(express.urlencoded());

let htmlLinks = []


// Set Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Express-Session
app.use(session({
	secret: 'CatMat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: true,
				maxAge: 60000 }
}));

// Express-Messages
app.use(require('connect-flash')());

// Set EJS as View Engine
app.set('view engine', 'ejs');

// Main Page Route
app.get('/', (req,res)=>{
	let errors = [];
	res.render('urlInputFormPage.ejs', { errors : errors, htmlLinks : htmlLinks });
});

// Listen for Post from urlInputFormPage
app.post('/submit-form', [
		check('email').not().isEmpty().withMessage('Where Should We Send Your Price Update?'),
		check('email').isEmail().withMessage('Please Enter A Valid Email Address'),
		check('desiredPrice').not().isEmpty().withMessage('Please Let Us Know What Price We Should Watch For'),
		check('desiredPrice').isCurrency({require_decimal: true, digits_after_decimal: [2]}).withMessage('Please Enter A Valid Price (e.g. 43.29)'),
		check('amazonUrl').not().isEmpty().withMessage('Please Enter The URL of the Product You Wish to Watch'),
		check('amazonUrl').isURL().withMessage('Please Enter A Valid Amazon Product URL'),
		check('amazonUrl').contains('amazon').withMessage('Please Enter A URL From Amazon')


	], (req,res)=>{

		
		async function submitForm(amazonUrl,desiredPrice,email){
			// Stop the current instance of the scrape function
			puppeteer.stop();
			// Connect to MongoDB and update entry or create new entry
			// with post request data
			createMongo.newConnectToMongo(amazonUrl,desiredPrice,email)
			.then(()=>{
				// before pulling the new updated mongoDB data ...
				console.log('Pulling New Array');
				return createMongo.pullMongoArray();
			})
			.then((result)=>{
				// and restarting the repeating scrape function
				puppeteer.start(result);
			})

			amazonLogin.loginAmazon(req.body.amazonUrl)
			.then((result)=>{
				htmlLinks.push(result)
				console.log(htmlLinks)
			})
		}
		// Get return value from validation checks above
		const result = validationResult(req);
		const errors = result.errors;
	
		// if there are errors, render main page with the errors to be displayed with ejs
		if(!result.isEmpty()){
			res.render('urlInputFormPage.ejs', { errors : errors });
		}

		// if there are no errors, render main page with success message
		else if(result.isEmpty() === true){
			
		submitForm(req.body.amazonUrl, req.body.desiredPrice,req.body.email)

			let message = 'We Will Let You Know When Your Product Has Reached Your Desired Price';
			res.render('urlInputFormPage.ejs', { message : message });
		}	
});

PORT = process.env.PORT || 3001;

app.listen(PORT, ()=>{
	console.log("Express Server is listening on port 3001");
});

// Start scraping when server starts
createMongo.pullMongoArray()
.then((result)=>{
	puppeteer.start(result);
	startupAffiliateLinkScrape(result);

	async function startupAffiliateLinkScrape(result){
	for(let i = 0; i < result.length; i++){
		await amazonLogin.loginAmazon(result[i].productUrl)
		.then((result)=>{
			htmlLinks.push(result)
			})
		}
	}
});





