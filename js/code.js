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
   //jq.ui.removeFooterMenu(); This would remove the bottom nav menu
};
document.addEventListener("DOMContentLoaded",init,false);  
jq.ui.ready(function(){console.log('ready');});

/* Variables */
var CONTACTS_COOKIE = "CONTACT_COOKIE";

/* FUNCTIONS RELATED TO EVENTS */

/* This code is used to run as soon as appMobi activates */
var onDeviceReady=function(){
	AppMobi.device.setRotateOrientation("portrait");
    AppMobi.device.setAutoRotate(false);
	//webRoot=AppMobi.webRoot;
    //hide splash screen
    AppMobi.device.hideSplashScreen();	
   
    //initialize the Facebook helper library
	facebookAPI.init();

	// Need to load all the contacts
	// to the local memory in order to use
	// the get contact data method
	// FIXME
	AppMobi.contacts.getContacts();
};
document.addEventListener("appMobi.device.ready",onDeviceReady,false); 

//classes
ORIGIN = {
	FACEBOOK : 0,
	PHONE : 1,
	LINKEDIN :2,	
}

function Contact (origin, id, name, picture) {
	this.origin = origin;
    this.id = id;
    this.name = name;
    this.picture = picture;
}

function contactsReceived() {
	var peeps = AppMobi.contacts.getContactList();
	var contacts = [];
	
	for(var i=0;i<peeps.length;i++) {
		var peep = AppMobi.contacts.getContactData(peeps[i]);	
		contacts[i] = new Contact(ORIGIN.PHONE, peep.id, peep.name, '');
	}
	
	// Sort and save contacts
	sortSaveContacts(contacts);

	// Update the div content
	var outHTML = buildContactsTable(contacts);
	jq.ui.updateContentDiv("fbcontacts2",outHTML);

	// Remove the listener
	document.removeEventListener("appMobi.contacts.get");
}
document.addEventListener('appMobi.contacts.get', contactsReceived, false);

var facebookUserID = "me";  //me = the user currently logged into Facebook

document.addEventListener("appMobi.facebook.request.response",function(e) {
	alert("Facebook User Friends Data Returned");
	jq.ui.loadContent("fbcontactspage",false,false,"pop");

	// load the data that is in the cache
	var jsonContacts = AppMobi.cache.getCookie(CONTACTS_COOKIE);
	contacts = JSON.parse(jsonContacts);
	
	if (e.success == true) {
		var data = e.data.data;
		
		// add the facebook contacts to 
		// the contacts array
		numContacts = contacts.length;
		for (var r=0; r< data.length; r++) {
			contacts[numContacts++] = new Contact(ORIGIN.FACEBOOK, data[r]["id"], data[r]["name"], '');
		}
		
		// Sort and save contacts
		sortSaveContacts(contacts);
		
		// Build the table
		// And put it in the div
		var outHTML = buildContactsTable(contacts);
		jq.ui.updateContentDiv("fbcontacts2",outHTML);

		document.removeEventListener("appMobi.facebook.request.response");      
	} 
},false);

/* FUNCTIONS */

/**
 * Sort and saves the contacts
 */
function sortSaveContacts(contacts){
	// Sort the table
	contacts.sort(function(a,b){
		if(a.name.toUpperCase()<b.name.toUpperCase()) return -1;
		if(a.name.toUpperCase()>b.name.toUpperCase()) return 1;
		return 0;
	});

	// Save locally the sorted table
	// Works if if it's under 5 MB
	AppMobi.cache.setCookie(CONTACTS_COOKIE,JSON.stringify(contacts),-1);
}

/**
 * Helps to build the contacts table
 * 
 * @param contacts the contacts
 * 
 * @returns the table
 */
function buildContactsTable(contacts){
	var outHTML = "<table>";
	for (var r=0; r< contacts.length; r++) {
		contact = contacts[r];
		outHTML += "<tr class='unselected' onclick = \"addTag('" + contact.id +"');\">";
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
				outHTML += "<td><img src=" + contact.picture + "></td>";
			}
			
		} else {
			throw new Error(contact.origin + " impossible");
		}
		outHTML += "<td class='tableName'><p>" + contact.name + "</p></td>";
		outHTML += "<td id=\"" + contact.id + "\" style='display: none'><img src='images/mayo-resized.png'/></td>";
		outHTML += "</tr>";	                                 
	}
	outHTML += "</table>";
	console.log(outHTML);
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
	var el=$("#"+objToHide)[0];
	
	if(obj.className=="expanded"){
		obj.className="collapsed";
	}
	else{
		obj.className="expanded";
	}
	$(el).toggle();
}

