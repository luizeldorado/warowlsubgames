//General Kenobi!

elems = getElementsById('error','status','info','configinfo','messageform','message','messagetext');

var token,avatar,username,game_viewermode,game_open,refreshtimeout;

refreshtime = 2500;

function getInfo() {
	var x = XHR("api-getinfo.php",
		receiveAPIGetInfo,
		function(e) { // error
			dealWithError("Could not get info because "+x.status,true);
			checkToken();
		}
	);
}

function receiveAPIGetInfo() {
	console.log(this.responseText);

	try {
		var response = JSON.parse(this.responseText);
	} catch(e) {
		dealWithError("JSON parse in get info",true);
		checkToken();
		return;
	}

	if(response.status != 0) {
		dealWithError(response.error,true);
		checkToken();
		return;
	}

	game_viewermode = response.viewermode;
	game_open = response.open;
	checkToken();

}

function checkToken() {

	let query = new URLSearchParams(window.location.hash.substring(1));
	token = query.get("access_token");

	if (!token) {
		elems['status'].innerHTML = `
			<p><a href="login-with-twitch.php">Login with Twitch</a></p>
		`;

		elems['info'].style.display = 'block';

		elems['configinfo'].innerHTML = `
			<ul>
				`+(game_open==undefined?"":"<li>State: "+(game_open?"Open":"Not open.")+"</li>")+`
				`+(game_open?(game_viewermode==undefined?"":"<li>Mode: "+(game_viewermode?"Anyone can join, even non-subs!":"Subscribers only")+"</li>"):"")+`
			</ul>
		`;
		return;
	}

	elems['status'].innerHTML = `
		<p>Entering...</p>
	`;

	var x = XHR("api-enter.php?token="+token,
		receiveAPIEnter,
		function(e) { // error
			dealWithError("Could not enter subgame because "+x.status);
		}
	);

}

function receiveAPIEnter() {

	console.log(this.responseText);
	try {
		var response = JSON.parse(this.responseText);
	} catch(e) {
		dealWithError("JSON parse in enter",true);
		return;
	}

	avatar = response.avatar;
	username = response.username;

	var ENTERED = 0, ALREADYENTERED = 1, NOTSUBSCRIBED = 2, NOTOPEN = 3;
	switch(response.status) {
		case ENTERED:
			elems['status'].innerHTML = `
				<p><a href="">Logout</a></p>
				<p>You, `+getAvatarAndUsername()+` entered. Wait.</p>
				<img src="loading.gif" />
			`;
			checkServerUpdates();
			break;
		case ALREADYENTERED:
			elems['status'].innerHTML = `
				<p><a href="">Logout</a></p>
				<p>You, `+getAvatarAndUsername()+` were already entered. Wait more.</p>
				<img src="loading.gif" />
			`;
			checkServerUpdates();
			break;
		case NOTSUBSCRIBED:
			elems['status'].innerHTML = `
				<p><a href="">Logout</a></p>
				<p>You, `+getAvatarAndUsername()+` are not subscribed.</p>
				<p><a href="https://twitch.com/warowl/subscribe">Subscribe to WarOwl</a></p>
			`;
			break;
		case NOTOPEN:
			elems['status'].innerHTML = `
				<p><a href="">Logout</a></p>
				<p>The subscribe games are not open at the moment. Try again later.</p>
			`;
			break;
		default:
			dealWithError(response.error);
			break;
	}
}

function getAvatarAndUsername() {
	return `<img class="avatar" src="`+avatar+`"> `+username;
}

function checkServerUpdates() {
	x = XHR("api-getstate.php?token="+token,
		receiveAPIGetState,
		function(e) { // error
			dealWithError("Could not get status because "+x.status+", trying again");
			refreshtimeout = setTimeout(checkServerUpdates,refreshtime);
		},
	);
}

