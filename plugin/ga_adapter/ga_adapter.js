/*
Countly Adapter Library for Google Analytics
*/
(function() {
	window.cly_ga_test_logs = [];
	window.CountlyGAAdapter = function() {
		// hold ga instance
		var old_ga = window.ga;
		// cart for ga:ecommerce plugin
		var cart = Countly._internals.store('cly_ecommerce:cart') || [];

		window.ga = function(c, o, u, n, t, l, y) {
			if (typeof c === "string") {
				switch (c) {
					case 'send':
						if (typeof o === 'string') {
							// ga('send', 'event', ..)
							if (o === 'event') {
								var customSegments = {};
								var count = 1;
								// ga('send', 'event', 'category', 'action')
								if (arguments.length === 4) {
									customSegments["category"] = u;
								}
								// ga('send', 'event', 'category', 'action', 'label')
								else if (arguments.length === 5 && typeof arguments[4] === "string") {
									customSegments["category"] = u;
									customSegments["label"]	= t;
								}
								// ga('send', 'event', 'category', 'action', {metric:value})
								else if (arguments.length === 5 && typeof arguments[4] === "object") {
									customSegments["category"] = u;
									for (var i = 0; i < Object.keys(arguments[4]).length; i++) {
										customSegments[Object.keys(arguments[4])[i]] = Object.values(arguments[4])[i];	
									}
								}
								// ga('send', 'event', 'category', 'action', 'label', 1)
								else if (arguments.length >= 6) {
									customSegments["category"] = u;
									customSegments["label"]	= t;
									count = l;
								}
								// add event by configured values
								Countly.q.push(['add_event',{
									key:n, 
									count:count,
									segmentation: customSegments
								}]);
								if (window.cly_ga_test_mode) { 
									window.cly_ga_test_logs.push(['add_event',{ key:n, count:count, segmentation: customSegments}]);
								}
							}
							// ga('send', 'pageview')
							else if (o === 'pageview' && arguments.length === 2) {
								if (Countly._internals.store('cly_ga:page')) {
									Countly.q.push(['track_pageview', Countly._internals.store('cly_ga:page')]);
									if (window.cly_ga_test_mode) window.cly_ga_test_logs.push(['track_pageview', Countly._internals.store('cly_ga:page')]);	
								} 
								else {
									Countly.q.push(['track_pageview']);
									if (window.cly_ga_test_mode) window.cly_ga_test_logs.push(['track_pageview']);
								} 
							} 
							// ga('send', 'pageview', 'page')
							else if (o === 'pageview' && arguments.length >= 3 && typeof arguments[2] === "string") {
								Countly.q.push(['track_pageview', arguments[2]]);	
								if (window.cly_ga_test_mode) window.cly_ga_test_logs.push(['track_pageview', arguments[2]]);
							}
							// ga('send', 'pageview', {'customDimension':'customValue'})
							else if (o === 'pageview' && arguments.length >= 3 && typeof arguments[2] === "object") {
								// we are not supported tracking pageview with custom objects for now
								Countly.q.push(['track_pageview']);	
								if (window.cly_ga_test_mode) window.cly_ga_test_logs.push(['track_pageview']);
							}
							// ga('send', 'social', 'network', 'action', 'target')
							else if (o === 'social') {
								Countly.q.push(['add_event', { 
								   "key":n, 
								   "count":1, 
								   "segmentation":{
								      "category":o,
								      "platform":u,
								      "target":t
								   }
								}]);
								if (window.cly_ga_test_mode) {
									window.cly_ga_test_logs.push(['add_event', { "key":n, "count":1, "segmentation":{"category":o,"platform":u,"target":t}}]);
								}
							}
							// ga('send', 'screenview', {..})
							else if (o === 'screenview') {
								var customSegments = { appName: u.appName };
								
								if (u.screenName) customSegments.screenName = u.screenName;
								if (u.appVersion) customSegments.appVersion = u.appVersion;
								if (u.appInstallerId) customSegments.appInstallerId = u.appInstallerId;
								if (Countly._internals.store('cly_ga:screenname')) customSegments.screenName = Countly._internals.store('cly_ga:screenname');

								Countly.q.push(['add_event', { 
								   "key":"Screen View",
								   "count":1, 
								   "segmentation": customSegments
								}]);

								if (window.cly_ga_test_mode) {
									window.cly_ga_test_logs.push(['add_event', { "key":"Screen View", "count":1, "segmentation": customSegments}]);
								}
							}
							// ga('send', 'exception', {..})
							else if (o === 'exception') {
								Countly.log_error(u.exDescription);
								if (window.cly_ga_test_mode) window.cly_ga_test_logs.push(u.exDescription);
							}
							// ga('send', 'timing', 'timingCategory', 'timingVar', 'timingValue', 'timingLabel')
							else if (o === 'timing') {
								var customSegments = {category:u};
								if (l) customSegments.label = l;
								Countly.q.push(['add_event', { 
								   "key": n, 
								   "count": 1,
								   "dur": t, 
								   "segmentation": customSegments
								}]);
								if (window.cly_ga_test_mode) {
									window.cly_ga_test_logs.push(['add_event', { "key": n, "count": 1, "dur": t, "segmentation": customSegments}]);
								}
							}
						} 
						// ga('send', {hitType:.., ...})
						else if (typeof o === 'object') {
							switch (o.hitType) {
								// ga('send', {'hitType':'event', ..})
								case 'event':
									var customSegments = {
										'category': o.eventCategory
									}
									var count = 1;

									if (o.eventLabel) customSegments["label"] = o.eventLabel;
									if (o.eventValue) count = o.eventValue;

									Countly.q.push(['add_event',{
										key: o.eventAction, 
										count: count,
										segmentation: customSegments
									}]);

									if (window.cly_ga_test_mode) {
										window.cly_ga_test_logs.push(['add_event',{key: o.eventAction, count: count, segmentation: customSegments}]);
									}

									break;
								// ga('send', {'hitType':'social', ..})	
								case 'social':
									Countly.q.push(['add_event', { 
									   "key":o.socialAction, 
									   "count":1, 
									   "segmentation":{
									      "category":o.hitType,
									      "platform":o.socialNetwork,
									      "target":o.socialTarget
									   }
									}]);

									if (window.cly_ga_test_mode) {
										window.cly_ga_test_logs.push(['add_event', { "key":o.socialAction, "count":1, "segmentation":{"category":o.hitType,"platform":o.socialNetwork,"target":o.socialTarget}}]);
									}

									break;
								// ga('send', {'hitType':'timing', ..})	
								case 'timing':
									Countly.q.push(['add_event', { 
									   "key": o.timingVar, 
									   "count": 1,
									   "dur": o.timingValue, 
									   "segmentation": {
									      "category": o.timingCategory
									   }
									}]);

									if (window.cly_ga_test_mode) {
										window.cly_ga_test_logs.push(['add_event', { "key": o.timingVar, "count": 1, "dur": o.timingValue, "segmentation": {"category": o.timingCategory}}]);
									}
									break;
								// ga('send', {'hitType':'pageview', 'page':'page'})
								case 'pageview':
									Countly.q.push(['track_pageview', o.page]);
									if (window.cly_ga_test_mode) {
										window.cly_ga_test_logs.push(['track_pageview', o.page]);
									}
									break;
							}
						}
						break;
					// ga('create', '..')
					case 'create':
						// ga('create', .., 'auto', '..')
						if (arguments.length === 4 && arguments[2] === 'auto') {
							Countly._internals.store('cly_ga:id', o);
							if (window.cly_ga_test_mode) {
								window.cly_ga_test_logs.push({'stored':Countly._internals.store('cly_ga:id'), 'value':o});
							}
						// ga('create', .., callback)
						} else if (arguments.length === 3) {
							Countly._internals.store('cly_ga:id', o);
							if (window.cly_ga_test_mode) {
								window.cly_ga_test_logs.push({'stored':Countly._internals.store('cly_ga:id'), 'value':o});
							}
						}
						break;
					// ga('set', '..')	
					case 'set':
						// ga('set', 'page', '/login.html')
						if (o === 'page') {
							Countly._internals.store('cly_ga:page', u);
						}
						// ga('set', 'screenname', 'High scores')
						else if (o === 'screenname') {
							Countly._internals.store('cly_ga:screenname', u);
							if (window.cly_ga_test_mode) {
								window.cly_ga_test_logs.push({'stored':Countly._internals.store('cly_ga:screenname'),'value':u});
							}
						}
						// ga('set', 'dimension', 'custom data')
						else if (arguments.length === 3) {
							Countly.q.push(['userData.set', o, u]);
							if (window.cly_ga_test_mode) {
								window.cly_ga_test_logs.push(['userData.set', o, u]);
							}
						} 
						// ga('set', {key:val, anotherKey: anotherVal})
						else if (arguments.length === 2 && typeof o === 'object') {
							Countly.q.push(['user_details', { custom: o }]);
							if (window.cly_ga_test_mode) {
								window.cly_ga_test_logs.push(['user_details', { custom: o }]);
							}
						}
						break;
					// ga('ecommerce:addTransaction', {..})	
					case 'ecommerce:addTransaction':
						var customSegments = {
							"id": o.id,
							"affiliation": o.affiliation,
							"shipping": o.shipping,
							"tax": o.tax
						}
						
						if (o.currency) customSegments["currency"] = o.currency;
						
						Countly.q.push(['add_event', { 
						   "key": c, 
						   "count":1, 
						   "sum":o.revenue,
						   "segmentation": customSegments
						}]);

						if (window.cly_ga_test_mode) {
							window.cly_ga_test_logs.push(['add_event', { "key": c, "count":1, "sum":o.revenue,"segmentation": customSegments}]);
						}

						break;
					// ga('ecommerce:addItem', {..})
					case 'ecommerce:addItem':
						var customSegments = {
							"id":o.id,
							"name":o.name,
							"sku":o.sku,
							"category":o.category
						};

						if (o.currency) customSegments["currency"] = o.currency;

						cart.push(['add_event', { 
						   "key":c, 
						   "count":o.quantity,
						   "sum":o.price,
						   "segmentation": customSegments
						}]);

						Countly._internals.store('cly_ecommerce:cart', cart);

						if (window.cly_ga_test_mode){
							window.cly_ga_test_logs.push(['add_event', { "key":c, "count":o.quantity,"sum":o.price,"segmentation": customSegments}]);
						}

						break;
					// ga('ecommerce:send')
					case 'ecommerce:send':
						if (window.cly_ga_test_mode) {
							var firstLength = cart.length;
						}
						for (var i = 0; i < cart.length; i++) {
							Countly.q.push(cart[i]);
						}
						cart = [];
						Countly._internals.store('cly_ecommerce:cart', cart);

						if (window.cly_ga_test_mode){
							window.cly_ga_test_logs.push({first:firstLength, last: cart.length});
						}
						break;
					// ga('ecommerce:clear')	
					case 'ecommerce:clear':
						cart = [];
						Countly._internals.store('cly_ecommerce:cart', cart);

						if (window.cly_ga_test_mode){
							window.cly_ga_test_logs.push(Countly._internals.store('cly_ecommerce:cart'));							
						}
						break;
					default:
						break;
				}	
			}
			// time to work for real ga instance
			return old_ga.apply(null, arguments);
		}
		// check variable for gaAdapter is loaded?
		window.ga._signature = 1;
	}
	setTimeout(function check() {
		if(!ga._signature) return CountlyGAAdapter();
		else {
			if (window['ga-disable-'+ Countly._internals.store('cly_ga:id')]) Countly.ignore_visitor = true;
		}
		setTimeout(check, 125);
	}, 125);
})();