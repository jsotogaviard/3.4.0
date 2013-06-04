<!-- include touch.js on desktop browsers only -->

if(!((window.DocumentTouch&&document instanceof DocumentTouch)||'ontouchstart' in window)){
	var script=document.createElement("script");
	script.src="js/jq.desktopBrowsers.js";
	var tag=$("head").append(script);
}

$(document).ready(function(){

});


/* This function runs once the page is loaded, but appMobi is not yet active */
//var webRoot="";
jq.ui.autoLaunch=false;
jq.ui.resetScrollers=false;
var init = function(){
	jq.ui.backButtonText="Back";  
	window.setTimeout(function(){jq.ui.launch();},1500);
	//jq.ui.removeFooterMenu();
	jq.ui.toggleNavMenu();
};
document.addEventListener("DOMContentLoaded",init,false);  
jq.ui.ready(function(){console.log('ready');});

/* Variables */
//var AWS_SERVER = "http://ec2-54-214-124-166.us-west-2.compute.amazonaws.com:9090/mayo/rest/mayo/";
var AWS_SERVER = "http://localhost:9090/rest/mayo/";
var CONTACTS_COOKIE = "CONTACT_COOKIE";
var originFilter = -1;

/* FUNCTIONS RELATED TO EVENTS */

/* This code is used to run as soon as appMobi activates */
var onDeviceReady=function(){
	AppMobi.device.setRotateOrientation("portrait");
	AppMobi.device.setAutoRotate(false);
	//webRoot=AppMobi.webRoot;
	//hide splash screen
	AppMobi.device.hideSplashScreen();	
	
	if (AppMobi.oauthAvailable == true) {
        ddebug("oAuth is available in this application");
	} else {
		 ddebug("oAuth is not available in this application");
	}

	//initialize the Facebook helper library
	facebookAPI.init();

	// 	AppMobi.contacts.getContacts() is too long (10-20s) to be executed on the device at startup
	if ($.os.android || $.os.iphone) {
		//do nothing
	} else {
		// Clear the cookies
		AppMobi.cache.clearAllCookies();

		//if running on XDK
		//AppMobi.contacts.getContacts();	
	}

	//update tables from Local Storage Content
	if(localStorage.getItem(CONTACTS_COOKIE) === null){
	   	console.log("cookie do not exist");
	   	//alert("cookie do not exist");
	   	return 0;
	} else {
	   	console.log("cookie exists");
		var contactsFromStorage = loadContactFromLocalStorage();
		jq.ui.updateContentDiv("fbcontacts2",buildContactsTable(contactsFromStorage));	
		jq.ui.updateContentDiv("taggedListTable",buildDashboardTable(contactsFromStorage));
	}

};
document.addEventListener("appMobi.device.ready",onDeviceReady,false); 

//classes
// Using strings because appmobi
// does not allow to have the keys 
// of the cookies starting by a number
ORIGIN = {
		FACEBOOK : "fb",
		PHONE : "ph",
		LINKEDIN :"ln",	
}

// The selected users
selectedUsers = {};

/**
 * 
 * @param origin
 * @param id The id data is facebook and linkedin id
 * @param name
 * @param picture
 * @param emails
 * @param phones
 * @param selected
 * @param matched
 * @returns
 */
function Contact (origin, id, name, picture, emails, phones, selected, matched) {
	this.origin = origin;
	this.id = id;
	this.name = name;
	this.picture = picture;
	this.emails = emails;
	this.phones = phones;
	this.selected = selected;
	this.matched = matched;
}

function contactsReceived() {
	var peeps = AppMobi.contacts.getContactList();
	var contacts = [];

	for(var i=0;i<peeps.length;i++) {
		var peep = AppMobi.contacts.getContactData(peeps[i]);	
		ddebug("peep" + peep.name);
		// No identification data is avalaible
		// The user has not been added or matched
		id = peep.id.replace(".","");
		contacts[i] = new Contact(ORIGIN.PHONE, id, peep.name, '', createArray(peep.emails), createArray(peep.phones), false, false);
	}

	// Sort and save contacts
	contacts = sortSaveContacts(contacts);

	// Update the div content
	var outHTML = buildContactsTable(contacts);
	jq.ui.updateContentDiv("fbcontacts2",outHTML);
	jq.ui.hideMask();

	// Remove the listener
	document.removeEventListener("appMobi.contacts.get");
}
document.addEventListener('appMobi.contacts.get', contactsReceived, false);


