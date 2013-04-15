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
	   Parse.initialize("oYbOnjMnGkcIwgjQmqdQjRaconjc22brfxi8gzHy", "li40sI8Adub5Ya9Hivw5KYHiHtUmL9YGQvRww0KU");
	   StackMob.init({
		    publicKey: "3b740361-3f37-436b-8eff-fc68084f80aa",
		    apiVersion: 0
		});
	   jq.ui.backButtonText="Back";  
	   window.setTimeout(function(){jq.ui.launch();},1500);
       //jq.ui.removeFooterMenu(); This would remove the bottom nav menu
    };
    document.addEventListener("DOMContentLoaded",init,false);  
	jq.ui.ready(function(){console.log('ready');});
   
    
	
    /* This code is used to run as soon as appMobi activates */
    var onDeviceReady=function(){
		AppMobi.device.setRotateOrientation("portrait");
        AppMobi.device.setAutoRotate(false);
		//webRoot=AppMobi.webRoot;
	    //hide splash screen
	    AppMobi.device.hideSplashScreen();	
	    //initialize the Facebook helper library
		facebookAPI.init();
    };

    document.addEventListener("appMobi.device.ready",onDeviceReady,false);    
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
		var TestObject = Parse.Object.extend("TestObject");
		var testObject = new TestObject();
		testObject.save({foo: "bar", foo2: "ciao"}, {
		  success: function(object) {
		    alert("yay! it worked");
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

		var user = new StackMob.User({ 
			username: userEmail_, 
			password: passwordNew_, 
			familyName: familyName_ ,
			firstName: firstName_ ,
			birthDate : birthDate_,
			sex : real_sex
		});
		user.create({
	    success: function(model) {
	        console.debug('User object is saved, username: ' + model.get('username'));
	        alert('successful sign up of ' + model.get('username'))
	        jq.ui.loadContent("dashboard",false,false,"pop");
	    },
	    error: function(model, response) {
	        console.debug(response);
	        alert(response.error);
	    }
		});

	}


	function login(){
		var username_ = document.getElementById("loginName").value;
		var passwd= document.getElementById("loginPassword").value;

		var user = new StackMob.User({
			username : username_,
			password : passwd
		});
		user.login(true, {
			success: function(model){
				console.log('Successful log ');
				alert('successful sign up of ' + model);
				jq.ui.loadContent("dashboard", false, false, "pop");
			},
			error: function(model, error){
				console.log('Error '  + error.error);
				alert(response.error);
			}
		});

	}

	function forgotPassword(){
		var email = document.getElementById("email").value;
		

		var user = new StackMob.User({
			username : email,
		});
		user.logout({
			success: function(model){
				console.log('Successful log out ');
				alert('successful log out ' + model);
				//jq.ui.loadContent("dashboard", false, false, "pop");
			},
			error: function(model, error){
				console.log('Error '  + error.error);
				alert(response.error);
			}
		});

	}


	function getUserContacts () {

	}

  	function contactsReceived() {
      var table = document.getElementById("contacts");
      table.innerHTML = '';

	  var peeps = AppMobi.contacts.getContactList();
		// Simple syntax to create a new subclass of Parse.Object.
		var UserContacts = Parse.Object.extend("UserContacts");
		// Create a new instance
		var userContacts = new UserContacts();

      //for(var i=0;i<peeps.length;i++) {
        for(var i=0;i<5;i++) {
        
			var peep = AppMobi.contacts.getContactData(peeps[i]);
			var tr = document.createElement("tr");
	        tr.setAttribute('style', 'background-color:#B8BFD8');
	               
	        var msg = document.createElement("td");
	        msg.innerHTML = peep.name;
	        tr.appendChild(msg);
	         
	        var msg = document.createElement("td");
	        msg.innerHTML = peep.phones;
	        tr.appendChild(msg);
	        table.appendChild(tr);
	         
	        var msg = document.createElement("td");
	        msg.innerHTML = peep.emails;
	        tr.appendChild(msg);
	        table.appendChild(tr);
					
			userContacts.set("name"+i, peep.name);
			userContacts.set("phones"+i, peep.phones);
			userContacts.set("emails"+i, peep.emails);

    	}
	  
	    userContacts.save(null, {
		  success: function(userContacts) {
		      alert("salvataggio effettuato");
		  },
		  error: function(userContacts, error) {
		 	    alert("Error: " + error.code + " " + error.message);
		  }
		});


	}

    /* Event Handlers */
    document.addEventListener('appMobi.contacts.get', contactsReceived, false);

   
    function smsSend()
    {
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
	

	var facebookUserID = "me";  //me = the user currently logged into Facebook

	document.addEventListener("appMobi.facebook.request.response",function(e) {
        alert("Facebook User Friends Data Returned");
   	    jq.ui.loadContent("fbcontactspage",false,false,"pop");

        if (e.success == true) {
                var data = e.data.data;
                var outHTML = "<table>";

                for (var r=0; r< data.length; r++) {
                outHTML += "<tr>";
                outHTML += "<td><img src='http://graph.facebook.com/" + data[r]["id"] + "/picture' info='" + data[r]["name"] + "' /><td>";
                outHTML += "<td><p>" + data[r]["name"] + "</p></td>";
                outHTML += "</tr>";	                                 
                }
                outHTML += "</table>";
                jq("#fbcontacts2").append(outHTML);

                /*
                var TestObjectFB = Parse.Object.extend("testObjectFB");
				var testObjectFB = new TestObjectFB();
				testObjectFB.save({foo: outHTML}, {
				  success: function(object) {
		 		   alert("yay! it worked");
				  }
				});
				*/
                document.removeEventListener("appMobi.facebook.request.response");
                
        } 
	},false);

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
