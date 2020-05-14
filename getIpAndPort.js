const request = require('request')
const cheerio = require('cheerio')


let ip_addresses = [];
let port_numbers = [];


function proxyGenerator(){
	request("https://sslproxies.org/", function(error, response, html) {
		if (!error && response.statusCode == 200) {
		const $ = cheerio.load(html);

		$("td:nth-child(1)").each(function(index, value) {
		  ip_addresses[index] = $(this).text();
		});

		$("td:nth-child(2)").each(function(index, value) {
		  port_numbers[index] = $(this).text();
		});
		} else {
		console.log("Error loading proxy, please try again");
		}

		ip_addresses.join(", ");
		port_numbers.join(", ");

		// console.log("IP Addresses:", ip_addresses);
		// console.log("Port Numbers:", port_numbers);

		let rand = Math.floor(Math.random()*100);
		let ipAndPort = `${ip_addresses[rand]}:${port_numbers[rand]}`
		console.log(ipAndPort);
		return ipAndPort;
	});
}

module.exports = { proxyGenerator : proxyGenerator }



