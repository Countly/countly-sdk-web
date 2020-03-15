"use strict";
/*global Countly */
/*
Countly APM based on Boomerang JS
*/
(function () {
    Countly = Countly || {}; // eslint-disable-line no-global-assign
    Countly.onload = Countly.onload || [];
    /**
     *  Enables tracking performance through boomerang.js
     *  @param {object} config - Boomerang js configuration
     */
    Countly.track_performance = function (config) {
        Countly.onload.push(function () {
            config = config || {};
            var initedBoomr = false;
            function initBoomerang(BOOMR){
                if (BOOMR && !initedBoomr) {
                    BOOMR.subscribe("before_beacon", function(beaconData) {
                        Countly._internals.log("BOOMR", "before_beacon", JSON.stringify(beaconData, null, 2));
                        var trace = {};
                        if (beaconData["rt.start"] !== "manual" && !beaconData["http.initiator"] && beaconData["rt.quit"] !== ""){
                            trace.type = "device";
                            trace.apm_metrics = {};
                            if (typeof beaconData["pt.fp"] !== "undefined") {
                                trace.apm_metrics.first_paint = beaconData["pt.fp"];
                            }
                            else if (typeof beaconData["nt_first_paint"] !== "undefined") {
                                trace.apm_metrics.first_paint = beaconData["nt_first_paint"] - beaconData["rt.tstart"];
                            }
                            if (typeof beaconData["pt.fcp"] !== "undefined") {
                                trace.apm_metrics.first_contentful_paint = beaconData["pt.fcp"];
                            }
                            if (typeof beaconData["nt_domint"] !== "undefined") {
                                trace.apm_metrics.dom_interactive = beaconData["nt_domint"] - beaconData["rt.tstart"];
                            }
                            if (typeof beaconData["nt_domcontloaded_st"] !== "undefined" && typeof beaconData["nt_domcontloaded_end"] !== "undefined") {
                                trace.apm_metrics.dom_content_loaded_event_end = beaconData["nt_domcontloaded_end"] - beaconData["nt_domcontloaded_st"];
                            }
                            if (typeof beaconData["nt_load_st"] !== "undefined" && typeof beaconData["nt_load_end"] !== "undefined") {
                                trace.apm_metrics.load_event_end = beaconData["nt_load_end"] - beaconData["nt_load_st"];
                            }
                            if (typeof beaconData["c.fid"] !== "undefined") {
                                trace.apm_metrics.first_input_delay = beaconData["c.fid"];
                            }
                        }
                        else if (beaconData["http.initiator"] && ["xhr", "spa", "spa_hard"].indexOf(beaconData["http.initiator"]) !== -1) {
                            var headers = beaconData["http.hdr"] || {};
                            trace.type = "network";
                            trace.apm_metrics = {
                                response_time: beaconData.t_done,
                                response_payload_size: beaconData["nt_dec_size"],
                                request_payload_size: headers["Content-Size"],
                                response_code: (typeof beaconData["http.errno"] !== "undefined") ? beaconData["http.errno"] : 200
                            };
                        }
                        else if (beaconData["http.initiator"] === "interaction") {
                            trace.apm_metrics = {};
                            var hasData = false;
                            if (typeof beaconData["c.f.l"] !== "undefined") {
                                trace.apm_metrics.slow_rendering_frames = beaconData["c.f.l"];
                                hasData = true;
                            }
                            if (typeof beaconData["c.b"] !== "undefined") {
                                trace.apm_metrics.frozen_frames = beaconData["c.b"];
                                hasData = true;
                            }
                            if (hasData) {
                                trace.type = "device";
                            }
                        }
                        if (trace.type) {
                            trace.name = (beaconData.u + "").split("//").pop().split("?")[0];
                            trace.stz = beaconData["rt.tstart"];
                            trace.etz = beaconData["rt.end"];
                            Countly.report_trace(trace);
                        }
                    });
                    BOOMR.xhr_excludes = BOOMR.xhr_excludes || {};
                    BOOMR.xhr_excludes[Countly.url.split("//").pop()] = true;
                    //config.beacon_url = config.beacon_url || Countly.url;
                    if (typeof config.beacon_disable_sendbeacon === "undefined") {
                        config.beacon_disable_sendbeacon = true;
                    }
                    BOOMR.init(config);
                    BOOMR.t_end = new Date().getTime();
                    Countly.BOOMR = BOOMR;
                    initedBoomr = true;
                    Countly._internals.log("Boomerang initiated:", config);
                }
                else {
                    Countly._internals.log("Boomerang called without its instance or was already initialized");
                }
            }
            if (window.BOOMR) {
                initBoomerang(window.BOOMR);
            }
            else {
                Countly._internals.log("Boomerang not yet loaded, waiting for it to load");
                // Modern browsers
                if (document.addEventListener) {
                    document.addEventListener("onBoomerangLoaded", function(e) {
                        initBoomerang(e.detail.BOOMR);
                    });
                }
                // IE 6, 7, 8 we use onPropertyChange and look for propertyName === "onBoomerangLoaded"
                else if (document.attachEvent) {
                    document.attachEvent("onpropertychange", function(e) {
                        if (!e) {e = event;}
                        if (e.propertyName === "onBoomerangLoaded") {
                            initBoomerang(e.detail.BOOMR);
                        }
                    });
                }
            }
        });
    };
}());