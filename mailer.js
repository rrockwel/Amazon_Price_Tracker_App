const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const server = require('./server.js');


function mail(email, product, currentPrice, link){
	

	const oauth2client = new OAuth2(
		process.env.Client_ID,
		process.env.Client_SECRET,
		process.env.Redirect_URL
		)

	// User Refresh Token To Request New Access Token
	oauth2client.setCredentials({
		refresh_token: process.env.Refresh_TOKEN
	})
	const accessToken = oauth2client.getAccessToken();

	const smtpTransport = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			type: 'OAuth2',
			user: process.env.User_EMAIL,
			clientId: process.env.Client_ID,
			clientSecret: process.env.Client_SECRET,
			refreshToken: process.env.Refresh_TOKEN,
			accessToken: accessToken
		}
	})

	const mailOptions = {
		from: 'Amazon Price Tracker App',
		to: email,
		subject: 'Price Alert For Amazon Product',
		generateTextFromHTML: true,
		html: `${product} is currently listed at on Amazon for ${currentPrice}. Please return to <a href="">Amazon Price Tracker</a> and click through the product link to purchase on Amazon.`
	}

	smtpTransport.sendMail(mailOptions, (err, res)=>{
		if(err){
			console.log(err)
		}else{
			console.log(res);
		}
		smtpTransport.close();
	})

}
module.exports = { mail : mail }