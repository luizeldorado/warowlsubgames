//Hello there

elems = getElementsById('status','controlpanel','loginpanel','loginpassword','logout','adminpasswordform','adminpassword','serverform','serverip','serverpassword','viewermode','gameopen','gameclose','playersbody','refresh','autorefresh','serverpasswordshow');

var players = [{userid: 0}];
var autorefresh = true;
var refreshtime = 1000;
var refreshtimeout;

function checkLogin() {

	elems['status'].innerHTML = `
		<p>Checking login...</p>
	`;

	var x = XHR("api-admin-getinfo.php",
		receiveAPIAdminGetInfo);
}

function receiveAPIAdminGetInfo() {

	try {
		var response = JSON.parse(this.responseText);
		//let response = JSON.parse(undefined);
	} catch(e) {
		err("Could not understand what server said. This is probably a server side issue.",null,e);
		return;
	}

	if(response.logged) {
		elems['serverip'].value = response.server_ip;
		elems['serverpassword'].value = response.server_password;
		elems['viewermode'].checked = response.game_viewermode;
		elems['gameopen'].disabled = response.game_open;
		elems['gameclose'].disabled = !response.game_open;
		showControlPanel(response);
	} else {
		showLoginPanel();
	}
	
}

function showControlPanel() {
	elems['controlpanel'].style.display = 'block';
	elems['loginpanel'].style.display = 'none';
	elems['status'].innerHTML = `
		<p>Greetings.</p>
	`;
	getPlayers();
}
function showLoginPanel() {
	elems['loginpanel'].style.display = 'block';
	elems['controlpanel'].style.display = 'none';
	elems['status'].innerHTML = `
		<p>Log in, please.</p>
	`;
}

// login
elems['loginpanel'].addEventListener("submit",function(e) {
	e.preventDefault();

	var x = XHR("api-admin-login.php?password="+elems["loginpassword"].value,
		receiveAPIAdminLogin);
});

function receiveAPIAdminLogin() {

	try {
		var response = JSON.parse(this.responseText);
	} catch(e) {
		err("Could not understand what server said. This is probably a server side issue.",null,e);
		return;
	}

	if (response.logged) {
		elems['serverip'].value = response.server_ip;
		elems['serverpassword'].value = response.server_password;
		elems['viewermode'].checked = response.game_viewermode;
		elems['gameopen'].disabled = response.game_open;
		elems['gameclose'].disabled = !response.game_open;
		showControlPanel();
	} else {
		elems['status'].innerHTML = `
			<p>Wrong password.</p>
		`;
	}
}

//control panel
elems['logout'].addEventListener("click",function(e) {
	if (refreshtimeout) {clearTimeout(refreshtimeout)};

	var x = XHR("api-admin-logout.php",
		function() {
			showLoginPanel();
		});

});

//change admin password
elems['adminpasswordform'].addEventListener("submit",function(e) {
	e.preventDefault();

	var x = XHR("api-admin-setadminpassword.php?password="+elems["adminpassword"].value,
		receiveAPIAdminSetAdminPassword);
	elems['adminpasswordform'].querySelector("fieldset").disabled = true;
	elems["adminpassword"].value = "";
});

function receiveAPIAdminSetAdminPassword() {
	try {
		var response = JSON.parse(this.responseText);
	} catch(e) {
		err("Could not understand what server said. This is probably a server side issue.",null,e);
		return;
	} finally {
		elems['adminpasswordform'].querySelector("fieldset").disabled = false;
	}

	if(response.status == 1) {
		elems['status'].innerHTML = `
			<p>Admin password changed.</p>
		`;
	} else {
		elems['status'].innerHTML = `
			<p>Empty admin password, not changed.</p>
		`;
	}

}

//change server info
elems['serverform'].addEventListener("submit",function(e) {
	e.preventDefault();

	var x = XHR("api-admin-setserverinfo.php?ip="+elems["serverip"].value+"&password="+elems["serverpassword"].value,
		function() {
			elems['status'].innerHTML = `
				<p>Server information changed.</p>
			`;
		});
});

//show password button
elems['serverpasswordshow'].addEventListener("click",function(e) {
	if (elems["serverpassword"].type == "password") {
		elems["serverpassword"].type = "text";
	} else {
		elems["serverpassword"].type = "password";
	}
});

//viewer mode checkbox
elems['viewermode'].addEventListener("change",function(e) {
	elems['viewermode'].disabled = true;
	var x = XHR("api-admin-setviewermode.php?state="+(elems['viewermode'].checked?1:0),
		function() {
			elems['viewermode'].disabled = false;
			elems['status'].innerHTML = `
				<p>Viewer mode `+(elems['viewermode'].checked ? `activated` : `deactivated`)+`.</p>
			`;
		},function(e){
			elems['viewermode'].checked = !elems['viewermode'].checked;
			elems['viewermode'].disabled = false;
		});
});

//open subgames button
elems['gameopen'].addEventListener("click",function(e) {
	var x = XHR("api-admin-setgameopen.php?open=1",
		function() {
			elems['gameopen'].disabled = true;
			elems['gameclose'].disabled = false;
			elems['status'].innerHTML = `
				<p>Subgames are now open.</p>
			`;
			getPlayers();
		});
});