function testParse(){
	alert("about to log into facebook");
	document.addEventListener("appMobi.facebook.login",function(e){
	        if (e.success == true) 
	        { console.log("Facebook Log in Successful"); } 
	        else 
	        { console.log("Unsuccessful Login"); }
	},false); 
	AppMobi.facebook.login("publish_stream,publish_actions,offline_access");

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
          url: "http://ec2-54-214-124-166.us-west-2.compute.amazonaws.com:9090/rest/mayo/registerUser",
          data: ({mainEmail:userEmail_, name: familyName_ , password: passwordNew_ , emails:'[]' , phones:'[]'} ),
          cache: false,
          dataType: "text",
          success: function(result) {
		    alert('ok ' + result);
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
          url: "http://ec2-54-214-124-166.us-west-2.compute.amazonaws.com:9090/rest/mayo/login",
          data: ({mainEmail:username_, password: passwd } ),
          cache: false,
          dataType: "text",
          success: function(result) {
		    alert('ok ' + result);
		   },
		   error: function(error){
		   	 alert('error ' + error.error);
		   }
	 });
}

function logout(){
	AppMobi.cache.clearAllCookies();
}

function forgotPassword(){
	var email = document.getElementById("email").value;
	// TODO

}


function addTag(contactid) {
	//$("#"+contactid).addClass("selected");
	//$("#"+contactid).className="selected";
	//var el=$("#"+contactid);
	var x=document.getElementById(contactid);
	//x.parentNode.setAttribute('style', 'background-color: green');

	//if($(el).parent("tr").attr("class")=="selected"){
	if(x.parentNode.className=="selected"){

		x.parentNode.className="unselected";
		x.style.display="none";
		//console.log(el);

	}
	else{
		x.parentNode.className="selected";
		//alert("selected");
		x.style.display="block";
		//console.log(el);

		var peep = AppMobi.contacts.getContactData(contactid);	
		console.log(peep.emails);
		jq.ajax({
          type: "POST",
          url: "http://ec2-54-214-124-166.us-west-2.compute.amazonaws.com:9090/rest/mayo/userConnection",

          // TODO take care of the case of having only one
          // email or phone
          data: ({emails: JSON.stringify(peep.emails) , phones:JSON.stringify(peep.phones)} ),
          cache: false,
          dataType: "text",
          success: function(result) {
		    alert(result);
		   },
		   error: function(error){
		   	console.log(error);
		   }
	 });
	}

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

function ddebug(name)
{
	console.log(name);
}
//var verificationTimer;
//var verificationTimeout = 60000;
function verifyLinkedinCredentials()
{
	ddebug("verifying credentials");
	var parameters = new AppMobi.OAuth.ProtectedDataParameters();
	parameters.service = serviceName;
	parameters.url = 'http://api.linkedin.com/v1/people/~?format=json';
	parameters.id = 'ln_get';
	parameters.method = 'GET';
	//clearTimeout(verificationTimer);
	//verificationTimer = setTimeout(function(){ 
	//	clearTimeout(verificationTimer);
		//document.getElementById("divLoggedInAs").innerHTML="Verification Failure";
		//AppMobi.notification.alert("The verifictaion has timed out.  Please try again later.","Verification Timeout","OK");
	//},verificationTimeout);
	
	//alert(JSON.stringify(parameters));

	AppMobi.oauth.getProtectedData(parameters);
}


	//http://api.linkedin.com/v1/people/~/connections

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
	ddebug("ID: " + evt.id);

	if (evt.id == "ln_get"){
		var data = JSON.parse(evt.response);
		AppMobi.notification.alert("Credentials verified3","Success","OK");
		console.log(data.firstName);
	}

	if (evt.id == "ln_get_contacts"){
		var linkedinData = JSON.parse(evt.response);
		ddebug(linkedinData.values[0]);

		// Get the contacts locally stored
		var jsonContacts = AppMobi.cache.getCookie(CONTACTS_COOKIE);
		contacts = JSON.parse(jsonContacts);
        numContacts = contacts.length;

        for (var r=1; r< linkedinData.values.length; r++) {
        	contact = linkedinData.values[r];
        	ddebug(contact.pictureUrl);
        	contacts[numContacts] = new Contact(
        		ORIGIN.LINKEDIN,
        		numContacts,
        	 	contact.firstName + " " + contact.lastName,
        	 	contact.pictureUrl);
         	numContacts++;	                                 
        }

        sortSaveContacts(contacts);
        outHTML = buildContactsTable(contacts);
        jq.ui.updateContentDiv("fbcontacts2",outHTML);

		//Linkedin contacts received
		AppMobi.notification.alert("Contacts received3","Success","OK");
	}
}

function signOutLinkedin()
{
	alert("unauthorizing service");
	AppMobi.oauth.unauthorizeService(serviceName);
}
	

//EVENT HANDLERS
	
document.addEventListener("appMobi.oauth.protected.data",statusUpdate,false);  // fired when data comes back from oAuth
document.addEventListener("appMobi.oauth.busy",function(){ ddebug('oAuth busy');  },false);  // fired if we try to use oAuth when oAuth is already busy with another call


