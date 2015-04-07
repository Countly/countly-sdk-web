(function (Countly) {
	'use strict';
	
	var inited = false,
		sessionStarted = false,
		apiPath = "/i",
		beatInterval = 1000,
		requestQueue = [],
		eventQueue = [],
		autoExtend = true,
		lastBeat;
	
	Countly.init = function(ob){
		if(!inited){
			inited = true;
			requestQueue = store("cly_queue") || [],
			ob = ob || {};
			Countly.debug = ob.debug || Countly.debug || false;
			Countly.app_key = ob.app_key || Countly.app_key || null;
			Countly.device_id = ob.device_id || Countly.device_id || getId();
			Countly.url = stripTrailingSlash(ob.url || Countly.url || "https://cloud.count.ly");
			Countly.app_version = ob.app_version || Countly.app_version || null;
			Countly.country_code = ob.country_code || Countly.country_code || null;
			Countly.city = ob.city || Countly.city || null;
			Countly.ip_address = ob.ip_address || Countly.ip_address || null;
			Countly.q = Countly.q || [];
			if(Countly.q.constructor !== Array)
				Countly.q = [];
			heartBeat();
			store("cly_id", Countly.device_id);
			log("Countly initialized");
		}
	};
	
	Countly.begin_session = function(noHeartBeat){
		if(!sessionStarted){
			log("Session started");
			lastBeat = getTimestamp();
			sessionStarted = true;
			autoExtend = (noHeartBeat) ? false : true;
			var req = {};
			req.begin_session = 1;
			if(!store("cly_first_"+Countly.device_id)){
				store("cly_first_"+Countly.device_id, true);
				req.metrics = JSON.stringify(getMetrics());
			}
			toRequestQueue(req);
		}
	};
	
	Countly.session_duration = function(sec){
		if(sessionStarted){
			log("Session extended", sec);
			toRequestQueue({session_duration:sec});
		}
	};
	
	Countly.end_session = function(){
		if(sessionStarted){
			log("Ending session");
			sessionStarted = false;
			toRequestQueue({end_session:1, session_duration:getTimestamp()-lastBeat});
		}
	};
	
	Countly.change_id = function(newId){
		var oldId = Countly.device_id;
		Countly.device_id = newId;
		store("cly_id", Countly.device_id);
		log("Changing id");
		toRequestQueue({old_device_id:oldId});
	};
	
	Countly.add_event = function(event){
		if(!event.key){
			log("Event must have key property");
			return;
		}
		
		if(!event.count)
			event.count = 1;
		
		var props = ["key", "count", "sum", "segmentation"];
		eventQueue.push(getProperties(event, props));
		log("Adding event: ", event);
	};
	
	Countly.user_details = function(user){
		log("Adding userdetails: ", user);
		var props = ["name", "username", "email", "organization", "phone", "picture", "gender", "byear", "custom"];
		toRequestQueue({user_details: JSON.stringify(getProperties(user, props))});
	}
	
	/**
	*  PRIVATE METHODS
	**/
	
	//insert request to queue
	function toRequestQueue(request){
		if(!Countly.app_key || !Countly.device_id){
			log("app_key or device_id is missing");
			return;
		}
		
		request.app_key = Countly.app_key;
		request.device_id = Countly.device_id;
		
		if(Countly.country_code)
			request.country_code = Countly.country_code;
		
		if(Countly.city)
			request.city = Countly.city;
		
		if(Countly.ip_address)
			request.ip_address = Countly.ip_address;
			
		request.timestamp = getTimestamp();
		
		requestQueue.push(request);
		store("cly_queue", requestQueue, true);
	}
	
	//heart beat
	function heartBeat(){
		
		//process queue
		if(Countly.q && Countly.q.length > 0){
			var req;
			for(var i = 0; i < Countly.q.length; i++){
				req = Countly.q[i];
				if(req.constructor === Array && req.length > 0){
					log("Processing queued call", req);
					if(Countly[req[0]])
						Countly[req[0]](req[1]);
				}
			}
			Countly.q = [];
		}
		
		//extend session if needed
		if(sessionStarted && autoExtend){
			var last = getTimestamp();
			if(last - lastBeat > 30){
				Countly.session_duration(last - lastBeat);
				lastBeat = last;
			}
		}
		
		//process event queue
		if(eventQueue.length > 0){
			if(eventQueue.length <= 10){
				toRequestQueue({events: JSON.stringify(eventQueue)});
				eventQueue = [];
			}
			else{
				var events = eventQueue.splice(0, 10);
				toRequestQueue({events: JSON.stringify(eventQueue)});
			}
		}
		
		//process request queue with event queue
		if(requestQueue.length > 0){
			var params = requestQueue.shift();
			log("Processing request", params);
			sendXmlHttpRequest(params, function(err, params){
				log("Request Finished", params, false);
				if(err){
					requestQueue.unshift(params);
					store("cly_queue", requestQueue, true);
				}
			});
			store("cly_queue", requestQueue, true);
		}
		
		setTimeout(heartBeat, beatInterval);
	}
	
	//get ID
	function getId(){
		var id = store("cly_id") || generateUUID();
		store("cly_id", id);
		return id;
	};
	
	//generate UUID
	function generateUUID() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	};
	
	//get metrics of the browser
	function getMetrics(){
		var metrics = {};
		
		//getting app version
		if(Countly.app_version)
			metrics._app_version = Countly.app_version;
		
		//getting resolution
		if (screen.width) {
            var width = (screen.width) ? screen.width : '';
            var height = (screen.height) ? screen.height : '';
            metrics._resolution = '' + width + "x" + height;
        }
		
		//getting os
		var nAgt = navigator.userAgent;
		var browser = navigator.appName;
		var version = '' + parseFloat(navigator.appVersion);
		var nameOffset, verOffset;
		
		// Opera
        if (nAgt.indexOf('Opera') != -1) {
            browser = 'Opera';
        }
        // MSIE
        else if (nAgt.indexOf('MSIE') != -1) {
            browser = 'Internet Explorer';
        }
        // Chrome
        else if (nAgt.indexOf('Chrome') != -1) {
            browser = 'Chrome';
        }
        // Safari
        else if (nAgt.indexOf('Safari') != -1) {
            browser = 'Safari';
        }
        // Firefox
        else if (nAgt.indexOf('Firefox') != -1) {
            browser = 'Firefox';
        }
        // MSIE 11+
        else if (nAgt.indexOf('Trident/') != -1) {
            browser = 'Internet Explorer';
        }
        // Other browsers
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browser = nAgt.substring(nameOffset, verOffset);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = navigator.appName;
            }
        }
		
		metrics._carrier = browser;
		
        var os = "unknown";
        var clientStrings = [
            {s:'Windows 3.11', r:/Win16/},
            {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
            {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
            {s:'Windows 98', r:/(Windows 98|Win98)/},
            {s:'Windows CE', r:/Windows CE/},
            {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
            {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
            {s:'Windows Server 2003', r:/Windows NT 5.2/},
            {s:'Windows Vista', r:/Windows NT 6.0/},
            {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
            {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
            {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
            {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
            {s:'Windows ME', r:/Windows ME/},
            {s:'Android', r:/Android/},
            {s:'Open BSD', r:/OpenBSD/},
            {s:'Sun OS', r:/SunOS/},
            {s:'Linux', r:/(Linux|X11)/},
            {s:'iOS', r:/(iPhone|iPad|iPod)/},
            {s:'Mac OSX', r:/Mac OS X/},
            {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
            {s:'QNX', r:/QNX/},
            {s:'UNIX', r:/UNIX/},
            {s:'BeOS', r:/BeOS/},
            {s:'OS/2', r:/OS\/2/},
            {s:'SearchBot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
        ];
        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

		//getting os version
        var osVersion = "unknown";

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OSX':
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'Android':
                osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                break;
        }
		metrics._os = os;
		metrics._os_version = osVersion;
		
		//getting locale
		var locale = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage;
		if(locale)
			metrics._locale = locale;
		
		log("Got metrics", metrics);
		return metrics;
	};
	
	//log stuff
	function log(){
		if(Countly.debug && console)
			console.log( Array.prototype.slice.call(arguments) );
	};
	
	//get current timestamp
	function getTimestamp(){
		return Math.floor(new Date().getTime() / 1000);
	};
	
	//sending xml HTTP request
	function sendXmlHttpRequest(params, callback) {
        try {
			log("Sending XML HTTP request");
            var xhr = window.XMLHttpRequest
                ? new window.XMLHttpRequest()
                : window.ActiveXObject
                ? new ActiveXObject('Microsoft.XMLHTTP')
                : null;

            xhr.open('GET', Countly.url + apiPath + "?" + prepareParams(params), true);

            // fallback on error
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
					if (typeof callback === 'function') { callback(false, params); }
                } else if (this.readyState === 4) {
					log("Failed Server XML HTTP request", this.status);
                    if (typeof callback === 'function') { callback(true, params); }
                }
            };

            xhr.send();
        } catch (e) {
            // fallback
			log("Failed XML HTTP request", e);
            if (typeof callback === 'function') { callback(true, params); }
        }
    };
	
	//convert JSON object to query params
	function prepareParams(params){
		var str = []
		for(var i in params){
			str.push(i+"="+encodeURIComponent(params[i]));
		}
		return str.join("&");
	};
	
	//removing trailing slashes
	function stripTrailingSlash(str) {
		if(str.substr(str.length - 1) == '/') {
			return str.substr(0, str.length - 1);
		}
		return str;
	};
	
	//retrieve only specific properties from object
	function getProperties(orig, props){
		var ob = {};
		var prop;
		for(var i = 0; i < props.length; i++){
			prop = props[i];
			if(orig[prop])
				ob[prop] = orig[prop];
		}
		return ob;
	};
	/**
	* Simple localStorage with Cookie Fallback
	* v.1.0.0
	*
	* USAGE:
	* ----------------------------------------
	* Set New / Modify:
	*   store('my_key', 'some_value');
	*
	* Retrieve:
	*   store('my_key');
	*
	* Delete / Remove:
	*   store('my_key', null);
	*/
	
	var store = function store(key, value, storageOnly) {
	
		var lsSupport = false,
			data;
		
		// Check for native support
		if (localStorage) {
			lsSupport = true;
		}
		
		// If value is detected, set new or modify store
		if (typeof value !== "undefined" && value !== null) {
			// Convert object values to JSON
			if ( typeof value === 'object' ) {
				value = JSON.stringify(value);
			}
			// Set the store
			if (lsSupport) { // Native support
				localStorage.setItem(key, value);
			} else if(!storageOnly) { // Use Cookie
				createCookie(key, value, 30);
			}
		}
		
		// No value supplied, return value
		if (typeof value === "undefined") {
			// Get value
			if (lsSupport) { // Native support
				data = localStorage.getItem(key);
			} else if(!storageOnly) { // Use cookie 
				data = readCookie(key);
			}
			
			// Try to parse JSON...
			try {
			data = JSON.parse(data);
			}
			catch(e) {
			data = data;
			}
			
			return data;
			
		}
		
		// Null specified, remove store
		if (value === null) {
			if (lsSupport) { // Native support
				localStorage.removeItem(key);
			} else if(!storageOnly) { // Use cookie
				createCookie(key, '', -1);
			}
		}
		
		/**
		* Creates new cookie or removes cookie with negative expiration
		* @param  key       The key or identifier for the store
		* @param  value     Contents of the store
		* @param  exp       Expiration - creation defaults to 30 days
		*/
		
		function createCookie(key, value, exp) {
			var date = new Date();
			date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
			document.cookie = key + "=" + value + expires + "; path=/";
		};
		
		/**
		* Returns contents of cookie
		* @param  key       The key or identifier for the store
		*/
		
		function readCookie(key) {
			var nameEQ = key + "=";
			var ca = document.cookie.split(';');
			for (var i = 0, max = ca.length; i < max; i++) {
				var c = ca[i];
				while (c.charAt(0) === ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
			}
			return null;
		};
	};
}(window.Countly = window.Countly || {}));