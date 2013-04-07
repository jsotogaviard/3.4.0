var facebookAPI=function(){
			return{
			
				currentAuthToken:'',
				receivedDataCallback:'',
				debugMode:1,
				me:{},
			
			
				init:function(){

					/************************************
						Make sure we have access to the appMobi library
					************************************/
					try{
						AppMobi.device.appmobiversion;
						return true;
					}catch(er){
						alert('You are missing the appMobi library. Please include the appMobi library to support Facebook Integration in a native hybrid application.');
						return false;
					}

				},
				
				login:function(callbackFunction){
					facebookAPI.debug("about to log into facebook");
					if(callbackFunction!='' && callbackFunction!=undefined && callbackFunction!='undefined' && callbackFunction!=null){
						facebookAPI.receivedDataCallback=callbackFunction;
						document.addEventListener("appMobi.facebook.login",function(e){
							facebookAPI.currentAuthToken = e.token;
							try { this.getUser(); } catch(e) {}
						
							//make the callback
							eval(facebookAPI.receivedDataCallback(e));
						},false); 
					}
					AppMobi.facebook.login("email,publish_stream,publish_actions,offline_access");
				},
				
				//name,picture,caption,description,link are all possible parameters
				post:function(params,callbackFunction) {
					try { document.removeEventListener("appMobi.facebook.dialog.complete"); } catch(e) {}
					if(callbackFunction!='' && callbackFunction!=undefined && callbackFunction!='undefined' && callbackFunction!=null){
						facebookAPI.receivedDataCallback=callbackFunction;
						document.addEventListener("appMobi.facebook.dialog.complete",facebookAPI.receivedDataCallback,false); 
					}
					AppMobi.facebook.showNewsFeedDialog(params);				
				},
								
				debug:function(debugMessage) {
					if (this.debugMode == 1) {
						console.log(debugMessage);
					}
					if (this.debugMode == 2) {
						alert(debugMessage);
					}
				},
				
				logout:function(callbackFunction) {
					try { document.removeEventListener("appMobi.facebook.logout"); } catch(e) {}
					if(callbackFunction!='' && callbackFunction!=undefined && callbackFunction!='undefined' && callbackFunction!=null){
						facebookAPI.receivedDataCallback=callbackFunction;
						document.addEventListener("appMobi.facebook.logout",facebookAPI.receivedDataCallback,false);
					}				
					AppMobi.facebook.logout();
				}
			
			}
		}();