var facebookUserID = "me";  //me = the user currently logged into Facebook
document.addEventListener("appMobi.facebook.request.response",function(e) {
	alert("Facebook User Friends Data Returned");
	jq.ui.loadContent("contactsPage",false,false,"pop");

	if (e.success == true) {
		var data = e.data.data;

		// add the facebook contacts to 
		// the contacts array
		for (var r=0; r< data.length; r++) {
			contacts[r] = new Contact(ORIGIN.FACEBOOK, data[r]["id"], data[r]["name"], '', [], [], false, false);
		}

		console.log("contatti FB" + contacts);

		// Sort and save contacts
		contacts = sortSaveContacts(contacts);

		console.log("contatti FB sorted" + contacts);

		// Build the table
		// And put it in the div
		var outHTML = buildContactsTable(contacts);
		console.log("contatti FB HTML" + outHTML);

		jq.ui.updateContentDiv("fbcontacts2",outHTML);
		jq.ui.hideMask();

		document.removeEventListener("appMobi.facebook.request.response");      
	} 
},false);

function size(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function verifyLinkedinCredentials(){
	ddebug("verifying credentials");
	var parameters = new AppMobi.OAuth.ProtectedDataParameters();
	parameters.service = serviceName;
	parameters.url = 'http://api.linkedin.com/v1/people/~?format=json';
	parameters.id = 'ln_get';
	parameters.method = 'GET';

	AppMobi.oauth.getProtectedData(parameters);
}

function getLinkedinContacts(){
	ddebug("getting contacts");
	var parameters = new AppMobi.OAuth.ProtectedDataParameters();
	parameters.service = serviceName;
	parameters.url = 'http://api.linkedin.com/v1/people/~/connections?format=json';
	parameters.id = 'ln_get_contacts';
	parameters.method = 'GET';

	AppMobi.oauth.getProtectedData(parameters);
}

function statusUpdate(evt){
	ddebug(evt);
	if (evt.id == "ln_get"){
		var data = JSON.parse(evt.response);
		AppMobi.notification.alert("LN credentials verified","Success","OK");

		// TODO Save the linkedin id
		console.log(data);
	}

	if (evt.id == "ln_get_contacts"){
		var linkedinData = JSON.parse(evt.response);
		ddebug(linkedinData.values[0]);

		contacts = [];
		// Get the contacts locally stored
		for (var r=1; r< linkedinData.values.length; r++) {
			contact = linkedinData.values[r];
			contacts[r - 1] = new Contact(
					ORIGIN.LINKEDIN,
					contact.id,
					contact.firstName + " " + contact.lastName,
					contact.pictureUrl,
					[],
					[],
					false,
					false);                                 
		}

		console.log("contatti LN" + contacts);
		contacts = sortSaveContacts(contacts);
		console.log("contatti LN sorted" + contacts);

		outHTML = buildContactsTable(contacts);
		jq.ui.updateContentDiv("fbcontacts2",outHTML);
		console.log("contatti LN HTML" + outHTML);

		jq.ui.hideMask();

		//Linkedin contacts received
		AppMobi.notification.alert("LN Contacts received","Success","OK");
	}
}

function signOutLinkedin(){
	alert("unauthorizing service");
	AppMobi.oauth.unauthorizeService(serviceName);
}

function buildKey(contact){
	return contact.origin + "-" + contact.id;
}


//EVENT HANDLERS
document.addEventListener("appMobi.oauth.protected.data",statusUpdate,false);  // fired when data comes back from oAuth
document.addEventListener("appMobi.oauth.busy",function(){ ddebug('oAuth busy');  },false);  // fired if we try to use oAuth when oAuth is already busy with another call
document.addEventListener("appMobi.oauth.unavailable",function(){ ddebug('oAuth unavalaible');  },false);  // Fired when attempting to access oauth data before initialization is complete.
document.addEventListener("appMobi.oauth.setup",function(){ ddebug('oAuth ready to go ');  },false);  // Fired when attempting to access oauth data before initialization is complete.


/* FUNCTIONS */

/**
 * Create an array
 */
function createArray(data){
	if (data instanceof Array) {
		return data;
	} else if(typeof data === "undefined") {
		return [];
	} else {
		return [data];
	}
}

function loadContactFromLocalStorage(){
	console.log("loadContactPageFromLocalStorage...");
	
	// Load what is already in the phone
	keys = localStorage.getItem(CONTACTS_COOKIE);
	//ddebug(keys);
	jsonKeys= JSON.parse(keys);
	var contacts=[];
	for ( var i = 0; i < jsonKeys.length; i++) {
		//console.log("jsonKeys[i]: " + jsonKeys[i]);

		contact = localStorage.getItem(jsonKeys[i]);
		
		//console.log("sortsavecontact: " + contact);
		
		jsonContact = JSON.parse(contact);
		contacts[i] = jsonContact;
	}
	return contacts;

}
	

/**
 * Sort and saves the contacts
 */
function sortSaveContacts(contacts){
	console.log("sortSaveContacts...");
	if(localStorage.getItem(CONTACTS_COOKIE) === null){
		   	console.log("cookie do not exist");
		   	//alert("cookie do not exist");
		   	jsonKeys=[];
			
	}
	else {
    	console.log("cookie exist");
		// Load what is already in the phone
		keys = localStorage.getItem(CONTACTS_COOKIE);
		//ddebug(keys);
		jsonKeys= JSON.parse(keys);
		
		numKeys = contacts.length;

		for ( var i = 0; i < jsonKeys.length; i++) {
			contact = localStorage.getItem(jsonKeys[i]);
			
			jsonContact = JSON.parse(contact);
			contacts[numKeys + i] = jsonContact;
		}
	}

	// Sort the table
	contacts.sort(function(a,b){
		if(a.name.toUpperCase()<b.name.toUpperCase()) return -1;
		if(a.name.toUpperCase()>=b.name.toUpperCase()) return 1;
	});
	
	// Save locally the sorted table
	keys = [];
	for ( var i = 0; i < contacts.length; i++) {
		contact = contacts[i];
		ddebug(i + contact);
		key = buildKey(contact);
		keys[i] = key;
		localStorage.setItem(key,JSON.stringify(contact));
	}
	//console.log(keys);
	// Save the keys
	localStorage.setItem(CONTACTS_COOKIE,JSON.stringify(keys));
	console.log("sortSaveContacts finished");


	return contacts;
}

/**
 * Helps to build the contacts table
 * 
 * @param contacts the contacts
 * 
 * @returns the table
 */
function buildContactsTable(contacts){

	var outHTML = "<table id =\"contact_table\">";
	for (var r=0; r< contacts.length; r++) {
		contact = contacts[r];
		key = buildKey(contact);
		if (contact.selected==false){
			outHTML += "<tr id='" + contact.id +"' class='unselected' onclick = \"addTag('" + key + "');\">";
		}
		else {
			if (contact.matched==false){
				outHTML += "<tr id='" + contact.id +"' class='selected' onclick = \"addTag('" + key + "');\">";	
			}
			else {
				outHTML += "<tr id='" + contact.id +"' class='matched' onclick = \"addTag('" + key + "');\">";	
			}
		}
		if (contact.origin == ORIGIN.FACEBOOK) {

			// Add the facebook image
			outHTML += "<td><img src='http://graph.facebook.com/" + contact.id + "/picture' info='" + contact.name + "' /></td>";
		} else if(contact.origin == ORIGIN.PHONE){

			// Add a random image
			outHTML += "<td><img src='images/picture.gif'/></td>";
		} else if(contact.origin == ORIGIN.LINKEDIN){

			// Add the stored image
			if (typeof contact.picture === "undefined") {
				outHTML += "<td><img src='images/picture.gif'/></td>";
			} else {
				outHTML += "<td><img style='height:auto; width:auto; max-width:50px; max-height:50px;' src=" + contact.picture + "></td>";
			}

		} else {
			throw new Error(contact.origin + " impossible");
		}

		outHTML += "<td class='tableName'><p>" + contact.name + "</p></td>";
		outHTML += "<td style='display:none' >" + contact.origin +"</td>";
		if (contact.selected==false){
			outHTML += "<td id=\"" + key + "\" style='display: none'><img src='images/mayo-resized.png'/></td>";
		}
		else {
			if (contact.matched==false){
				outHTML += "<td id=\"" + key + "\" style='display: block'><img src='images/mayo-resized.png'/></td>";
			}
		 	 else {
				outHTML += "<td id=\"" + key + "\" style='display: block'><img src='images/mayo-resized.png'/></td>"; //to do: change picture
		 	 }
		}
		
		outHTML += "</tr>";	                                 
	}
	outHTML += "</table>";
	return outHTML;
}

function buildDashboardTable(contacts){

	var outHTML = "<table id =\"dashboard_table\">";
	for (var r=0; r< contacts.length; r++) {
		contact = contacts[r];
		key = buildKey(contact);
		if (contact.selected==true){
			if (contact.matched==false){
				outHTML += "<tr id='" + contact.id +"' class='selected' onclick = \"addTag('" + key + "');\">";	
			}
			else {
				outHTML += "<tr id='" + contact.id +"' class='matched' onclick = \"addTag('" + key + "');\">";	
			}
			if (contact.origin == ORIGIN.FACEBOOK) {

				// Add the facebook image
				outHTML += "<td><img src='http://graph.facebook.com/" + contact.id + "/picture' info='" + contact.name + "' /></td>";
			} else if(contact.origin == ORIGIN.PHONE){

				// Add a random image
				outHTML += "<td><img src='images/picture.gif'/></td>";
			} else if(contact.origin == ORIGIN.LINKEDIN){

				// Add the stored image
				if (typeof contact.picture === "undefined") {
					outHTML += "<td><img src='images/picture.gif'/></td>";
				} else {
					outHTML += "<td><img style='height:auto; width:auto; max-width:50px; max-height:50px;' src=" + contact.picture + "></td>";
				}

			} else {
				throw new Error(contact.origin + " impossible");
			}

		outHTML += "<td class='tableName'><p>" + contact.name + "</p></td>";
		outHTML += "<td style='display:none' >" + contact.origin +"</td>";

		if (contact.matched==false){
			outHTML += "<td id=\"" + key + "\" style='display: block'><img src='images/mayo-resized.png'/></td>";
			}
		 else {
			outHTML += "<td id=\"" + key + "\" style='display: block'><img src='images/mayo-resized.png'/></td>"; //to do: change picture
		 }
		}
		
		outHTML += "</tr>";	                                 
	}
	outHTML += "</table>";
	return outHTML;
}


/**
 * Show hide function
 * 
 * @param obj the object
 * @param objToHide the object to hide
 * 
 * @returns void
 */
function showHide(obj,objToHide){
	var el=jq("#"+objToHide)[0];

	if(obj.className=="expanded"){
		obj.className="collapsed";
	} else {
		obj.className="expanded";
	}
	jq(el).toggle();
}




function signUp(){

	var familyName_ = document.getElementById("familyName").value;
	var firstName_ = document.getElementById("firstName").value;
	var birthDate_ = document.getElementById("birthDate").value;
	var passwordNew_ = document.getElementById("passwordNew").value;
	var userEmail_ = document.getElementById("userEmail").value;
	var sex_ = document.getElementById("male");
	var real_sex;
	if(sex_.checked == true){
		real_sex = "male";
	} else {
		real_sex = "female";
	}

	jq.ajax({
		type: "POST",
		url: AWS_SERVER + "registerUser",
		data: ({mainEmail:userEmail_, name: familyName_ , password: passwordNew_ , emails:'[]' , phones:'[]'} ),
		cache: false,
		dataType: "text",
		success: function(result) {
			alert('Verify your email');
			jq.ui.loadContent("login",false, false, "pop");
		},
		error: function(error){
			alert('error ' + error.error);
		}
	});
}


function login(){
	var username_ = document.getElementById("loginName").value;
	var passwd= document.getElementById("loginPassword").value;

	jq.ajax({
		type: "POST",
		url: AWS_SERVER + "login",
		data: ({mainEmail:username_, password: passwd} ),
		cache: false,
		dataType: "text",
		success: function(result) {
			jq.ui.loadContent("contactsPage",false, false, "pop");
			jq.ui.clearHistory();
		},
		error: function(error){
			alert('error ' + error.error);

			// TODO remove this 
			// only for test
			jq.ui.loadContent("contactsPage",false, false, "pop");
			jq.ui.clearHistory();
		}
	});
}

function logout(){
	//AppMobi.cache.clearAllCookies();
	localStorage.clear();
	ddebug("localStorage cleared");
}

function forgotPassword(){
	var email = document.getElementById("email").value;
	// TODO

}

/**
 * The add tag function
 * @param contactid the id of the contact
 */
function addTag(key) {
	var x=document.getElementById(key);
	if(x.parentNode.className=="selected"){

		x.parentNode.className="unselected";
		x.style.display="none";

		// Update the contact stored
		// on the phone
		contact = localStorage.getItem(key);
		jsonContact = JSON.parse(contact);
		jsonContact.selected = false;
		localStorage.setItem(key, JSON.stringify(jsonContact));

		delete selectedUsers[key];

		// Make the selected button availaible
		if (size(selectedUsers) > 0 ) {
			jq('#selectedUsers').show();
			jq.ui.updateBadge("#selectedUsers",size(selectedUsers),"bl");
		} else {
			jq('#selectedUsers').hide();
		}
		
	} else {
		x.parentNode.className="selected";
		x.style.display="block";

		contact = localStorage.getItem(key);
		jsonContact = JSON.parse(contact);
		jsonContact.selected = true;
		localStorage.setItem(key, JSON.stringify(jsonContact));

		selectedUsers[key] =  jsonContact;

		// Make the selected button availaible
		jq('#selectedUsers').show();
		jq.ui.updateBadge("#selectedUsers",size(selectedUsers),"bl");
	}

}

function sendSelectedToServer(){
	for (var key in selectedUsers) {
		// TODO Send groupes contacts
		var jsonContact = selectedUsers[key];

		jq.ajax({
			type: "POST",
			url: AWS_SERVER + "userConnection",

			data: ({name: jsonContact.name, emails: JSON.stringify(jsonContact.emails) , phones:JSON.stringify(jsonContact.phones)} ),
			cache: false,
			dataType: "text",
			success: function(result) {
				alert(jsonContact.name + ' tagged');
			},
			error: function(error){
				
				// This user has not been added
				// to the database
				contact = localStorage.getItem(key);
				jsonContact = JSON.parse(contact);
				jsonContact.selected = false;
				localStorage.setItem(key, JSON.stringify(jsonContact));
				console.log(error);
			}
		});
	}
	
	jq.ui.updateContentDiv("taggedListTable",buildDashboardTable(loadContactFromLocalStorage()));

	// Clean the selected users
	selectedUsers={};

	// Hide the ok button
	jq('#selectedUsers').hide();
}

function smsSend(){
	var xmlHttp = null;

	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", "https://www.freevoipdeal.com/myaccount/sendsms.php?username=baubau2013&password=password&from=baubau2013&to=+33650530458&text=questo e' un sms di prova", true );
	xmlHttp.send();
	return xmlHttp.responseText;
}

function loginComplete() {
	alert("login is complete");
}

function logoutComplete() {
	alert("logout is complete");
}

function fbContactsImport(){
	AppMobi.facebook.requestWithGraphAPI(facebookUserID + "/friends","GET","");
}

var serviceName = "linkedin1";

function ddebug(name){
	console.log(name);
}

function searchContacts() {
	var searchField = jq('#search').val();
	var myExp = new RegExp(searchField, "i");

	jq('#contact_table tr').each(function(){
		row = $(this)[0];

		// If an origin filter is set
		// we take into account
		if (row.cells[1].innerHTML.search(myExp) == -1 || (originFilter != -1 && row.cells[2].innerHTML != originFilter))  {

			// The search does not match this contact
			// hide it
			$(this).hide();
		} else {

			// This row matches this contact
			// display it
			$(this).show();
		}
	});
}

function filterContactByOrigin(origin){
	// Set the origin context
	originFilter = origin;

	jq('#contact_table tr').each(function(){
		row = $(this)[0];

		// if the origin is -1 it means that 
		// we are clearing the view
		// We do not want any more filters
		if (origin != -1 && row.cells[2].innerHTML != origin)  {

			// The search is not the origin we are searching
			row.style.display= "none";
		} else {

			// The search is the origin we are searching for
			row.style.display= "";
		}
	});
}

//show a message like "loading content" for a certain duration in milliseconds
function showMask(text,mseconds){

	jq.ui.showMask(text);
	window.setTimeout(function(){jq.ui.hideMask();},mseconds);
}