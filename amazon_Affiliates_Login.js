const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const { ipAndPort } = require('./getIpAndPort.js')

async function loginAmazon(url){
	let link;
	const browser = await puppeteer.launch({
		headless: true,
		args: ['--proxy-server=socks5='+ipAndPort, '--no-sandbox', '--disable-setuid-sandbox']

	}).catch((err)=>{
		console.log(err);
	})
		const page = await browser.newPage()
		.catch((err)=>{
			console.log(err);
		})
		console.log('new page opened')
		// Navigate to amazon affiliate page
		await page.goto(url)
		.catch((err)=>{
			console.log(err);
		})
		console.log('navigated to url')
 		const cheerioPageContent = await page.content()
		.catch((err)=>{
			console.log(err);
		})

	
		const $ = await cheerio.load(cheerioPageContent);
		console.log('passed page to cheerio');
		await page.waitForSelector('.nav-sprite');
		console.log('Found Nav-sprite selector node')
		await page.click('#nav-link-accountList');
		console.log('clicked nav-link')
		await page.waitForSelector('#ap_email');
		console.log('wait for ap_email')
		await page.type('#ap_email', process.env.Amazon_EMAIL,{delay:500});
		console.log('typed email into ap_email')
		await page.click('#continue');
		console.log('clicked continue')
		await page.waitForSelector('#ap_password');
		console.log('waited for ap_password')
		await page.type('#ap_password', process.env.Amazon_PASSWORD,{delay:500});
		console.log('typed in password')
		await Promise.all([
			page.click('#signInSubmit'),
			page.waitForNavigation({waitUntil: 'networkidle0'})
			])
		.catch((err)=>{
			console.log(err);
		})
		console.log('Waited For Page Load')
		await page.waitForSelector('li[id="amzn-ss-text-link"]');
		console.log('waited for text dropdown item')
		await page.click('a[title="Text+Image"]');
		console.log('clicked text drowdown item')
		await page.addScriptTag({ path: "./amazonReadScript.js" })
		console.log('inject jquery script to page')
		await page.waitForSelector('#readAffiliateLink')
		console.log('waited for #readAffiliateLink to exist')
		link = await page.evaluate(()=>document.querySelector('#readAffiliateLink').textContent)
		console.log('read textContent of inserted element')
		// await page.waitForSelector('#amzn-ss-text-shortlink-textarea',{visible: true})
		// await page.evaluate(()=>document.querySelector('#amzn-ss-text-shortlink-textarea').textContent);
		await browser.close();
		console.log('closed browser')
	return link;
}



module.exports = {
	loginAmazon: loginAmazon
}