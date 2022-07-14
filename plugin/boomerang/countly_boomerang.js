"use strict";

/* global Countly */
/*
Countly APM based on Boomerang JS
Plugin being used - RT, AutoXHR, Continuity, NavigationTiming, ResourceTiming
*/
(function cly_load_track_performance() {
    Countly = Countly || {}; // eslint-disable-line no-global-assign
    Countly.onload = Countly.onload || [];
    if (typeof Countly.CountlyClass === "undefined") {
        return Countly.onload.push(function() {
            cly_load_track_performance();
            if (!Countly.track_performance) {
                Countly.track_performance = Countly.i[Countly.app_key].track_performance;
            }
        });
    }
    // the Boomerang version that this script was designed to work with
    var designedBoomVersion = "1.737.0";
    /**
     *  Enables tracking performance through boomerang.js
     *  @memberof Countly
     *  @param {object} config - Boomerang js configuration
     */
    Countly.CountlyClass.prototype.track_performance = function(config) {
        var self = this;
        config = config || {};
        var initedBoomr = false;
        /**
         *  Initialize Boomerang
         *  @param {Object} BOOMR - Boomerang object
         */
        function initBoomerang(BOOMR) {
            if (BOOMR && !initedBoomr) {
                BOOMR.subscribe("before_beacon", function(beaconData) {
                    if (designedBoomVersion !== Countly.expectedBoomVersion) {
                        self._internals.log("[WARNING]", "Boomerang, The boomerang version is different than expected, some features might not work. For best performance please use the version:[" + designedBoomVersion + "]");
                    }
                    self._internals.log("[INFO]", "Boomerang, before_beacon:", JSON.stringify(beaconData, null, 2));
                    var trace = {};
                    if (beaconData["rt.start"] !== "manual" && !beaconData["http.initiator"] && beaconData["rt.quit"] !== "") {
                        trace.type = "device";
                        trace.apm_metrics = {};
                        if (typeof beaconData["pt.fp"] !== "undefined") {
                            trace.apm_metrics.first_paint = beaconData["pt.fp"];
                        }
                        else if (typeof beaconData.nt_first_paint !== "undefined") {
                            trace.apm_metrics.first_paint = beaconData.nt_first_paint - beaconData["rt.tstart"];
                        }
                        if (typeof beaconData["pt.fcp"] !== "undefined") {
                            trace.apm_metrics.first_contentful_paint = beaconData["pt.fcp"];
                        }
                        if (typeof beaconData.nt_domint !== "undefined") {
                            trace.apm_metrics.dom_interactive = beaconData.nt_domint - beaconData["rt.tstart"];
                        }
                        if (typeof beaconData.nt_domcontloaded_st !== "undefined" && typeof beaconData.nt_domcontloaded_end !== "undefined") {
                            trace.apm_metrics.dom_content_loaded_event_end = beaconData.nt_domcontloaded_end - beaconData.nt_domcontloaded_st;
                        }
                        if (typeof beaconData.nt_load_st !== "undefined" && typeof beaconData.nt_load_end !== "undefined") {
                            trace.apm_metrics.load_event_end = beaconData.nt_load_end - beaconData.nt_load_st;
                        }
                        if (typeof beaconData["c.fid"] !== "undefined") {
                            trace.apm_metrics.first_input_delay = beaconData["c.fid"];
                        }
                    }
                    else if (beaconData["http.initiator"] && ["xhr", "spa", "spa_hard"].indexOf(beaconData["http.initiator"]) !== -1) {
                        var responseTime; var responsePayloadSize; var requestPayloadSize; var
                            responseCode;
                        responseTime = beaconData.t_resp;
                        // t_resp - Time taken from the user initiating the request to the first byte of the response. - Added by RT
                        responseCode = (typeof beaconData["http.errno"] !== "undefined") ? beaconData["http.errno"] : 200;

                        try {
                            var restiming = JSON.parse(beaconData.restiming);
                            var ResourceTimingDecompression = window.ResourceTimingDecompression;
                            if (ResourceTimingDecompression && restiming) {
                                // restiming contains information regarging all the resources that are loaded in any
                                // spa, spa_hard or xhr requests.
                                // xhr requests should ideally have only one entry in the array which is the one for
                                // which the beacon is being sent.
                                // But for spa_hard requests it can contain multiple entries, one for each resource
                                // that is loaded in the application. Example - all images, scripts etc.
                                // ResourceTimingDecompression is not included in the official boomerang library.
                                ResourceTimingDecompression.HOSTNAMES_REVERSED = false;
                                var decompressedData = ResourceTimingDecompression.decompressResources(restiming);
                                var currentBeacon = decompressedData.filter(function(resource) {
                                    return resource.name === beaconData.u;
                                });

                                if (currentBeacon.length) {
                                    responsePayloadSize = currentBeacon[0].decodedBodySize;
                                    responseTime = currentBeacon[0].duration ? currentBeacon[0].duration : responseTime;
                                    // duration - Returns the difference between the resource's responseEnd timestamp and its startTime timestamp - ResourceTiming API
                                }
                            }
                        }
                        catch (e) {
                            self._internals.log("[ERROR]", "Boomerang, Error while using resource timing data decompression", config);
                        }

                        trace.type = "network";
                        trace.apm_metrics = {
                            response_time: responseTime,
                            response_payload_size: responsePayloadSize,
                            request_payload_size: requestPayloadSize,
                            response_code: responseCode
                        };
                    }

                    if (trace.type) {
                        trace.name = (beaconData.u + "").split("//").pop().split("?")[0];
                        trace.stz = beaconData["rt.tstart"];
                        trace.etz = beaconData["rt.end"];
                        self.report_trace(trace);
                    }
                });

                BOOMR.xhr_excludes = BOOMR.xhr_excludes || {};
                BOOMR.xhr_excludes[self.url.split("//").pop()] = true;
                if (typeof config.beacon_disable_sendbeacon === "undefined") {
                    config.beacon_disable_sendbeacon = true;
                }
                BOOMR.init(config);
                BOOMR.t_end = new Date().getTime();
                Countly.BOOMR = BOOMR;
                initedBoomr = true;
                self._internals.log("[INFO]", "Boomerang initiated:", config);
            }
            else {
                self._internals.log("[WARNING]", "Boomerang called without its instance or was already initialized");
            }
        }
        if (window.BOOMR) {
            initBoomerang(window.BOOMR);
        }
        else {
            self._internals.log("[WARNING]", "Boomerang not yet loaded, waiting for it to load");
            // Modern browsers
            if (document.addEventListener) {
                document.addEventListener("onBoomerangLoaded", function(e) {
                    initBoomerang(e.detail.BOOMR);
                });
            }
            // IE 6, 7, 8 we use onPropertyChange and look for propertyName === "onBoomerangLoaded"
            else if (document.attachEvent) {
                document.attachEvent("onpropertychange", function(e) {
                    if (!e) {
                        e = event;
                    }
                    if (e.propertyName === "onBoomerangLoaded") {
                        initBoomerang(e.detail.BOOMR);
                    }
                });
            }
        }
    };
}());