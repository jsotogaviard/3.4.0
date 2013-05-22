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

function Contact (origin, id, name) {
	this.origin = origin;
    this.id = id;
    this.name = name;
}

function contactsReceived() {
	var peeps = AppMobi.contacts.getContactList();
	var contacts = [];
	var outHTML = "<table id='phoneContacsTable'>";

	for(var i=0;i<peeps.length;i++) {
		var peep = AppMobi.contacts.getContactData(peeps[i]);	
		var id = peep.id;
		var name = peep.name;
		contacts[i] = new Contact(ORIGIN.PHONE, id, name);
		outHTML += "<tr class='unselected' onclick = \"addTag('" + id +"');\">";
		outHTML += "<td><img src='images/picture.gif'/></td>";
		outHTML += "<td class='tableName'><p>" + name + "</p></td>";
		outHTML += "<td id=\"" + id + "\" style='display: none'><img src='images/mayo-resized.png'/></td>";
		outHTML += "</tr>";
	}
	outHTML += "</table>";
	
	// Sort and save contacts
	sortSaveContacts(contacts);

	// Update the div content
	jq.ui.updateContentDiv("fbcontacts2",outHTML);
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
			contacts[numContacts++] = new Contact(ORIGIN.FACEBOOK, data[r]["id"], data[r]["name"]);
		}
		
		// Sort and save contacts
		sortSaveContacts(contacts);
		
		// Build the table
		// And put it in the div
		var outHTML = buildContactsTable(contacts);
		jq("#fbcontacts2").append(outHTML);

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
		outHTML += "<tr class='unselected' onclick = \"addTag('" + id +"');\">";
		if (contacts.origin == ORIGIN.FACEBOOK) {
			
			// Add the facebook image
			outHTML += "<td><img src='http://graph.facebook.com/" + contact.id + "/picture' info='" + contact.name + "' /></td>";
		} else if(contacts.origin == ORIGIN.PHONE){
			
			// Add a random image
			outHTML += "<td><img src='images/picture.gif'/></td>";
		} else if(contacts.origin == ORIGIN.LINKEDIN){
			
			// NOT YET IMPLEMENTED
			
		} else {
			throw new Error(contacts.origin + " impossible");
		}
		outHTML += "<td class='tableName'><p>" + contact.name + "</p></td>";
		outHTML += "<td id=\"" + contact.id + "\" style='display: none'><img src='images/mayo-resized.png'/></td>";
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
	jq.ajax({
          type: "POST",
          url: "http://ec2-54-214-124-166.us-west-2.compute.amazonaws.com:9090/rest/mayo/registerUser",
          //url: "http://localhost:4567/http://ec2-54-214-124-166.us-west-2.compute.amazonaws.com:9090/rest/mayo/registerUser",
          data: ({mainEmail:'jsotogaviard2@gmail.com', name:'j1' , password:'s1' , emails:'[]' , phones:'[]'} ),
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


function getUserContacts () {

}


function addTag0() {
	//$("#"+contactid).addClass("redCol");
	//$("'#" + contactid + "'").hide();
	//$(".tableName").toggle();
	//$(".tableName").addClass("redCol")
	
	alert("ciao");
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

	/*
	var tmp= "input[id='"+ contactid +"']";
	var el=$("input[id='"+ contactid +"']");
	console.log(contactid);
	console.log($(el));
	console.log($("#"+contactid));
	console.log(tmp);
	console.log($(tmp));
	$("input[id='1311186169045']").parent("tr").css('background-color', 'green');
	*/


	//$(".tableName").toggle();
	//$(".tableName").addClass("selected")
	//console.log($(el).parent("tr")[0].className);
	//console.log($(el).parent("tr").attr("class"));
	//console.log($(el).parent());
	//console.log($(el).parent().parent());
	//$(el).parent("tr").css('background-color', 'green');
	//$(el).parent("tr").addClass("selected");
	//$(el).parent("tr").className="selected";
	//$(el).toggle();
	//$(el).parent().parent().css('background-color', 'yellow');
	//alert(contactid);
	//if($(el).parent("tr")[0].className=="selected"){
		/*
	if($(el).parent("tr").attr("class")=="selected"){
		$(el).parent("tr").removeClass("selected").addClass("unselected");
		$(el).hide();
		//console.log(el);

	}
	else{
		$(el).parent("tr").removeClass("unselected").addClass("selected");
		//alert("selected");
		$(el).show();
		//console.log(el);
	}
	*/
}

function addTag2(obj) {
	var el=$("#"+obj);
	console.log(el);

	if(obj.className=="selected"){
	obj.className="unselected";
	$(el).hide();
	//console.log(el);

	}
	else{
		obj.className="selected";
		//alert("selected");
		$(el).show();
		//console.log(el);
	}
	//$(obj).css( 'color', 'red' );
	//$("#"+contactid).addClass("redCol");
	//$("'#" + contactid + "'").hide();
	//$(".tableName").toggle();
	//$(".tableName").addClass("redCol")
	
	//alert(contactid);
}

	function addTag3(obj, objtd) {
	//alert("function addtag3");
		//var patt=/./g; 
		var ciao= "1311186\.169047";
		var el2=$("#"+ciao)[0];
	var ciao2 = ciao.replace(".", "\.");
	console.log(ciao);
	console.log(ciao2);

	var el=$("#"+objtd.replace(".", "\."))[0];
	//var el2=$("#"+obj);
	console.log(el);
	console.log(el2);

	if(obj.className=="selected"){
		obj.className="unselected";
		$(el2).hide();
		//$("#"+objtd.replace(".", "\."))[0].hide();
		//console.log(el);

	}
	else{
		obj.className="selected";
		//alert("selected");
		$(el2).show();
		//$("#"+objtd.replace(".", "\."))[0].show();
		//console.log(el);
	}
	//$(obj).css( 'color', 'red' );
	//$("#"+contactid).addClass("redCol");
	//$("'#" + contactid + "'").hide();
	//$(".tableName").toggle();
	//$(".tableName").addClass("redCol")
	
	//alert(contactid);
}
/*
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
*/

function smsSend(){
	var xmlHttp = null;

	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", "https://www.freevoipdeal.com/myaccount/sendsms.php?username=baubau2013&password=password&from=baubau2013&to=+33650530458&text=questo e' un sms di prova", true );
	xmlHttp.send();
	return xmlHttp.responseText;
}

/*
document.addEventListener("appMobi.facebook.login",function(e){
	if (e.success == true){ 
	console.log("Facebook Log in Successful"); 
	}
	else { 
	console.log("Unsuccessful Login"); 
	}
},false);

function fbLogin(){
 AppMobi.facebook.login("publish_stream,publish_actions,offline_access");
}
*/

function loginComplete() {
	alert("login is complete");
}

function logoutComplete() {
	alert("logout is complete");
}

function fbContactsImport(){
	AppMobi.facebook.requestWithGraphAPI(facebookUserID + "/friends","GET","");
}

/*
function iconFB(){
	var tr = document.createElement("tr");
	tr.setAttribute('style', 'background-color:#B8BFD8');
    var msg = document.createElement("td");
		var facebookIcon = document.createElement("img");

	//facebookIcon.setAttribute("style","position:absolute; bottom:50px; right:90px;");
	facebookIcon.setAttribute("onclick","alert('ciao');");
	facebookIcon.setAttribute("src","images/Facebook-icon.png");
	facebookIcon.setAttribute("width","50");
	facebookIcon.setAttribute("height","50");
	msg.appendChild(facebookIcon);
	tr.appendChild(msg);
	tablefb.appendChild(tr);

	//document.getElementsByTagName("fbcontacts").appendChild(facebookIcon);
}
*/
