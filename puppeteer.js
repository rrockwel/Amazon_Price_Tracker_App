// source: https://levelup.gitconnected.com/anonymous-web-scrapping-with-node-js-tor-apify-and-cheerio-3b36ec6a45dc

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { server } = require('./server.js');
const { mail } = require('./mailer.js');
const signIn = require('./amazon_Affiliates_Login.js');
const readMongo = require('./createAndUpdateMongo.js');
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/fixed');
const { ipAndPort } = require('./getIpAndPort.js')

let timer;

function start(result){
	timer = setIntervalAsync(scrape,30000, result);
	console.log('Starting Scrape');
}

function stop(){
	clearIntervalAsync(timer);
	console.log('Stopping Scrape');
}

async function scrape(array){		
		
		let port = '9052';
			// Launch Chromium
			const browser = await puppeteer.launch({
				// Setting headless to false allows you to watch what is happening
				// in the browser
				headless:true,

				// set up proxy server ip address and port
				args: ['--proxy-server=socks5='+ ipAndPort, '--no-sandbox']
			}).catch((err)=>{console.log(err)});

			if(browser){
				for(let i = 0; i < array.length; i++){

				// Create a new page
				const page = await browser.newPage().catch((err)=>{console.log(err)});
						
				// Using new page, navigate to productUrl from the mongoDB array
				await page.goto(array[i].productUrl).catch((err)=>{console.log(err)});

				// Await Page Content As HTML
				const content = await page.content().catch((err)=>{console.log(err)});

				// Wait until page Content has been passed to Cheerio
				const $ = await cheerio.load(content)

				// Wait until product name is retrieve and use trim() to remove whitespace
				let product = await $('#productTitle').text().trim()
				
				// get product price 
				let currentPrice = await $('#priceblock_ourprice').text()

				// remove '$' from the current price before comparison
				let trimCurrentPrice = await parseInt(currentPrice.replace('$',''))
								//if the current price is less than desired price, send an email to user
				if (trimCurrentPrice != '' && trimCurrentPrice <= array[i].desiredPrice){
					console.log("Price Met")
					await signIn.loginAmazon(array[i].productUrl)
					.then((link)=>{
						mail(array[i].email, product, currentPrice, link);
						console.log('Mail Sent')
					})
					.catch((err)=>{
						console.log(err);
					});
					
					readMongo.deleteItem(array[i].productUrl);

					// ... and remove that item from the array to stop watching it
					await array.splice(i,1)
					// ... and remove that item from MongoDB
				}
				
				// log out the product and it's price
				await console.log(`The price of ${product} is currently ${currentPrice} and trim price is ${trimCurrentPrice}`)

				// console.log('scraping page')
				await page.close().catch((err)=>{console.log(err)});

				}
				// close the browser page after prices have been compared		
				await browser.close().catch((err)=>{console.log(err)});
			}
		}
	
module.exports = {
	scrape : scrape,
	start : start,
	stop : stop
};


