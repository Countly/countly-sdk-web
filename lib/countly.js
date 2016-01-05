/************
* Countly Web SDK
* https://github.com/Countly/countly-sdk-web
************/
(function (Countly) {
	'use strict';

	var inited = false,
		sessionStarted = false,
		apiPath = "/i",
		beatInterval = 500,
		requestQueue = [],
		eventQueue = [],
        crashLogs = [],
        timedEvents = {},
        crashSegments = null,
		autoExtend = true,
		lastBeat,
        storedDuration = 0,
        lastView = null,
        lastViewTime = 0,
        lastViewStoredDuration = 0,
        failTimeout = 0,
        failTimeoutAmount = 60,
        platform,
        urlParseRE = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,
        searchBotRE = /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver|bingbot|Google Web Preview|Mediapartners-Google|Baiduspider|Ezooms|YahooSeeker|AltaVista|AVSearch|Mercator|Scooter|InfoSeek|Ultraseek|Lycos|Wget|YandexBot|SiteBot|Exabot|AhrefsBot|MJ12bot|TurnitinBot|magpie-crawler|Nutch Crawler|CMS Crawler|rogerbot|Domnutch|ssearch_bot|XoviBot|netseer|digincore|fr-crawler)/,
        isBot = false,
        trackTime = true,
        startTime;
	
	Countly.init = function(ob){
		if(!inited){
            startTime = getTimestamp();
			inited = true;
			requestQueue = store("cly_queue") || [];
            timedEvents = store("cly_timed") || {};
			ob = ob || {};
            beatInterval = ob.interval || Countly.interval || beatInterval;
            failTimeoutAmount = ob.fail_timeout || Countly.fail_timeout || failTimeoutAmount;
			Countly.debug = ob.debug || Countly.debug || false;
			Countly.app_key = ob.app_key || Countly.app_key || null;
			Countly.device_id = ob.device_id || Countly.device_id || getId();
			Countly.url = stripTrailingSlash(ob.url || Countly.url || "https://cloud.count.ly");
			Countly.app_version = ob.app_version || Countly.app_version || "0.0";
			Countly.country_code = ob.country_code || Countly.country_code || null;
			Countly.city = ob.city || Countly.city || null;
			Countly.ip_address = ob.ip_address || Countly.ip_address || null;
			Countly.ignore_bots = ob.ignore_bots || Countly.ignore_bots || true;
			Countly.q = Countly.q || [];
            log("Countly initialized");
            if(searchBotRE.test(navigator.userAgent)){
                isBot = true;
            }
			if(Countly.q.constructor !== Array)
				Countly.q = [];
			heartBeat();
			store("cly_id", Countly.device_id);
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
			req.metrics = JSON.stringify(getMetrics());
			toRequestQueue(req);
		}
	};
	
	Countly.session_duration = function(sec){
		if(sessionStarted){
			log("Session extended", sec);
			toRequestQueue({session_duration:sec});
		}
	};
	
	Countly.end_session = function(sec){
		if(sessionStarted){
            sec = sec || getTimestamp()-lastBeat;
			log("Ending session");
            reportViewDuration();
			sessionStarted = false;
			toRequestQueue({end_session:1, session_duration:sec});
            heartBeat();
		}
	};
	
	Countly.change_id = function(newId, merge){
		var oldId = Countly.device_id;
		Countly.device_id = newId;
		store("cly_id", Countly.device_id);
		log("Changing id");
        if(merge)
            toRequestQueue({old_device_id:oldId});
	};
	
	Countly.add_event = function(event){
		if(!event.key){
			log("Event must have key property");
			return;
		}
		
		if(!event.count)
			event.count = 1;
		
		var props = ["key", "count", "sum", "dur", "segmentation"];
        var e = getProperties(event, props);
        e.timestamp = getTimestamp();
        var date = new Date();
        e.hour = date.getHours();
        e.dow = date.getDay();
		eventQueue.push(e);
		log("Adding event: ", event);
	};
    
    Countly.start_event = function(key){
        if(timedEvents[key]){
            log("Timed event with key " + key + " already started");
            return;
        }
        timedEvents[key] = getTimestamp();
        store("cly_timed", timedEvents);
    };
    
    Countly.end_event = function(event){
        if(typeof event == "string"){
            event = {key:event};
        }
        if(!event.key){
			log("Event must have key property");
			return;
		}
        if(!timedEvents[event.key]){
            log("Timed event with key " + key + " was not started");
            return;
        }
        event.dur = getTimestamp() - timedEvents[event.key];
        Countly.add_event(event);
        delete timedEvents[event.key];
        store("cly_timed", timedEvents);
    };
	
	Countly.user_details = function(user){
		log("Adding userdetails: ", user);
		var props = ["name", "username", "email", "organization", "phone", "picture", "gender", "byear", "custom"];
		toRequestQueue({user_details: JSON.stringify(getProperties(user, props))});
	};
    
    /**************************
    * Modifying custom property values of user details
    * Possible modification commands
    *  - inc, to increment existing value by provided value
    *  - mul, to multiply existing value by provided value
    *  - max, to select maximum value between existing and provided value
    *  - min, to select minimum value between existing and provided value
    *  - setOnce, to set value only if it was not set before
    *  - push, creates an array property, if property does not exist, and adds value to array
    *  - pull, to remove value from array property
    *  - addToSet, creates an array property, if property does not exist, and adds unique value to array, only if it does not yet exist in array
    **************************/
    var customData = {};
    var change_custom_property = function(key, value, mod){
        if(!customData[key])
            customData[key] = {};
        if(mod == "$push" || mod == "$pull" || mod == "$addToSet"){
            if(!customData[key][mod])
                customData[key][mod] = [];
            customData[key][mod].push(value);
        }
        else
            customData[key][mod] = value;
    };
    Countly.userData = {
        set: function(key, value){
            customData[key] = value;
        },
        set_once: function(key, value){
            change_custom_property(key, 1, "$setOnce");
        },
        increment: function(key){
            change_custom_property(key, 1, "$inc");
        },
        increment_by: function(key, value){
            change_custom_property(key, value, "$inc");
        },
        multiply: function(key, value){
            change_custom_property(key, value, "$mul");
        },
        max: function(key, value){
            change_custom_property(key, value, "$max");
        },
        min: function(key, value){
            change_custom_property(key, value, "$min");
        },
        push: function(key, value){
            change_custom_property(key, value, "$push");
        },
        push_unique: function(key, value){
            change_custom_property(key, value, "$addToSet");
        },
        pull: function(key, value){
            change_custom_property(key, value, "$pull");
        },
        save: function(){
            toRequestQueue({user_details: JSON.stringify({custom:customData})});
            customData = {};
        }
    };
    
    Countly.track_errors = function(segments){
        crashSegments = segments;
        window.onerror = function(msg, url, line, col, err) {
            if(typeof err !== "undefined")
                recordError(err, false);
            else{
                col = col || (window.event && window.event.errorCharacter);
                var error = "";
                if(typeof msg !== "undefined")
                    error += msg+"\n";
                if(typeof url !== "undefined")
                    error += "at "+url;
                if(typeof line !== "undefined")
                    error += ":"+line;
                if(typeof col !== "undefined")
                    error += ":"+col;
                error += "\n";
                
                try{
                    var stack = [];
                    var f = arguments.callee.caller; // jshint ignore:line
                    while (f) {
                        stack.push(f.name);
                        f = f.caller;
                    }
                    error += stack.join("\n");
                }catch(ex){}
                recordError(error, false);
            }
        };
    };
    
    Countly.log_error = function(err, segments){
        recordError(err, true, segments);
    };
    
    Countly.add_log = function(record){
        crashLogs.push(record);
    };
    
    /**
	*  PULIC HELP METHODS FOR COMMON ACTIONS
	**/
    
    Countly.stop_time = function(){
        trackTime = false;
        storedDuration = getTimestamp() - lastBeat;
        lastViewStoredDuration = getTimestamp() - lastViewTime;
    };
    
    Countly.start_time = function(){
        trackTime = true;
        lastBeat = getTimestamp() - storedDuration;
        lastViewTime = getTimestamp() - lastViewStoredDuration;
        lastViewStoredDuration = 0;
    };
    
    Countly.track_sessions = function(){
        //start session
        Countly.begin_session();
        Countly.start_time();
        
        //end session on unload
        add_event(window, "beforeunload", function(){
            Countly.end_session();
        });
        add_event(window, "unload", function(){
            Countly.end_session();
        });
        
        //manage sessions on window visibility events
        var hidden = "hidden";
        
        function onchange(){
            if (document[hidden]) {
                Countly.stop_time();
            } else {
                Countly.start_time();
            }
        }
        
        //Page Visibility API
        if (hidden in document)
            document.addEventListener("visibilitychange", onchange);
        else if ((hidden = "mozHidden") in document)
            document.addEventListener("mozvisibilitychange", onchange);
        else if ((hidden = "webkitHidden") in document)
            document.addEventListener("webkitvisibilitychange", onchange);
        else if ((hidden = "msHidden") in document)
            document.addEventListener("msvisibilitychange", onchange);
        // IE 9 and lower:
        else if ("onfocusin" in document){
            add_event(window, "focusin", function(){
                Countly.start_time();
            });
            add_event(window, "focusout", function(){
                Countly.stop_time();
            });
        }
        // All others:
        else{
            //old way
            add_event(window, "focus", function(){
                Countly.start_time();
            });
            add_event(window, "blur", function(){
                Countly.stop_time();
            });
            
            //newer mobile compatible way
            add_event(window, "pageshow", function(){
                Countly.start_time();
            });
            add_event(window, "pagehide", function(){
                Countly.stop_time();
            });
        }
    };
    
    Countly.track_pageview = function(page){
        reportViewDuration();
        page = page || window.location.pathname;
        lastView = page;
        lastViewTime = getTimestamp();
        if(!platform)
            getMetrics();
        var segments = {
            "name": page,
            "visit":1,
            "segment":platform,
            "domain":window.location.hostname
        };
        
        if(typeof document.referrer !== "undefined" && document.referrer.length){
            var matches = urlParseRE.exec(document.referrer);
            //do not report referrers of current website
            if(matches && matches[11] && matches[11] != window.location.hostname)
                segments.start = 1;
        }
        
        //track pageview
        Countly.add_event({
            "key": "[CLY]_view",
            "segmentation": segments
        });
    };
    
    Countly.track_clicks = function(){
        var shouldProcess = true;
        function processClick(event){
            if(shouldProcess){
                shouldProcess = false;
                
                //cross browser click coordinates
                get_page_coord(event);
                if(typeof event.pageX !== "undefined" && typeof event.pageY !== "undefined"){
                    var height = getDocHeight();
                    var width = getDocWidth();
                    
                    //record click event
                    Countly.add_event({
                        "key": "[CLY]_action",
                        "segmentation": {
                            "type": "click",
                            "x":event.pageX,
                            "y":event.pageY,
                            "width":width,
                            "height":height,
                            "domain":window.location.hostname
                        }
                    });
                }
                setTimeout(function(){shouldProcess = true;}, 1000);
            }
        }
        //add any events you want like pageView
        add_event(document, "mousedown", processClick);
        add_event(document, "mouseup", processClick);
        add_event(document, "click", processClick);
    };
    
    Countly.track_links = function(parent){
        parent = parent || document;
        function trackClicks(){
            function processClick(event){

                //get element which was clicked
                var elem = get_event_target(event);
                
                //cross browser click coordinates
                get_page_coord(event);
                
                //record click event
                Countly.add_event({
                    "key": "linkClick",
                    "segmentation": {
                        "href": elem.href,
                        "text": elem.innerText,
                        "id": elem.id,
                        "x":event.pageX,
                        "y":event.pageY
                    }
                });
                //anticipate page unload
                if(typeof elem.href !== "undefined" && elem.target !== '_blank' && !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)){
                    var link = elem.href.replace(window.location.href.split("#")[0], "");
                    if(link.indexOf("#") !== 0){
                        //most probably user will leave the page
                        
                        //end Countly session
                        Countly.end_session();
                        
                        //prevent user from leaving
                        prevent_default(event);
                        
                        //allow user to leave after some time
                        setTimeout(function() {
                            window.location.href = elem.href;
                        }, 1000);
                    }
                }
            }
            //add any events you want like pageView
            if(typeof parent.getElementsByTagName !== "undefined"){
                var links = parent.getElementsByTagName("a");
                for(var i = 0; i < links.length; i++){
                    add_event(links[i], "click", processClick);
                }
            }
            else{
                log("Can't track clicks");
            }
        }
        if (document.readyState === "complete") {
            trackClicks();
        }
        else{
            add_event(window, "load", trackClicks);
        }
    };
    
    Countly.track_forms = function(parent){
        parent = parent || document;
        function getInputName(input){
            return input.name || input.id || input.type || input.nodeName;
        }
        function processForm(form){
            // use to avoid duplicate submits
            var submitted = false;
            add_event(form, "submit", function(event){
                if(!submitted){
                    submitted = true;
                    
                    var segmentation = {
                        "id": form.id,
                        "name": form.name,
                        "action": form.action,
                        "method": form.method
                    };
                    
                    //get input values
                    var input;
                    if(typeof form.elements !== "undefined")
                        for(var i = 0; i < form.elements.length; i++){
                            input = form.elements[i];
                            if(input.nodeName.toLowerCase() == "select"){
                                if(typeof input.multiple !== "undefined"){
                                    var values = [];
                                    if(typeof input.options !== "undefined")
                                        for(var j = 0; j < input.options.length; j++){
                                            if (input.options[j].selected)
                                                values.push(input.options[j].value);
                                        }
                                    segmentation["input:"+getInputName(input)] = values.join();
                                }
                                else
                                    segmentation["input:"+getInputName(input)] = input.options[input.selectedIndex].value;
                            }
                            else if(input.nodeName.toLowerCase() == "input"){
                                if(typeof input.type !== "undefined"){
                                    if(input.type.toLowerCase() == "checkbox" || input.type.toLowerCase() == "radio"){
                                        if(typeof input.checked !== "undefined")
                                            segmentation["input:"+getInputName(input)] = input.value;
                                    }
                                    else{
                                        segmentation["input:"+getInputName(input)] = input.value;
                                    }
                                }
                                else
                                    segmentation["input:"+getInputName(input)] = input.value;
                            }
                            else if(input.nodeName.toLowerCase() == "textarea"){
                                segmentation["input:"+getInputName(input)] = input.value;
                            }
                            else if(typeof input.value !== "undefined"){
                                segmentation["input:"+getInputName(input)] = input.value;
                            }
                        }
                    
                    //record submit event
                    Countly.add_event({
                        "key": "formSubmit",
                        "segmentation": segmentation
                    });
                    
                    //form will refresh page
                    
                    //end Countly session
                    Countly.end_session();
                    
                    //prevent user from leaving
                    prevent_default(event);
                    
                    //allow user to leave after some time
                    setTimeout(function() {
                        form.submit();
                    }, 1000);
                }
            });
        }
        function trackForms(){
            if(typeof parent.getElementsByTagName !== "undefined"){
                var forms = parent.getElementsByTagName("form");
                for(var i = 0; i < forms.length; i++){
                    processForm(forms[i]);
                }
            }
            else{
                log("Can't track forms");
            }
        }
        if (document.readyState === "complete") {
            trackForms();
        }
        else{
            add_event(window, "load", trackForms);
        }
    };
	
	/**
	*  PRIVATE METHODS
	**/
    
    function reportViewDuration(){
        if(lastView){
            if(!platform)
                getMetrics();
            var segments = {
                "name": lastView,
                "segment":platform
            };

            //track pageview
            Countly.add_event({
                "key": "[CLY]_view",
                "dur": getTimestamp() - lastViewTime,
                "segmentation": segments
            });
            lastView = null;
        }
    }
	
	//insert request to queue
	function toRequestQueue(request){
        //ignore bots
        if(Countly.ignore_bots && isBot)
            return;
        
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
		
		if(Countly.ip_address !== null)
			request.ip_address = Countly.ip_address;
			
		request.timestamp = getTimestamp();
        var date = new Date();
        request.hour = date.getHours();
        request.dow = date.getDay();
		
		requestQueue.push(request);
		store("cly_queue", requestQueue, true);
	}
	
	//heart beat
	function heartBeat(){
		
		//process queue
		if(typeof Countly.q !== "undefined" && Countly.q.length > 0){
			var req;
			for(var i = 0; i < Countly.q.length; i++){
				req = Countly.q[i];
				if(req.constructor === Array && req.length > 0){
					log("Processing queued call", req);
					if(typeof Countly[req[0]] !== "undefined")
						Countly[req[0]].apply(null, req.slice(1));
                    else{
                        var userdata = req[0].replace("userData.", "");
                        if(typeof Countly.userData[userdata] !== "undefined")
                            Countly.userData[userdata].apply(null, req.slice(1));
                    }
				}
			}
			Countly.q = [];
		}
		
		//extend session if needed
		if(sessionStarted && autoExtend && trackTime){
			var last = getTimestamp();
			if(last - lastBeat > 60){
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
				toRequestQueue({events: JSON.stringify(events)});
			}
		}
		
		//process request queue with event queue
		if(requestQueue.length > 0 && getTimestamp() > failTimeout){
            var params = requestQueue.shift();
            log("Processing request", params);
            sendXmlHttpRequest(params, function(err, params){
                log("Request Finished", params, err);
                if(err){
                    requestQueue.unshift(params);
                    store("cly_queue", requestQueue, true);
                    failTimeout = getTimestamp() + failTimeoutAmount;
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
	}
	
	//generate UUID
	function generateUUID() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	}
	
	//get metrics of the browser
	function getMetrics(){
		var metrics = {};
		
		//getting app version
		metrics._app_version = Countly.app_version;
		
		//getting resolution
		if (screen.width) {
            var width = (screen.width) ? screen.width : '';
            var height = (screen.height) ? screen.height : '';
            metrics._resolution = '' + width + "x" + height;
        }
		
		//getting os
        /**
        * From http://jsfiddle.net/ChristianL/AVyND/
        * JavaScript Client Detection
        * (C) viazenetti GmbH (Christian Ludwig)
        */
        var nVer = navigator.appVersion;
		var nAgt = navigator.userAgent;
		var browser = navigator.appName;
		var nameOffset, verOffset;
		
        // Opera Mini
        if (nAgt.indexOf('Opera Mini') != -1) {
            browser = 'Opera Mini';
        }
		// Opera
        else if (nAgt.indexOf('Opera') != -1) {
            browser = 'Opera';
        }
        // MSIE
        else if (nAgt.indexOf('MSIE') != -1) {
            browser = 'Internet Explorer';
        }
        // IEMobile
        else if (nAgt.indexOf('IEMobile') != -1) {
            browser = 'IE Mobile';
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
		
		metrics._browser = browser;
		
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
            {s:'Windows Phone', r:/Windows Phone/},
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
            {s:'SearchBot', r:searchBotRE}
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

        if (/Windows/.test(os) && os != "Windows Phone") {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OSX':
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                break;
                
            case 'Windows Phone':
                osVersion = (/Windows Phone ([\.\_\d]+)/.exec(nAgt) || ["", "8.0"])[1];
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
        platform = os;
		metrics._os_version = osVersion;
		
		//getting locale
		var locale = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage;
		if(typeof locale !== "undefined")
			metrics._locale = locale;
        
        if(typeof document.referrer !== "undefined" && document.referrer.length){
            var matches = urlParseRE.exec(document.referrer);
            //do not report referrers of current website
            if(matches && matches[11] && matches[11] != window.location.hostname)
                metrics._store = document.referrer;
        }
		
		log("Got metrics", metrics);
		return metrics;
	}
	
	//log stuff
	function log(){
		if(Countly.debug && typeof console !== "undefined"){
            if(arguments[1] && typeof arguments[1] == "object")
                arguments[1] = JSON.stringify(arguments[1]);
			console.log( Array.prototype.slice.call(arguments).join("\n") );
        }
	}
	
	//get current timestamp
	function getTimestamp(){
		return Math.floor(new Date().getTime() / 1000);
	}
    
    function recordError(err, nonfatal, segments){
        segments = segments || crashSegments;
        var error = "";
        if(typeof err === "object"){
            if(typeof err.stack !== "undefined")
                error = err.stack;
            else{
                if(typeof err.name !== "undefined")
                    error += err.name+":";
                if(typeof err.message !== "undefined")
                    error += err.message+"\n";
                if(typeof err.fileName !== "undefined")
                    error += "in "+err.fileName+"\n";
                if(typeof err.lineNumber !== "undefined")
                    error += "on "+err.lineNumber;
                if(typeof err.columnNumber !== "undefined")
                    error += ":"+err.columnNumber;
            }
        }
        else{
            error = err+"";
        }
        nonfatal = (nonfatal) ? true : false;
        var metrics = getMetrics();
        var ob = {_os:metrics._os, _os_version:metrics._os_version, _resolution:metrics._resolution, _error:error, _app_version:metrics._app_version, _run:getTimestamp()-startTime};
        
        var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery || navigator.msBattery;
        if (battery) 
            ob._bat = Math.floor(battery.level * 100);
        
        if(typeof navigator.onLine !== 'undefined')
            ob._online = (navigator.onLine) ? true : false;
        
        ob._background = (document.hasFocus()) ? false : true;
        
        if(crashLogs.length > 0)
            ob._logs = crashLogs.join("\n");
        crashLogs = [];
        ob._nonfatal = nonfatal;
        
        if(typeof segments !== "undefined")
            ob._custom = segments;
        else
            ob._custom = {};
        
        ob._custom.Page = window.location.path;
        ob._custom.Browser = metrics._browser;
        try{
            var canvas = document.createElement("canvas");
            var gl = canvas.getContext("experimental-webgl");
            ob._opengl = gl.getParameter(gl.VERSION);
        }
        catch(ex){}
        
        toRequestQueue({crash: JSON.stringify(ob)});
    }
	
	//sending xml HTTP request
	function sendXmlHttpRequest(params, callback) {
        try {
			log("Sending XML HTTP request");
            var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : null;

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
    }
	
	//convert JSON object to query params
	function prepareParams(params){
		var str = [];
		for(var i in params){
			str.push(i+"="+encodeURIComponent(params[i]));
		}
		return str.join("&");
	}
	
	//removing trailing slashes
	function stripTrailingSlash(str) {
		if(str.substr(str.length - 1) == '/') {
			return str.substr(0, str.length - 1);
		}
		return str;
	}
	
	//retrieve only specific properties from object
	function getProperties(orig, props){
		var ob = {};
		var prop;
		for(var i = 0; i < props.length; i++){
			prop = props[i];
			if(typeof orig[prop] !== "undefined")
				ob[prop] = orig[prop];
		}
		return ob;
	}
    
    //add event
	var add_event = function(element, type, listener){
		if(typeof element.addEventListener !== "undefined")
		{
			element.addEventListener(type, listener, false);
		}
		else
		{
			element.attachEvent('on' +  type, listener);
		}
	};
    
    //get element that fired event
    var get_event_target = function(event){
        if(!event)
        {
            return window.event.srcElement;
        }
        else if(typeof event.target !== "undefined")
        {
            return event.target; 
        }
        else
        {
            return event.srcElement;
        }
    };
    
    //prevent default event behavior
    var prevent_default = function(event){
        if(typeof window.event !== "undefined")
        {
            window.event.returnValue = false;
        }
        else if(typeof event.preventDefault !== "undefined")
        {
            event.preventDefault();
        }
        else
        {
            event.returnValue = false;
        }
    };
    
    //get page coordinates
    function get_page_coord(e)
    {
        //checking if pageY and pageX is already available
        if (typeof e.pageY == 'undefined' &&  
            typeof e.clientX == 'number' && 
            document.documentElement)
        {
            //if not, then add scrolling positions
            e.pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            e.pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        //return e which now contains pageX and pageY attributes
        return e;
    }
    
    function getDocHeight() {
        var D = document;
        return Math.max(
            Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
            Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
            Math.max(D.body.clientHeight, D.documentElement.clientHeight)
        );
    }
    function getDocWidth() {
        var D = document;
        return Math.max(
            Math.max(D.body.scrollWidth, D.documentElement.scrollWidth),
            Math.max(D.body.offsetWidth, D.documentElement.offsetWidth),
            Math.max(D.body.clientWidth, D.documentElement.clientWidth)
        );
    }

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
        storageOnly = storageOnly || false;
		var lsSupport = false,
			data;
		
		// Check for native support
		if (typeof localStorage !== "undefined") {
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
		}
		
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
		}
	};
}(window.Countly = window.Countly || {}));