function receiveAPIGetState() {

	elems['error'].innerHTML = '';

	console.log(this.responseText);
	try {
		var response = JSON.parse(this.responseText);
	} catch(e) {
		dealWithError("JSON parse in get state",true);
		return;
	}

	var KEEPWAITING = 0, SELECTED = 1, NOTSELECTED = 2, INVALIDTOKEN = 3;
	switch(response.status) {
		case KEEPWAITING:
			showMessageForm();
			if (response.message) {
				setMessageText(response.message);
			}
			refreshtimeout = setTimeout(checkServerUpdates,refreshtime);
			break;
		case SELECTED:
			elems['status'].innerHTML = `
				<p><a href="">Logout</a></p>
				<p>You, `+getAvatarAndUsername()+`, have been selected to play.</p>
				<p><a href="steam://connect/`+response.server_ip+`/`+response.server_password+`">Click here to enter the server</a></p>
				<p>Or paste this code in your developer console:</p>
				<p><code>connect `+response.server_ip+`; password `+response.server_password+`</code></p>
			`;
			break;
		case NOTSELECTED:
			elems['status'].innerHTML = `
				<p><a href="">Logout</a></p>
				<p>You, `+getAvatarAndUsername()+`, have not been selected.</p>
				<p><a href="https://twitch.com/warowl">Watch WarOwl's stream</a></p>
			`;
			break;
		case INVALIDTOKEN:
			elems['status'].innerHTML = `
				<p><a href="">Logout</a></p>
				<p>Your token seems to have been invalided. Try <a href="login-with-twitch.php">logging in</a> again.</p>
			`;
			break;
		default:
			dealWithError(response.error);
			break;
	}
}

function showMessageForm() {
	elems['message'].style.display = 'block';
}

elems['messageform'].addEventListener('submit',function(e){

	e.preventDefault();
	var x = XHR("api-setmessage.php?token="+token+"&message="+encodeURIComponent(elems['messagetext'].value),
		receiveAPISetMessage,
		function() {
			dealWithError("Could not set message because "+x.status);
		});
});

function receiveAPISetMessage() {

	elems['error'].innerHTML = '';

	try {
		var response = JSON.parse(this.responseText);
	} catch(e) {
		dealWithError("JSON parse in set message",true);
		return;
	}

	var ERROR = -1, OK = 0, INVALIDTOKEN = 3;
	switch (response.status) {
		case 0:
			setMessageText(response.message);
			break;
		case 3:
			dealWithError("Invalid token in set message");
			break;
		default:
			dealWithError(response.error);
			break;
	}

}

function setMessageText(message) {
	elems['message'].innerHTML = `
		<p>Your message:</p>
	`;
	elems['message'].appendChild(create('code',{},message));
}

function getElementsById(/**/) {
	let e = [];
	for (let i=0; i<arguments.length; i++) {
		e[arguments[i]] = document.getElementById(arguments[i]);
	}
	return e;
}

function XHR(url, onload, onerror) {
	let x = new XMLHttpRequest();
	if (onload) {
		x.addEventListener("load", onload);
	}
	if (onerror) {
		x.addEventListener("error", onerror);
	}
	x.open("GET", url);
	x.send();
}

function create(tag,attr,inside) {
	let elem = document.createElement(tag);
	for (let name in attr) {
		elem.setAttribute(name,attr[name]);
	}
	if (inside) {
		if (typeof inside == 'string') {
			elem.appendChild(document.createTextNode(inside));
		} else {
			elem.appendChild(inside);
		}
	}
	return elem;
}

function dealWithError(error,silent) {

	if(!error) {
		error = "UNKNOWN's ERRORGROUND";
	}

	console.log("Error! "+error);

	if(!silent) {
		elems['error'].innerHTML = `
			<p>Whoopsie doopsie! An error ocurred.</p>
			<p><code>`+error+`</code></p>
			<p>Consider <a href="mailto:eldorado.luiz@gmail.com?subject=ERROR in WarOwl's subgame&body=Error: `+error+`">telling the developer</a> about this error, maybe he can fix it.</p>
		`;
	}

}

getInfo();