//close subgames button
elems['gameclose'].addEventListener("click",function(e) {
	var x = XHR("api-admin-setgameopen.php?open=0",
		function() {
			elems['gameopen'].disabled = false;
			elems['gameclose'].disabled = true;
			elems['status'].innerHTML = `
				<p>Subgames are now closed.</p>
			`;
			getPlayers();
		});
});

//refresh
elems['refresh'].addEventListener("click",function(e) {
	getPlayers();
});

//autorefresh
elems['autorefresh'].addEventListener("change",function(e) {
	autorefresh = elems['autorefresh'].checked;
	if (autorefresh) {
		getPlayers();
	} else {
		if (refreshtimeout) {clearTimeout(refreshtimeout)};
	}
});

//table
function getPlayers() {
	var x = XHR("api-admin-getplayers.php",
		receiveAPIAdminGetPlayers,
		function(e){
			if (autorefresh) {
				if (refreshtimeout) {clearTimeout(refreshtimeout)};
				refreshtimeout = setTimeout(getPlayers,refreshtime);
			}
		});
}

function receiveAPIAdminGetPlayers() {
	try {
		var response = JSON.parse(this.responseText);
	} catch(e) {
		err("Could not understand what server said. This is probably a server side issue.",null,e);
		return;
	}

	newPlayers = response.players;
	if (newPlayers.length == 0) {
		newPlayers.unshift({userid: 0}); //adds empty to beggining
	}

	diff = arrayAddedAndRemoved(players, newPlayers);

	putPlayersInTable(newPlayers, diff.added, diff.removed);

	players = newPlayers;

	if (autorefresh) {
		refreshtimeout = setTimeout(getPlayers,refreshtime);
	}

}

function arrayAddedAndRemoved(oldarray,newarray) {

	//Checks the difference between two arrays, returning the added and removed elements.

	var diff = {
		added: [],
		removed: oldarray //start with all elements, then remove if they are found to exist
	};

	for (let i = 0; i < newarray.length; i++) {
		//find new element in old array
		var found = null;
		for (let j = 0; j < oldarray.length; j++) {
			//quick AND dirty
			if (JSON.stringify(newarray[i]) == JSON.stringify(oldarray[j])) {
				found = oldarray[j];
				break;
			}
		}
		if (!found) { //then its a new one
			diff.added.push(newarray[i]);
		} else { //then its an old one , remove from removed array
			diff.removed.splice(diff.removed.indexOf(found),1);
		}
	}

	return diff;

}

function putPlayersInTable(all, add, remove) {

	for (let i=0; i<remove.length; i++) {

		var row = document.querySelector('[data-userid="'+remove[i].userid+'"]');
		row.outerHTML = ""; //LOL

	}

	for (let i=0; i<add.length; i++) {

		let userid = add[i].userid;

		if(userid == 0) {

			row = create('tr',{'data-userid': 0});
			row.appendChild(create('td'));
			row.appendChild(create('td',{},"But nobody came."));
			row.appendChild(create('td'));
			row.appendChild(create('td'));

		} else {

			avatar = create('img', {'class': 'avatar', 'src': add[i].avatar});
			username = create('span', {'title': add[i].username}, add[i].username);
			message = create('span', {'title': add[i].message}, add[i].message);

			button = create('button',{},"Select");
			button.addEventListener("click",function(){selectPlayer(userid);});

			cell_avatar = create('td',{},avatar);
			cell_username = create('td',{},username);
			cell_message = create('td',{},message);
			cell_button = create('td',{},button);

			row = create('tr',{'data-userid': userid});
			row.appendChild(cell_avatar);
			row.appendChild(cell_username);
			row.appendChild(cell_message);
			row.appendChild(cell_button);

			setButtonAndRow(parseInt(add[i].status), button, row);

		}

		elems['playersbody'].appendChild(row);

	}
}

function selectPlayer(userid) {

	let row = document.querySelector('[data-userid="'+userid+'"]');
	let button = row.querySelector('button');

	setButtonAndRow(3,button,row);

	var x = XHR("api-admin-selectplayer.php?userid="+userid,
		function() {
			setButtonAndRow(1,button,row);
		},
		function(e){
			setButtonAndRow(0,button,row);
		});

}

function setButtonAndRow(status,button,row) {

	switch (status) {
		case 0: //default
			button.disabled = false;
			button.innerHTML = "Select";
			break;
		case 1: //selected
			button.disabled = true;
			button.innerHTML = "Selected";
			row.class = "selected";
			break;
		case 2: //not selected
			button.disabled = true;
			button.innerHTML = "Not selected";
			row.class= "notselected";
			break;
		case 3: //selecting
			button.disabled = true;
			button.innerHTML = "Selecting...";
			break;
	}
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
	x.addEventListener("load", function() {
		if (this.status == 500) {
			err(x.statusText,x.status);
			if(onerror) {
				onerror.bind(this)();
			}
		} else {
			if (onload) {
				onload.bind(this)();
			}
		}
	});
	if (onerror) {
		x.addEventListener("error", function() {
			err(x.statusText,x.status);
			onerror.bind(this)();
		});
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

function err(text,number,e) {
	let errortext = `Error`+(number?` `+number:``)+`: `+text;
	console.log(errortext,(e?e:null));
	elems['status'].innerHTML = `
		<p class='error'>`+errortext+`</p>
	`;
}

checkLogin();