/************
* Countly Web SDK
* https://github.com/Countly/countly-sdk-web
************/

/**
 * Countly object to manage the internal queue and send requests to Countly server. More information on {@link http://resources.count.ly/docs/countly-sdk-for-web}
 * @name Countly
 * @global
 * @namespace Countly
 * @example <caption>SDK integration</caption>
 * <script type='text/javascript'>
 *   
 * //some default pre init
 * var Countly = Countly || {};
 * Countly.q = Countly.q || [];
 * 
 * //provide your app key that you retrieved from Countly dashboard
 * Countly.app_key = "YOUR_APP_KEY";
 * 
 * //provide your server IP or name. Use try.count.ly for EE trial server.
 * //if you use your own server, make sure you have https enabled if you use
 * //https below.
 * Countly.url = "https://yourdomain.com"; 
 * 
 * //start pushing function calls to queue
 * //track sessions automatically
 * Countly.q.push(['track_sessions']);
 *   
 * //track sessions automatically
 * Countly.q.push(['track_pageview']);
 *   
 * //load countly script asynchronously
 * (function() {
 *  var cly = document.createElement('script'); cly.type = 'text/javascript'; 
 *  cly.async = true;
 *  //enter url of script here
 *  cly.src = 'https://cdn.jsdelivr.net/countly-sdk-web/latest/countly.min.js';
 *  cly.onload = function(){Countly.init()};
 *  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(cly, s);
 * })();
 * </script>
 */
