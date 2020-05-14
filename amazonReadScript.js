async function getLink(){
	setTimeout(()=>{
		let linkContent = document.getElementById('amzn-ss-text-image-textarea').innerHTML;
		console.log(linkContent)
		let target=document.querySelector('#amzn-ss-txt-success-msg')
		let div = document.createElement('div');
		div.innerHTML = linkContent;
		div.setAttribute('id','readAffiliateLink')
		target.parentNode.insertBefore(div,target.nextSibling)
	},5000);
};

getLink();