(function (Countly) {
    'use strict';
    
    var SDK_VERSION = "18.01";
    var SDK_NAME = "javascript_native_web";

    var inited = false,
        sessionStarted = false,
        apiPath = "/i",
        beatInterval = 500,
        queueSize = 1000,
        requestQueue = [],
        eventQueue = [],
        crashLogs = [],
        timedEvents = {},
        ignoreReferrers = [],
        crashSegments = null,
        autoExtend = true,
        lastBeat,
        storedDuration = 0,
        lastView = null,
        lastViewTime = 0,
        lastViewStoredDuration = 0,
        failTimeout = 0,
        failTimeoutAmount = 60,
        inactivityTime = 20,
        inactivityCounter = 0,
        sessionUpdate = 60,
        maxEventBatch = 10,
        lastMsTs = 0,
        readyToProcess = true,
        platform,
        hasPulse = false,
        syncConsents = {},
        lastParams = {},
        urlParseRE = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,
        searchBotRE = /(CountlySiteBot|nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver|bingbot|Google Web Preview|Mediapartners-Google|AdsBot-Google|Baiduspider|Ezooms|YahooSeeker|AltaVista|AVSearch|Mercator|Scooter|InfoSeek|Ultraseek|Lycos|Wget|YandexBot|Yandex|YaDirectFetcher|SiteBot|Exabot|AhrefsBot|MJ12bot|TurnitinBot|magpie-crawler|Nutch Crawler|CMS Crawler|rogerbot|Domnutch|ssearch_bot|XoviBot|netseer|digincore|fr-crawler|wesee|AliasIO)/,
        trackTime = true,
        startTime;
 
    /**
     * Array with list of available features that you can require consent for
     */ 
    Countly.features = ["sessions","events","views","scrolls","clicks","forms","crashes","attribution","users","star-rating"];
    
    //create object to store consents
    var consents = {};
    for(var i = 0; i < Countly.features.length; i++){
        consents[Countly.features[i]] = {};
    }

/**
 * Initialize Countly object
 * @param {Object} conf - Countly initialization {@link Init} object with configuration options
 * @param {string} conf.app_key - app key for your app created in Countly
 * @param {string} conf.device_id - to identify a visitor, will be auto generated if not provided
 * @param {string} conf.url - your Countly server url, you can use your server URL or IP here
 * @param {string} [conf.app_version=0.0] - the version of your app or website
 * @param {string=} conf.country_code - country code for your visitor
 * @param {string=} conf.city - name of the city of your visitor
 * @param {string=} conf.ip_address - ip address of your visitor
 * @param {boolean} [conf.debug=false] - output debug info into console
 * @param {boolean} [conf.ignore_bots=true] - option to ignore traffic from bots
 * @param {number} [conf.interval=500] - set an interval how often to check if there is any data to report and report it in miliseconds
 * @param {number} [conf.queue_size=1000] - maximum amount of queued requests to store
 * @param {number} [conf.fail_timeout=60] - set time in seconds to wait after failed connection to server in seconds
 * @param {number} [conf.inactivity_time=20] - after how many minutes user should be counted as inactive, if he did not perform any actions, as mouse move, scroll or keypress
 * @param {number} [conf.session_update=60] - how often in seconds should session be extended
 * @param {number} [conf.max_events=10] - maximum amount of events to send in one batch
 * @param {array=} conf.ignore_referrers - array with referrers to ignore
 * @param {boolean} [conf.ignore_prefetch=true] - ignore prefetching and pre rendering from counting as real website visits
 * @param {boolean} [conf.force_post=false] - force using post method for all requests
 * @param {boolean} [conf.ignore_visitor=false] - ignore this current visitor
 * @param {boolean} [conf.require_consent=false] - Pass true if you are implementing GDPR compatible consent management. It would prevent running any functionality without proper consent
 * @example
 * Countly.init({
 *   //provide your app key that you retrieved from Countly dashboard
 *   app_key: "YOUR_APP_KEY",
 *   //provide your server IP or name. Use try.count.ly for EE trial server.
 *   url: "http://yourdomain.com" 
 * });
 */
    Countly.init = function(ob, requireConsent){
        if(!inited){
            
            startTime = getTimestamp();
            inited = true;
            requestQueue = store("cly_queue") || [];
            timedEvents = {};
            eventQueue = store("cly_event") || [];
            ob = ob || {};
            beatInterval = ob.interval || Countly.interval || beatInterval;
            queueSize = ob.queue_size || Countly.queue_size || queueSize;
            failTimeoutAmount = ob.fail_timeout || Countly.fail_timeout || failTimeoutAmount;
            inactivityTime = ob.inactivity_time || Countly.inactivity_time || inactivityTime;
            sessionUpdate = ob.session_update || Countly.session_update || sessionUpdate;
            maxEventBatch = ob.max_events || Countly.max_events || maxEventBatch;
            Countly.ignore_prefetch = ob.ignore_prefetch || Countly.ignore_prefetch || true;
            Countly.debug = ob.debug || Countly.debug || false;
            Countly.app_key = ob.app_key || Countly.app_key || null;
            Countly.device_id = ob.device_id || Countly.device_id || getId();
            Countly.url = stripTrailingSlash(ob.url || Countly.url || "");
            Countly.app_version = ob.app_version || Countly.app_version || "0.0";
            Countly.country_code = ob.country_code || Countly.country_code || null;
            Countly.city = ob.city || Countly.city || null;
            Countly.ip_address = ob.ip_address || Countly.ip_address || null;
            Countly.ignore_bots = ob.ignore_bots || Countly.ignore_bots || true;
            Countly.force_post = ob.force_post || Countly.force_post || false;
            Countly.q = Countly.q || [];
            Countly.onload = Countly.onload || [];
            Countly.ignore_visitor = ob.ignore_visitor || Countly.ignore_visitor || false;
            Countly.require_consent = ob.require_consent || Countly.require_consent || false;
            if(ob.ignore_referrers && ob.ignore_referrers.constructor === Array){
                ignoreReferrers = ob.ignore_referrers;
            }
            else if(Countly.ignore_referrers && Countly.ignore_referrers.constructor === Array){
                ignoreReferrers = Countly.ignore_referrers;
            }
            
            if(Countly.url === ""){
                log("Please provide server URL");
                Countly.ignore_visitor = true;
            }
            if(store("cly_ignore")){
                //opted out user
                Countly.ignore_visitor = true;
            }
            if (Countly.ignore_prefetch && typeof document.visibilityState !== 'undefined' && document.visibilityState === 'prerender') {
                Countly.ignore_visitor = true;
            }
            if(Countly.ignore_bots && searchBotRE.test(navigator.userAgent)){
                Countly.ignore_visitor = true;
            }
            if(window.name && window.name.indexOf("cly:") === 0){
                Countly.passed_data = JSON.parse(window.name.replace("cly:", ""));
            }
            else if(location.hash && location.hash.indexOf("#cly:") === 0){
                Countly.passed_data = JSON.parse(location.hash.replace("#cly:", ""));
            }
            
            if(Countly.passed_data){
                if(Countly.passed_data.token && Countly.passed_data.purpose){
                    if(Countly.passed_data.token != store("cly_old_token")){
                        setToken(Countly.passed_data.token);
                        store("cly_old_token", Countly.passed_data.token);
                    }
                    if(Countly.passed_data.purpose === "heatmap"){
                        Countly.ignore_visitor = true;
                        showLoader();
                        loadJS(Countly.url+"/views/heatmap.js", hideLoader);
                    }
                }
            }
            
            if(!Countly.ignore_visitor){
                log("Countly initialized");
                
                //let code waiting for us to load, know that we have loaded
                if(Countly.onload.constructor !== Array)
                    Countly.onload = [];
                
                if(Countly.q.constructor !== Array)
                    Countly.q = [];
                heartBeat();
                store("cly_id", Countly.device_id);
                var i = 0;
                if (location.search) {
                    var parts = location.search.substring(1).split('&');
    
                    for (i = 0; i < parts.length; i++) {
                        var nv = parts[i].split('=');
                        if (nv[0] == "cly_id")
                            store("cly_cmp_id", nv[1]);
                        else if(nv[0] == "cly_uid")
                            store("cly_cmp_uid", nv[1]);
                    }
                }
                
                //notify load waiters
                if(typeof Countly.onload !== "undefined" && Countly.onload.length > 0){
                    for(i = 0; i < Countly.onload.length; i++){
                        if(typeof Countly.onload[i] === "function")
                            Countly.onload[i]();
                    }
                    Countly.onload = [];
                }
            }
        }
    };
    
    /**
    * Modify feature groups for consent management. Allows you to group multiple features under one feature group
    * @param {object} features - object to define feature name as key and core features as value
    * @example <caption>Adding all features under one group</caption>
    * Countly.group_features({all:["sessions","events","views","scrolls","clicks","forms","crashes","attribution","users"]});
    * //After this call Countly.add_consent("all") to allow all features
    @example <caption>Grouping features</caption>
    * Countly.group_features({
    *    activity:["sessions","events","views"],
    *    interaction:["scrolls","clicks","forms"]
    * });
    * //After this call Countly.add_consent("activity") to allow "sessions","events","views"
    * //or call Countly.add_consent("interaction") to allow "scrolls","clicks","forms"
    * //or call Countly.add_consent("crashes") to allow some separate feature
    */ 
    Countly.group_features = function(features){
        if(features){
            var ob;
            for(var i in features){
                ob = {};
                if(!consents[i]){
                    if(typeof features[i] === "string"){
                        consents[i] = {features:[features[i]]};
                    }
                    else if(features[i] && features[i].constructor === Array && features[i].length){
                        consents[i] = {features:features[i]};
                    }
                    else{
                        log("Incorrect feature list for "+i+" value: "+features[i]);
                    }
                }
                else{
                    log("Feature name "+i+" is already reserved");
                }
            }
        }
        else{
            log("Incorrect features: "+features);
        }
    };
    
    /**
    * Check if consent is given for specific feature (either core feature of from custom feature group)
    * @param {string} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users" or customly provided through {@link Countly.group_features}
    */
    Countly.check_consent = function(feature){
        if(!Countly.require_consent){
            //we don't need to have specific consents
            return true;
        }
        if(consents[feature]){
            return (consents[feature] && consents[feature].optin) ? true : false;
        }
        else{
            log("No feature available for "+feature);
        }
        return false;
    };
    
    /**
    * Add consent for specific feature, meaning, user allowed to track that data (either core feature of from custom feature group)
    * @param {string|array} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users" or customly provided through {@link Countly.group_features}
    */
    Countly.add_consent = function(feature){
        log("Adding consent for "+feature);
        if(feature.constructor === Array){
            for(var i = 0; i < feature.length; i++){
                Countly.add_consent(feature[i]);
            }
        }
        else if(consents[feature]){
            if(consents[feature].features){
                consents[feature].optin = true;
                //this is added group, let's iterate through sub features
                Countly.add_consent(consents[feature].features);
            }
            else{
                //this is core feature
                if(consents[feature].optin !== true){
                    syncConsents[feature] = true;
                    consents[feature].optin = true;
                    updateConsent();
                    if(feature === "sessions" && lastParams.begin_session){
                        Countly.begin_session.apply(Countly, lastParams.begin_session);
                        lastParams.begin_session = null;
                    }
                    else if(feature === "views" && lastParams.track_pageview){
                        lastView = null;
                        Countly.track_pageview.apply(Countly, lastParams.track_pageview);
                        lastParams.track_pageview = null;
                    }
                        
                }
            }
        }
        else{
            log("No feature available for "+feature);
        }
    };
    
    
    /**
    * Remove consent for specific feature, meaning, user opted out to track that data (either core feature of from custom feature group)
    * @param {string|array} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users" or customly provided through {@link Countly.group_features}
    */
    Countly.remove_consent = function(feature){
        log("Removing consent for "+feature);
        if(feature.constructor === Array){
            for(var i = 0; i < feature.length; i++){
                Countly.remove_consent(feature[i]);
            }
        }
        else if(consents[feature]){
            if(consents[feature].features){
                //this is added group, let's iterate through sub features
                Countly.remove_consent(consents[feature].features);
            }
            else{
                //this is core feature
                if(consents[feature].optin !== false){
                    syncConsents[feature] = false;
                    updateConsent();
                }
            }
            consents[feature].optin = false;
        }
        else{
            log("No feature available for "+feature);
        }
    };
    
    var consentTimer;
    var updateConsent = function(){
        if(consentTimer){
            //delay syncing consents
            clearTimeout(consentTimer);
            consentTimer = null;
        }
        consentTimer = setTimeout(function(){
            if(hasAnyProperties(syncConsents)){
                //we have consents to sync, create request
                toRequestQueue({consent:JSON.stringify(syncConsents)});
                //clear consents that needs syncing
                syncConsents = {};
            }
        }, 1000);
    };
    
    /**
    * Start session
    * @param {boolean} noHeartBeat - true if you don't want to use internal heartbeat to manage session
    */
    
    Countly.begin_session = function(noHeartBeat){
        if(Countly.check_consent("sessions")){
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
        }
        else{
            lastParams.begin_session = arguments;
        }
    };
    
    /**
    * Report session duration
    * @param {int} sec - amount of seconds to report for current session
    */
    Countly.session_duration = function(sec){
        if(Countly.check_consent("sessions")){
            if(sessionStarted){
                log("Session extended", sec);
                toRequestQueue({session_duration:sec});
            }
        }
    };
    
    /**
    * End current session
    * @param {int} sec - amount of seconds to report for current session, before ending it
    */
    Countly.end_session = function(sec){
        if(Countly.check_consent("sessions")){
            if(sessionStarted){
                sec = sec || getTimestamp()-lastBeat;
                log("Ending session");
                reportViewDuration();
                sessionStarted = false;
                toRequestQueue({end_session:1, session_duration:sec});
            }
        }
    };
    
    /**
    * Change current user/device id
    * @param {string} newId - new user/device ID to use
    * @param {boolean} merge - move data from old ID to new ID on server
    **/
    Countly.change_id = function(newId, merge){
        if(Countly.device_id != newId){
            if(!merge){
                //end current session
                Countly.end_session();
                //clear timed events
                timedEvents = {};
            }
            var oldId = Countly.device_id;
            Countly.device_id = newId;
            store("cly_id", Countly.device_id);
            log("Changing id");
            if(merge)
                toRequestQueue({old_device_id:oldId});
            else
                //start new session for new id
                Countly.begin_session(!autoExtend);
        }
    };
    
    /**
    * Report custom event
    * @param {Object} event - Countly {@link Event} object
    * @param {string} event.key - name or id of the event
    * @param {number} [event.count=1] - how many times did event occur
    * @param {number=} event.sum - sum to report with event (if any)
    * @param {number=} event.dur - duration to report with event (if any)
    * @param {Object=} event.segmentation - object with segments key /values
    **/
    Countly.add_event = function(event){
        if(Countly.check_consent("events")){
            add_cly_events(event);
        }
    };
    
    //internal method for events, in case there is no consent for custom events, but internal events has consents
    function add_cly_events(event){
        if(!event.key){
            log("Event must have key property");
            return;
        }
        
        if(!event.count)
            event.count = 1;
        
        var props = ["key", "count", "sum", "dur", "segmentation"];
        var e = getProperties(event, props);
        e.timestamp = getMsTimestamp();
        var date = new Date();
        e.hour = date.getHours();
        e.dow = date.getDay();
        eventQueue.push(e);
        store("cly_event", eventQueue);
        log("Adding event: ", event);
    }
    
    /**
    * Start timed event, which will fill in duration property upon ending automatically
    * @param {string} key - event name that will be used as key property
    **/
    Countly.start_event = function(key){
        if(timedEvents[key]){
            log("Timed event with key " + key + " already started");
            return;
        }
        timedEvents[key] = getTimestamp();
    };
    
    /**
    * End timed event
    * @param {string|object} event - event key if string or Countly event same as passed to {@link Countly.add_event}
    **/
    Countly.end_event = function(event){
        if(typeof event == "string"){
            event = {key:event};
        }
        if(!event.key){
            log("Event must have key property");
            return;
        }
        if(!timedEvents[event.key]){
            log("Timed event with key " + event.key + " was not started");
            return;
        }
        event.dur = getTimestamp() - timedEvents[event.key];
        Countly.add_event(event);
        delete timedEvents[event.key];
    };
    
    /**
    * Provide information about user
    * @param {Object} user - Countly {@link UserDetails} object
    * @param {string=} user.name - user's full name
    * @param {string=} user.username - user's username or nickname
    * @param {string=} user.email - user's email address
    * @param {string=} user.organization - user's organization or company
    * @param {string=} user.phone - user's phone number
    * @param {string=} user.picture - url to user's picture
    * @param {string=} user.gender - M value for male and F value for femail
    * @param {number=} user.byear - user's birth year used to calculate current age
    * @param {Object=} user.custom - object with custom key value properties you want to save with user
    **/
    Countly.user_details = function(user){
        if(Countly.check_consent("users")){
            log("Adding userdetails: ", user);
            var props = ["name", "username", "email", "organization", "phone", "picture", "gender", "byear", "custom"];
            toRequestQueue({user_details: JSON.stringify(getProperties(user, props))});
        }
    };
    
    /**
    * Report user conversion to the server (when user signup or made a purchase, or whatever your conversion is), if there is no campaign data, user will be reported as organic
    * @param {string=} campaign_id - id of campaign, or will use the one that is stored after campaign link click
    * @param {string=} campaign_user_id - id of user's click on campaign, or will use the one that is stored after campaign link click
    **/
    Countly.report_conversion = function(campaign_id, campaign_user_id){
        if(Countly.check_consent("attribution")){
            campaign_id = campaign_id || store("cly_cmp_id") || "cly_organic";
            campaign_user_id = campaign_user_id || store("cly_cmp_uid");
            
            if(campaign_id && campaign_user_id)
                toRequestQueue({campaign_id: campaign_id, campaign_user: campaign_user_id});
            else if(campaign_id)
                toRequestQueue({campaign_id: campaign_id});
        }
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
        if(Countly.check_consent("users")){
            if(!customData[key])
                customData[key] = {};
            if(mod == "$push" || mod == "$pull" || mod == "$addToSet"){
                if(!customData[key][mod])
                    customData[key][mod] = [];
                customData[key][mod].push(value);
            }
            else
                customData[key][mod] = value;
        }
    };
    
    /**
    * Control user related custom properties. Don't forget to call save after finishing manipulation of custom data
    * @namespace Countly.userData
    * @name Countly.userData
    * @example
    * //set custom key value property
    * Countly.userData.set("twitter", "ar2rsawseen");
    * //create or increase specific number property
    * Countly.userData.increment("login_count");
    * //add new value to array property if it is not already there
    * Countly.userData.push_unique("selected_category", "IT");
    * //send all custom property modified data to server
    * Countly.userData.save();
    */
    Countly.userData = {
        /**
        * Sets user's custom property value
        * @param {string} key - name of the property to attach to user
        * @param {string|number} value - value to store under provided property
        **/
        set: function(key, value){
            customData[key] = value;
        },
        /**
        * Sets user's custom property value only if it was not set before
        * @param {string} key - name of the property to attach to user
        * @param {string|number} value - value to store under provided property
        **/
        set_once: function(key, value){
            change_custom_property(key, 1, "$setOnce");
        },
        /**
        * Increment value under the key of this user's custom properties by one
        * @param {string} key - name of the property to attach to user
        **/
        increment: function(key){
            change_custom_property(key, 1, "$inc");
        },
        /**
        * Increment value under the key of this user's custom properties by provided value
        * @param {string} key - name of the property to attach to user
        * @param {number} value - value by which to increment server value
        **/
        increment_by: function(key, value){
            change_custom_property(key, value, "$inc");
        },
        /**
        * Multiply value under the key of this user's custom properties by provided value
        * @param {string} key - name of the property to attach to user
        * @param {number} value - value by which to multiply server value
        **/
        multiply: function(key, value){
            change_custom_property(key, value, "$mul");
        },
        /**
        * Save maximal value under the key of this user's custom properties
        * @param {string} key - name of the property to attach to user
        * @param {number} value - value which to compare to server's value and store maximal value of both provided
        **/
        max: function(key, value){
            change_custom_property(key, value, "$max");
        },
        /**
        * Save minimal value under the key of this user's custom properties
        * @param {string} key - name of the property to attach to user
        * @param {number} value - value which to compare to server's value and store minimal value of both provided
        **/
        min: function(key, value){
            change_custom_property(key, value, "$min");
        },
        /**
        * Add value to array under the key of this user's custom properties. If property is not an array, it will be converted to array
        * @param {string} key - name of the property to attach to user
        * @param {string|number} value - value which to add to array
        **/
        push: function(key, value){
            change_custom_property(key, value, "$push");
        },
        /**
        * Add value to array under the key of this user's custom properties, storing only unique values. If property is not an array, it will be converted to array
        * @param {string} key - name of the property to attach to user
        * @param {string|number} value - value which to add to array
        **/
        push_unique: function(key, value){
            change_custom_property(key, value, "$addToSet");
        },
        /**
        * Remove value from array under the key of this user's custom properties
        * @param {string} key - name of the property
        * @param {string|number} value - value which to remove from array
        **/
        pull: function(key, value){
            change_custom_property(key, value, "$pull");
        },
        /**
        * Save changes made to user's custom properties object and send them to server
        **/
        save: function(){
            if(Countly.check_consent("users")){
                toRequestQueue({user_details: JSON.stringify({custom:customData})});
            }
            customData = {};
        }
    };
    
    /**
    * Automatically track javascript errors that happen on the website and report them to the server
    * @param {string=} segments - additional key value pairs you want to provide with error report, like versions of libraries used, etc.
    **/
    Countly.track_errors = function(segments){
        crashSegments = segments;
        //override global uncaught error handler
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
    
    /**
    * Log an exception that you catched through try and catch block and handled yourself and just want to report it to server
    * @param {Object} err - error exception object provided in catch block
    * @param {string=} segments - additional key value pairs you want to provide with error report, like versions of libraries used, etc.
    **/
    Countly.log_error = function(err, segments){
        recordError(err, true, segments);
    };
    
    /**
    * Add new line in the log of breadcrumbs of what user did, will be included together with error report
    * @param {string} record - any text describing what user did
    **/
    Countly.add_log = function(record){
        if(Countly.check_consent("crashes")){
            crashLogs.push(record);
        }
    };
    
    /**
    * Stop tracking duration time for this user
    **/
    Countly.stop_time = function(){
        if(trackTime){
            trackTime = false;
            storedDuration = getTimestamp() - lastBeat;
            lastViewStoredDuration = getTimestamp() - lastViewTime;
        }
    };
    
    /**
    * Start tracking duration time for this user, by default it is automatically tracked if you are using internal session handling
    **/
    Countly.start_time = function(){
        if(!trackTime){
            trackTime = true;
            lastBeat = getTimestamp() - storedDuration;
            lastViewTime = getTimestamp() - lastViewStoredDuration;
            lastViewStoredDuration = 0;
        }
    };
    
    /**
    * Track user sessions automatically, including  time user spent on your website
    **/
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
        
        function resetInactivity(){
            if(inactivityCounter >= inactivityTime){
                Countly.start_time();
            }
            inactivityCounter = 0;
        }
        
        add_event(window, "mousemove", resetInactivity);
        add_event(window, "click", resetInactivity);
        add_event(window, "keydown", resetInactivity);
        add_event(window, "scroll", resetInactivity);
        
        //track user inactivity
        setInterval(function(){
            inactivityCounter++;
            if(inactivityCounter >= inactivityTime){
                Countly.stop_time();
            }
        }, 60000);
    };
    
    /**
    * Track page views user visits
    * @param {string=} page - optional name of the page, by default uses current url path
    * @param {array=} ignoreList - optional array of strings or regexes to test for the url/view name to ignore and not report
    **/
    Countly.track_pageview = function(page, ignoreList){
        reportViewDuration();
        //we got ignoreList first
        if(page && page.constructor === Array){
            ignoreList = page;
            page = null;
        }
        page = page || window.location.pathname;
        if(ignoreList && ignoreList.length){
            for(var i = 0; i < ignoreList.length; i++){
                try{
                    var reg = new RegExp(ignoreList[i]);
                    if(reg.test(page)){
                        log("Ignored:", page);
                        return;
                    }
                }
                catch(ex){}
            }
        }
        lastView = page;
        lastViewTime = getTimestamp();
        var segments = {
            "name": page,
            "visit":1,
            "domain":window.location.hostname
        };
        
        if(typeof document.referrer !== "undefined" && document.referrer.length){
            var matches = urlParseRE.exec(document.referrer);
            //do not report referrers of current website
            if(matches && matches[11] && matches[11] != window.location.hostname)
                segments.start = 1;
        }
        
        //track pageview
        if(Countly.check_consent("views")){
            add_cly_events({
                "key": "[CLY]_view",
                "segmentation": segments
            });
        }
        else{
            lastParams.track_pageview = arguments;
        }
    };
    
    /**
    * Track page views user visits. Alias of {@link track_pageview} method for compatability with NodeJS SDK
    * @param {string=} page - optional name of the page, by default uses current url path
    * @param {array=} ignoreList - optional array of strings or regexes to test for the url/view name to ignore and not report
    **/
    Countly.track_view = function(page, ignoreList){
        Countly.track_pageview(page, ignoreList);
    };
    
    /**
    * Track all clicks on this page
    * @param {Object=} parent - DOM object which children to track, by default it is document body
    **/
    Countly.track_clicks = function(parent){
        parent = parent || document;
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
                    if(Countly.check_consent("clicks")){
                        add_cly_events({
                            "key": "[CLY]_action",
                            "segmentation": {
                                "type": "click",
                                "x":event.pageX,
                                "y":event.pageY,
                                "width":width,
                                "height":height,
                                "domain":window.location.hostname,
                                "view":window.location.pathname
                            }
                        });
                    }
                }
                setTimeout(function(){shouldProcess = true;}, 1000);
            }
        }
        //add any events you want
        add_event(parent, "click", processClick);
    };

    /**
    * Track all scrolls on this page
    * @param {Object=} parent - DOM object which children to track, by default it is document body
    **/
    Countly.track_scrolls = function(parent){
        parent = parent || window;
        var shouldProcess = true;
        var scrollY = 0;

        function processScroll(event){
            scrollY = Math.max(scrollY, window.scrollY, document.body.scrollTop, document.documentElement.scrollTop);            
        }
        
        function processScrollView(e){
            if(shouldProcess){
                shouldProcess = false;
                var height = getDocHeight();
                var width = getDocWidth();
                
                var viewportHeight = getViewportHeight();                

                if(Countly.check_consent("scrolls")){
                    add_cly_events({
                        "key": "[CLY]_action",
                        "segmentation": {
                            "type": "scroll",
                            "y":scrollY + viewportHeight,
                            "width":width,
                            "height":height,
                            "domain":window.location.hostname,
                            "view":window.location.pathname
                        }
                    }); 
                }
            }
        }

        add_event(parent, "scroll", processScroll);
        add_event(parent, "beforeunload", processScrollView);
        add_event(parent, "unload", processScrollView);        
    };
    
    /**
    * Generate custom event for all links that were clicked on this page
    * @param {Object=} parent - DOM object which children to track, by default it is document body
    **/
    Countly.track_links = function(parent){
        parent = parent || document;
         function processClick(event){

             //get element which was clicked
             var elem = get_event_target(event).closest('a');
             
             if(elem){
                //cross browser click coordinates
                get_page_coord(event);
                
                //record click event
                if(Countly.check_consent("clicks")){
                    add_cly_events({
                        "key": "linkClick",
                        "segmentation": {
                            "href": elem.href,
                            "text": elem.innerText,
                            "id": elem.id,
                            "x":event.pageX,
                            "y":event.pageY,
                            "view":window.location.pathname
                        }
                    });
                }
                //anticipate page unload
                if(typeof elem.href !== "undefined" && elem.target !== '_blank' && !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)){
                    var link = elem.href.replace(window.location.href.split("#")[0], "");
                    if(link.indexOf("#") !== 0){
                        //most probably user will leave the page
                        
                        //end Countly session
                        Countly.end_session();
                    }
                }
             }
         }

        //add any events you want
        add_event(parent, "click", processClick);
    };
    
    /**
    * Generate custom event for all forms that were submitted on this page
    * @param {Object=} parent - DOM object which children to track, by default it is document body
    **/
    Countly.track_forms = function(parent){
        parent = parent || document;
        function getInputName(input){
            return input.name || input.id || input.type || input.nodeName;
        }
        function processForm(event){
            var form = get_event_target(event);
            var segmentation = {
                "id": form.id,
                "name": form.name,
                "action": form.action,
                "method": form.method,
                "view":window.location.pathname
            };
            
            //get input values
            var input;
            if(typeof form.elements !== "undefined"){
                for(var i = 0; i < form.elements.length; i++){
                    input = form.elements[i];
                    if(input && input.type != "password"){
                        if(typeof segmentation["input:"+getInputName(input)] === "undefined")
                            segmentation["input:"+getInputName(input)] = [];
                        if(input.nodeName.toLowerCase() == "select"){
                            if(typeof input.multiple !== "undefined"){
                                var values = [];
                                if(typeof input.options !== "undefined")
                                    for(var j = 0; j < input.options.length; j++){
                                        if (input.options[j].selected)
                                            values.push(input.options[j].value);
                                    }
                                segmentation["input:"+getInputName(input)].push(values.join(", "));
                            }
                            else
                                segmentation["input:"+getInputName(input)].push(input.options[input.selectedIndex].value);
                        }
                        else if(input.nodeName.toLowerCase() == "input"){
                            if(typeof input.type !== "undefined"){
                                if(input.type.toLowerCase() == "checkbox" || input.type.toLowerCase() == "radio"){
                                    if(input.checked){
                                        segmentation["input:"+getInputName(input)].push(input.value);
                                    }
                                }
                                else{
                                    segmentation["input:"+getInputName(input)].push(input.value);
                                }
                            }
                            else
                                segmentation["input:"+getInputName(input)].push(input.value);
                        }
                        else if(input.nodeName.toLowerCase() == "textarea"){
                            segmentation["input:"+getInputName(input)].push(input.value);
                        }
                        else if(typeof input.value !== "undefined"){
                            segmentation["input:"+getInputName(input)].push(input.value);
                        }
                    }
                }
                for(var key in segmentation){
                    if(typeof segmentation[key].join != "undefined")
                        segmentation[key] = segmentation[key].join(", ");
                }
            }
            
            //record submit event
            if(Countly.check_consent("forms")){
                add_cly_events({
                    "key": "formSubmit",
                    "segmentation": segmentation
                });
            }
            
            //form will refresh page
            
            //end Countly session
            Countly.end_session();
        }
        
        //add any events you want
        add_event(parent, "submit", processForm);
    };
    
    /**
    * Collect possible user data from submitted forms. Add cly_user_ignore class to ignore inputs in forms or cly_user_{key} to collect data from this input as specified key, as cly_user_username to save collected value from this input as username property. If not class is provided, Countly SDK will try to determine type of information automatically.
    * @param {Object=} parent - DOM object which children to track, by default it is document body
    * @param {boolean} [useCustom=false] - submit collected data as custom user properties, by default collects as main user properties
    **/
    Countly.collect_from_forms = function(parent, useCustom){
        parent = parent || document;
        function processForm(event){
            var form = get_event_target(event);
            var userdata = {};
            var hasUserInfo = false;
            
            //get input values
            var input;
            if(typeof form.elements !== "undefined"){
                //load labels for inputs
                var labelData = {};
                var labels = parent.getElementsByTagName('LABEL');
                var i, j;
                for (i = 0; i < labels.length; i++) {
                    if (labels[i].htmlFor && labels[i].htmlFor !== '') {
                        labelData[labels[i].htmlFor] = labels[i].innerText || labels[i].textContent || labels[i].innerHTML;     
                    }
                }
                for(i = 0; i < form.elements.length; i++){
                    input = form.elements[i];
                    if(input && input.type != "password"){
                        //check if element should be ignored
                        if(input.className.indexOf("cly_user_ignore") == -1){
                            var value = "";
                            //get value from input
                            if(input.nodeName.toLowerCase() == "select"){
                                if(typeof input.multiple !== "undefined"){
                                    var values = [];
                                    if(typeof input.options !== "undefined")
                                        for(j = 0; j < input.options.length; j++){
                                            if (input.options[j].selected)
                                                values.push(input.options[j].value);
                                        }
                                    value = values.join(", ");
                                }
                                else
                                    value = input.options[input.selectedIndex].value;
                            }
                            else if(input.nodeName.toLowerCase() == "input"){
                                if(typeof input.type !== "undefined"){
                                    if(input.type.toLowerCase() == "checkbox" || input.type.toLowerCase() == "radio"){
                                        if(input.checked)
                                            value = input.value;
                                    }
                                    else{
                                        value = input.value;
                                    }
                                }
                                else
                                    value = input.value;
                            }
                            else if(input.nodeName.toLowerCase() == "textarea"){
                                value = input.value;
                            }
                            else if(typeof input.value !== "undefined"){
                                value = input.value;
                            }
                            //check if input was marked to be collected
                            if(input.className && input.className.indexOf("cly_user_") != -1){
                                var classes = input.className.split(" ");
                                for(j = 0; j < classes.length; j++){
                                    if(classes[j].indexOf("cly_user_") === 0){
                                        userdata[classes[j].replace("cly_user_", "")] = value;
                                        hasUserInfo = true;
                                        break;
                                    }
                                }
                            }
                            //check for email
                            else if((input.type && input.type.toLowerCase() == "email") || 
                            (input.name && input.name.toLowerCase().indexOf("email") != -1) ||
                            (input.id && input.id.toLowerCase().indexOf("email") != -1) ||
                            (input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("email") != -1) ||
                            (/[^@\s]+@[^@\s]+\.[^@\s]+/).test(value)){
                                if(!userdata.email){
                                    userdata.email = value;
                                }
                                hasUserInfo = true;
                            }
                            else if((input.name && input.name.toLowerCase().indexOf("username") != -1) ||
                            (input.id && input.id.toLowerCase().indexOf("username") != -1) ||
                            (input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("username") != -1) ){
                                if(!userdata.username){
                                    userdata.username = value;
                                }
                                hasUserInfo = true;
                            }
                            else if((input.name && (input.name.toLowerCase().indexOf("tel") != -1 || input.name.toLowerCase().indexOf("phone") != -1 || input.name.toLowerCase().indexOf("number") != -1)) ||
                            (input.id && (input.id.toLowerCase().indexOf("tel") != -1 || input.id.toLowerCase().indexOf("phone") != -1 || input.id.toLowerCase().indexOf("number") != -1)) ||
                            (input.id && labelData[input.id] && (labelData[input.id].toLowerCase().indexOf("tel") != -1 || labelData[input.id].toLowerCase().indexOf("phone") != -1 || labelData[input.id].toLowerCase().indexOf("number") != -1)) ){
                                if(!userdata.phone){
                                    userdata.phone = value;
                                }
                                hasUserInfo = true;
                            }
                            else if((input.name && (input.name.toLowerCase().indexOf("org") != -1 || input.name.toLowerCase().indexOf("company") != -1)) ||
                            (input.id && (input.id.toLowerCase().indexOf("org") != -1 || input.id.toLowerCase().indexOf("company") != -1)) ||
                            (input.id && labelData[input.id] && (labelData[input.id].toLowerCase().indexOf("org") != -1 || labelData[input.id].toLowerCase().indexOf("company") != -1)) ){
                                if(!userdata.organization){
                                    userdata.organization = value;
                                }
                                hasUserInfo = true;
                            }
                            else if((input.name && input.name.toLowerCase().indexOf("name") != -1) ||
                            (input.id && input.id.toLowerCase().indexOf("name") != -1) ||
                            (input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("name") != -1) ){
                                if(!userdata.name){
                                    userdata.name = "";
                                }
                                userdata.name += value+" ";
                                hasUserInfo = true;
                            }
                        }
                    }
                }
            }
            
            //record user info, if any
            if(hasUserInfo){
                log("Gathered user data", userdata);
                if(useCustom)
                    Countly.user_details({custom:userdata});
                else
                    Countly.user_details(userdata);
            }
            
            //form will refresh page
            
            //end Countly session
            Countly.end_session();
        }
        
        //add any events you want
        add_event(parent, "submit", processForm);
    };
    
    /**
    * Collect information about user from Facebook, if your website integrates Facebook SDK. Call this method after Facebook SDK is loaded and user is authenticated.
    * @param {Object=} custom - Custom keys to collected from Facebook, key will be used to store as key in custom user properties and value as key in Facebook graph object. For example, {"tz":"timezone"} will collect Facebook's timezone property, if it is available and store it in custom user's property under "tz" key. If you want to get value from some sub object properties, then use dot as delimiter, for example, {"location":"location.name"} will collect data from Facebook's {"location":{"name":"MyLocation"}} object and store it in user's custom property "location" key
    **/
    Countly.collect_from_facebook = function(custom){
        if(FB && FB.api){
            FB.api('/me', function(resp) {
                var data = {};
                if(resp.name)
                    data.name = resp.name;
                if(resp.email)
                    data.email = resp.email;
                if(resp.gender == "male")
                    data.gender = "M";
                else if(resp.gender == "female")
                    data.gender = "F";
                if(resp.birthday){
                    var byear = resp.birthday.split("/").pop();
                    if(byear && byear.length == 4)
                        data.byear = byear;
                }
                if(resp.work && resp.work[0] && resp.work[0].employer && resp.work[0].employer.name){
                    data.organization = resp.work[0].employer.name;
                }
                //check if any custom keys to collect
                if(custom){
                    data.custom = {};
                    for(var i in custom){
                        var parts = custom[i].split(".");
                        var get = resp;
                        for(var j = 0; j < parts.length; j++){
                            get = get[parts[j]];
                            if(typeof get === "undefined")
                                break;
                        }
                        if(typeof get !== "undefined")
                            data.custom[i] = get;
                    }
                }
                Countly.user_details(data);
            });
        }
    };
    /**
    * Opts out user of any metric tracking
    **/
    Countly.opt_out = function(){
        Countly.ignore_visitor = true;
        store("cly_ignore", true);
    };
    
    /**
    * Opts in user for tracking, if complies with other user ignore rules like bot useragent and prefetch settings
    **/
    Countly.opt_in = function(){
        store("cly_ignore", false);
        Countly.ignore_visitor = false;
        if (Countly.ignore_prefetch && typeof document.visibilityState !== 'undefined' && document.visibilityState === 'prerender') {
            Countly.ignore_visitor = true;
        }
        if(Countly.ignore_bots && searchBotRE.test(navigator.userAgent)){
            Countly.ignore_visitor = true;
        }
        if(!Countly.ignore_visitor && !hasPulse)
            heartBeat();
    };

    /**
    * Show specific widget popup by the widget id
    * @param {string} id - id value of related feedback widget, you can get this value by click "Copy ID" button in row menu at "Feedback widgets" screen
    */
    Countly.show_feedback_popup = function(id) {
        // define xhr object
        sendXmlHttpRequest(Countly.url+ '/o/feedback/widget', {app_key:Countly.app_key, widget_id:id}, function(err, params, responseText){
            if(err){
                log("Error occurred", err);
            }
            try {
                // widget object
                var currentWidget = JSON.parse(responseText);     
                processWidget(currentWidget, false);   
            } catch (JSONParseError) {
                log("JSON parse failed: " + JSONParseError);
            }
        });
    };
    
    /**
    * Show feedback popup by passed widget ids array
    * @param {object=} configuration - required - includes "widgets" property as string array of widgets
    * example configuration: {"widgets":["5b21581b967c4850a7818617"]}
    **/
    Countly.enable_feedback = function(params){
        // inject feedback styles
        loadCSS(Countly.url + '/star-rating/stylesheets/countly-feedback-web.css');
        // get enable widgets by app_key
        // define xhr object
        var enableWidgets = params.widgets;

        if (enableWidgets.length > 0) {
            document.body.innerHTML += '<div id="cfbg"></div>';

            sendXmlHttpRequest(Countly.url + '/o/feedback/multiple-widgets-by-id', {app_key:Countly.app_key, widgets:JSON.stringify(params.widgets)}, function(err, params, responseText){
                if(err){
                    log("Errors occurred:", err);
                }
                try {
                    // widgets array
                    var widgets = JSON.parse(responseText);    
                
                    for (var i = 0; i < widgets.length; i++) {
                        
                        var target_devices = widgets[i].target_devices;
                        var currentDevice = detect_device.device;
                        if (target_devices[currentDevice]) {
                            var pages = widgets[i].target_pages;
                            for (var k = 0; k < pages.length; k++) {
                                widgets[i].hide_sticker = widgets[i].hide_sticker === "true" ? true : false;
                                if (pages[k] === window.location.pathname && !widgets[i].hide_sticker) {
                                    processWidget(widgets[i], true);
                                }
                            }
                        }
                    }   
                    
                } catch (JSONParseError) {
                    log("JSON parse error: " + JSONParseError);
                }
            });
        } else {
            log("You should provide at least one widget id as param. Read documentation for more detail. https://resources.count.ly/plugins/feedback");
        }
    };
    
    /**
    *  PRIVATE METHODS
    **/
    
    function processWidget(currentWidget, hasSticker){
        try {
            // create wrapper div
            var wrapper = document.createElement("div");
            wrapper.className = 'countly-iframe-wrapper';
            wrapper.id = 'countly-iframe-wrapper-'+currentWidget._id;
            // create close icon for iframe popup
            var closeIcon = document.createElement("span");
            closeIcon.className = "countly-feedback-close-icon";
            closeIcon.id = "countly-feedback-close-icon-"+currentWidget._id;
            closeIcon.innerHTML = "x";
            // create iframe 
            var iframe = document.createElement("iframe");
            iframe.name = "countly-feedback-iframe";
            iframe.id = "countly-feedback-iframe";
            iframe.src = Countly.url + "/feedback?widget_id=" + currentWidget._id + "&app_key=" + Countly.app_key + '&device_id=' + Countly.device_id + '&sdk_version=' + SDK_VERSION;
            // inject them to dom
            document.body.appendChild(wrapper);
            wrapper.appendChild(closeIcon);
            wrapper.appendChild(iframe);
            add_event(document.getElementById('countly-feedback-close-icon-'+currentWidget._id), 'click', function(){
                document.getElementById('countly-iframe-wrapper-'+currentWidget._id).style.display = "none";
                document.getElementById('cfbg').style.display = "none";
            });
            if(hasSticker) {
                var sticker = document.createElement("div");
                sticker.style.color = ((currentWidget.trigger_font_color < 7) ? '#'+currentWidget.trigger_font_color : currentWidget.trigger_font_color);
                sticker.style.backgroundColor = ((currentWidget.trigger_bg_color.length < 7) ? '#'+currentWidget.trigger_bg_color : currentWidget.trigger_bg_color);
                sticker.className = 'countly-feedback-sticker '+ currentWidget.trigger_position;
                sticker.id = 'countly-feedback-sticker-'+currentWidget._id;
                sticker.innerHTML = '<svg id="feedback-sticker-svg" aria-hidden="true" data-prefix="far" data-icon="grin" class="svg-inline--fa fa-grin fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path id="smileyPathInStickerSvg" fill="white" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm105.6-151.4c-25.9 8.3-64.4 13.1-105.6 13.1s-79.6-4.8-105.6-13.1c-9.9-3.1-19.4 5.4-17.7 15.3 7.9 47.1 71.3 80 123.3 80s115.3-32.9 123.3-80c1.6-9.8-7.7-18.4-17.7-15.3zM168 240c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z"></path></svg> ' + currentWidget.trigger_button_text;
                document.body.appendChild(sticker);
                var smileySvg = document.getElementById("smileyPathInStickerSvg");
                smileySvg.style.fill = ((currentWidget.trigger_font_color < 7) ? '#'+currentWidget.trigger_font_color : currentWidget.trigger_font_color);
                add_event(document.getElementById('countly-feedback-sticker-'+currentWidget._id), 'click', function(){
                    document.getElementById('countly-iframe-wrapper-'+currentWidget._id).style.display = "block";
                    document.getElementById('cfbg').style.display = "block";
                });
            }
            else {
                document.getElementById('countly-iframe-wrapper-'+widget._id).style.display = "block";
                document.getElementById('cfbg').style.display = "block";
            }
        } catch (e) {
            log("Somethings went wrong while element injecting process: " + e);
        }
    }
    
    function reportViewDuration(){
        if(lastView){
            var segments = {
                "name": lastView,
                "segment":platform
            };

            //track pageview
            if(Countly.check_consent("views")){
                add_cly_events({
                    "key": "[CLY]_view",
                    "dur": getTimestamp() - lastViewTime,
                    "segmentation": segments
                });
            }
            lastView = null;
        }
    }
    
    function getLastView(){
        return lastView;
    }
    
    //insert request to queue
    function toRequestQueue(request){
        //ignore bots
        if(Countly.ignore_visitor)
            return;
        
        if(!Countly.app_key || !Countly.device_id){
            log("app_key or device_id is missing");
            return;
        }
        
        request.app_key = Countly.app_key;
        request.device_id = Countly.device_id;
        request.sdk_name = SDK_NAME;
        request.sdk_version = SDK_VERSION;
        
        if(Countly.country_code)
            request.country_code = Countly.country_code;
        
        if(Countly.city)
            request.city = Countly.city;
        
        if(Countly.ip_address !== null)
            request.ip_address = Countly.ip_address;
            
        request.timestamp = getMsTimestamp();
        var date = new Date();
        request.hour = date.getHours();
        request.dow = date.getDay();
        
        if(requestQueue.length > queueSize)
            requestQueue.shift();
        
        requestQueue.push(request);
        store("cly_queue", requestQueue, true);
    }
    
    //heart beat
    function heartBeat(){
        //ignore bots
        if(Countly.ignore_visitor){
            hasPulse = false;
            return;
        }
        hasPulse = true;
        //notify load waiters
        var i = 0;
        if(typeof Countly.onload !== "undefined" && Countly.onload.length > 0){
            for(i = 0; i < Countly.onload.length; i++){
                if(typeof Countly.onload[i] === "function")
                    Countly.onload[i]();
            }
            Countly.onload = [];
        }
        //process queue
        if(typeof Countly.q !== "undefined" && Countly.q.length > 0){
            var req;
            var q = Countly.q;
            Countly.q = [];
            for(i = 0; i < q.length; i++){
                req = q[i];
                log("Processing queued call", req);
                if(typeof req === "function"){
                    req();
                }
                else if(req.constructor === Array && req.length > 0){
                    if(typeof Countly[req[0]] !== "undefined")
                        Countly[req[0]].apply(null, req.slice(1));
                    else{
                        var userdata = req[0].replace("userData.", "");
                        if(typeof Countly.userData[userdata] !== "undefined")
                            Countly.userData[userdata].apply(null, req.slice(1));
                    }
                }
            }
        }
        
        //extend session if needed
        if(sessionStarted && autoExtend && trackTime){
            var last = getTimestamp();
            if(last - lastBeat > sessionUpdate){
                Countly.session_duration(last - lastBeat);
                lastBeat = last;
            }
        }
        
        //process event queue
        if(eventQueue.length > 0){
            if(eventQueue.length <= maxEventBatch){
                toRequestQueue({events: JSON.stringify(eventQueue)});
                eventQueue = [];
            }
            else{
                var events = eventQueue.splice(0, maxEventBatch);
                toRequestQueue({events: JSON.stringify(events)});
            }
            store("cly_event", eventQueue);
        }
        
        //process request queue with event queue
        if(requestQueue.length > 0 && readyToProcess && getTimestamp() > failTimeout){
            readyToProcess = false;
            var params = requestQueue.shift();
            //check if any consent to sync
            if(hasAnyProperties(syncConsents)){
                if(consentTimer){
                    clearTimeout(consentTimer);
                    consentTimer = null;
                }
                params.consent = JSON.stringify(syncConsents);
                syncConsents = {};
            }
            log("Processing request", params);
            sendXmlHttpRequest(Countly.url + apiPath, params, function(err, params){
                log("Request Finished", params, err);
                if(err){
                    requestQueue.unshift(params);
                    failTimeout = getTimestamp() + failTimeoutAmount;
                }
                store("cly_queue", requestQueue, true);
                readyToProcess = true;
            });
        }
        
        setTimeout(heartBeat, beatInterval);
    }
    
    //get ID
    function getId(){
        return store("cly_id") || generateUUID();
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
        metrics._ua = navigator.userAgent;
        
        //getting resolution
        if (screen.width) {
            var width = (screen.width) ? parseInt(screen.width) : 0;
            var height = (screen.height) ? parseInt(screen.height) : 0;
            if(width !== 0 && height !== 0){
                var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
                if(iOS && window.devicePixelRatio){
                    //ios provides dips, need to multiply
                    width = Math.round(width * window.devicePixelRatio);
                    height = Math.round(height * window.devicePixelRatio);
                }
                else{
                    if (Math.abs(window.orientation) === 90) {
                        //we have landscape orientation
                        //switch values for all except ios
                        var temp = width;
                        width = height;
                        height = temp;
                    }
                }
                metrics._resolution = '' + width + "x" + height;
            }
        }
        
        //getting density ratio
        if(window.devicePixelRatio){
            metrics._density = window.devicePixelRatio;
        }
        
        //getting locale
        var locale = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage;
        if(typeof locale !== "undefined")
            metrics._locale = locale;
        
        if(typeof document.referrer !== "undefined" && document.referrer.length){
            var matches = urlParseRE.exec(document.referrer);
            //do not report referrers of current website
            if(matches && matches[11] && matches[11] != window.location.hostname){
                var ignoring = false;
                if(ignoreReferrers && ignoreReferrers.length){
                    for(var k = 0; k < ignoreReferrers.length; k++){
                        try{
                            var reg = new RegExp(ignoreReferrers[k]);
                            if(reg.test(document.referrer)){
                                log("Ignored:", document.referrer);
                                ignoring = true;
                                break;
                            }
                        }
                        catch(ex){}
                    }
                }
                if(!ignoring)
                    metrics._store = document.referrer;
            }
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
    
    //get unique timestamp in miliseconds
    function getMsTimestamp(){
        var ts = new Date().getTime();
        if(lastMsTs >= ts)
            lastMsTs++;
        else
            lastMsTs = ts;
        return lastMsTs;
    }
    
    function recordError(err, nonfatal, segments){
        if(Countly.check_consent("crashes") && err){
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
            var ob = {_resolution:metrics._resolution, _error:error, _app_version:metrics._app_version, _run:getTimestamp()-startTime};
            
            ob._not_os_specific = true;
            
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
            
            ob._view = (window.location.pathname || "")+(window.location.search || "")+(window.location.hash || "");
            
            if(typeof segments !== "undefined")
                ob._custom = segments;
            
            try{
                var canvas = document.createElement("canvas");
                var gl = canvas.getContext("experimental-webgl");
                ob._opengl = gl.getParameter(gl.VERSION);
            }
            catch(ex){}
            
            toRequestQueue({crash: JSON.stringify(ob)});
        }
    }
    
    //sending xml HTTP request
    function sendXmlHttpRequest(url, params, callback) {
        try {
            log("Sending XML HTTP request");
            var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : null;
            params = params || {};
            var data = prepareParams(params);          
            var method = "GET";
            if(data.length >= 2000)
                method = "POST";
            else if(Countly.force_post)
                method = "POST";
            if(method === "GET") {
                xhr.open('GET', url + "?" + data, true);
            } else {
                xhr.open('POST', url, true);
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
            // fallback on error
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
                    if (typeof callback === 'function') { callback(false, params, this.responseText); }
                } else if (this.readyState === 4) {
                    log("Failed Server XML HTTP request", this.status);
                    if (typeof callback === 'function') { callback(true, params); }
                }
            };
            if(method == "GET")
                xhr.send();
            else
                xhr.send(data);
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
            str.push(i + "=" + encodeURIComponent(params[i]));
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
    
    //get closest parent matching nodeName
    if (!Element.prototype.closest) Element.prototype.closest = function (nodeName) {
        var el = this;
        nodeName = nodeName.toUpperCase();
        while (el) {
            if (el.nodeName.toUpperCase() == nodeName) {
                return el;
            }
            el = el.parentElement;
        }
    };
    
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

    // detect current device
    var detect_device = function() {
        var b = navigator.userAgent.toLowerCase(),
            a = function(a) {
                if(a){
                    b = (a+"").toLowerCase();
                }
                return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(b) ? "tablet" : /(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(b) ? "phone" : "desktop";
            };
        return {
            device: a(),
            detect: a,
            isMobile: "desktop" != a() ? !0 : !1,
            userAgent: b
        };
    }();
    
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
    
    function getViewportHeight() {
        var D = document;
        return Math.min(
            Math.min(D.body.clientHeight, D.documentElement.clientHeight),
            Math.min(D.body.offsetHeight, D.documentElement.offsetHeight),
            window.innerHeight
        );
    }
    
    function setToken(token){
        store("cly_token", token);
    }
    
    function getToken(){
        var token = store("cly_token");
        store("cly_token", null);
        return token;
    }

    function hasAnyProperties(ob){
        if(ob){
            for(var prop in ob){
                return true;
            }
        }
        return false;
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
        lsSupport = true;
        try {
            if (typeof localStorage !== "undefined") {
              localStorage.setItem('testLocal', true);
            }
        }
        catch (e){
            lsSupport = false;
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
            catch(e) {}
            
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
    
    //load external js files
    function loadJS(js, callback){
        var fileref=document.createElement('script'),
            loaded;
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", js);
        if (callback) {
            fileref.onreadystatechange = fileref.onload = function() {
                if (!loaded) {
                    callback();
                }
                loaded = true;
            };
        }
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }

    //load external css files
    function loadCSS(css, callback){
        var fileref=document.createElement('link'),loaded;
        fileref.setAttribute("rel","stylesheet");
        fileref.setAttribute("href", css);
        if (callback) {
            fileref.onreadystatechange = fileref.onload = function() {
                if (!loaded) {
                    callback();
                }
                loaded = true;
            };
        }
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
    
    function showLoader(){
        var loader = document.getElementById("cly-loader");
        if(!loader){
            log("setting up loader");
            var css = "#cly-loader {height: 4px; width: 100%; position: absolute; z-index: 99999; overflow: hidden; background-color: #fff; top:0px; left:0px;}"+
            "#cly-loader:before{display: block; position: absolute; content: ''; left: -200px; width: 200px; height: 4px; background-color: #2EB52B; animation: cly-loading 2s linear infinite;}"+
            '@keyframes cly-loading { from {left: -200px; width: 30%;} 50% {width: 30%;} 70% {width: 70%;} 80% { left: 50%;} 95% {left: 120%;} to {left: 100%;}}',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');
            style.type = 'text/css';
            if (style.styleSheet){
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            head.appendChild(style);
            loader = document.createElement('div');
            loader.setAttribute("id", "cly-loader");
            document.body.appendChild(loader);
        }
        loader.style.display = "block"; 
    }
    
    function hideLoader(){
        var loader = document.getElementById("cly-loader");
        if(loader){
           loader.style.display = "none"; 
        }
    }
    
    //expose internal methods for pluggable code to reuse them
    Countly._internals = {
        store:store,
        getDocWidth:getDocWidth,
        getDocHeight:getDocHeight,
        getViewportHeight:getViewportHeight,
        get_page_coord:get_page_coord,
        get_event_target:get_event_target,
        add_event:add_event,
        getProperties:getProperties,
        stripTrailingSlash:stripTrailingSlash,
        prepareParams:prepareParams,
        sendXmlHttpRequest:sendXmlHttpRequest,
        recordError:recordError,
        getMsTimestamp:getMsTimestamp,
        getTimestamp:getTimestamp,
        log:log,
        getMetrics:getMetrics,
        generateUUID:generateUUID,
        getId:getId,
        heartBeat:heartBeat,
        toRequestQueue:toRequestQueue,
        reportViewDuration:reportViewDuration,
        loadJS:loadJS,
        loadCSS:loadCSS,
        getLastView:getLastView,
        setToken:setToken,
        getToken:getToken,
        showLoader:showLoader,
        hideLoader:hideLoader,
        add_cly_events:add_cly_events,
        detect_device: detect_device
    };
}(window.Countly = window.Countly || {}));