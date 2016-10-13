#Countly Web SDK [![Build Status](https://api.travis-ci.org/Countly/countly-sdk-web.png)](https://travis-ci.org/Countly/countly-sdk-web) [![npm version](https://badge.fury.io/js/countly-sdk-web.svg)](https://badge.fury.io/js/countly-sdk-web) [![Bower version](https://badge.fury.io/bo/countly-sdk-web.svg)](https://badge.fury.io/bo/countly-sdk-web) [![Inline docs](http://inch-ci.org/github/Countly/countly-sdk-web.svg?branch=master)](http://inch-ci.org/github/Countly/countly-sdk-web)

##What's Countly?
[Countly](http://count.ly) is an innovative, real-time, open source mobile analytics application. 
It collects data from mobile devices, and visualizes this information to analyze mobile application 
usage and end-user behavior. There are two parts of Countly: the server that collects and analyzes data, 
and mobile SDK that sends this data. Both parts are open source with different licensing terms.

This repository includes the Countly Web SDK. For more information about this SDK, [Countly SDK for Web](http://resources.count.ly/v1.0/docs/countly-sdk-for-web) documentation at [Countly Resources](http://resources.count.ly).

* **Slack user?** [Join our community](http://slack.count.ly:3000/) to ask questions and get answers!
* **Questions?** [Ask in our Community forum](http://community.count.ly)

## Implementing Countly SDK in your web pages

There are 3 ways to get Countly SDK.

###1. Available with Countly server
Since Countly server 16.02, Countly Web SDK is available in your Countly server installation in `countly/frontend/express/public/sdk/web/countly.min.js` which should be available through URL as `http://yourserver.com/sdk/web/countly.min.js`

###2. Installation using package managers

    bower install countly-sdk-web
or

    npm install countly-sdk-web
    
###3. Use a CDN (content delivery network)

Countly web SDK is available on CDNJS. Use either

[https://cdnjs.cloudflare.com/ajax/libs/countly-sdk-web/16.2.0/countly.min.js](https://cdnjs.cloudflare.com/ajax/libs/countly-sdk-web/16.2.0/countly.min.js)

or

[https://cdn.jsdelivr.net/countly-sdk-web/latest/countly.min.js](https://cdn.jsdelivr.net/countly-sdk-web/latest/countly.min.js)

##How to use Countly Web SDK?

Link to the script and call helper methods based on what you want to track: sessions, views, clicks, custom events, user data, etc. More information is available at [http://resources.count.ly/docs/countly-sdk-for-web](http://resources.count.ly/docs/countly-sdk-for-web)

![Using Countly web SDK in your web page](https://github.com/Countly/countly-sdk-web/blob/master/docs/screenshot.png)

### Other Github resources ###

Check Countly Community Edition source code here: 

- [Countly Server](https://github.com/Countly/countly-server)

There are also other Countly SDK repositories below:

- [Countly iOS SDK](https://github.com/Countly/countly-sdk-ios)
- [Countly Android SDK](https://github.com/Countly/countly-sdk-android)
- [Countly Windows Phone SDK](https://github.com/Countly/countly-sdk-windows-phone)
- [Countly Appcelerator Titanium SDK](https://github.com/euforic/Titanium-Count.ly) (Community supported)
- [Countly Unity3D SDK](https://github.com/Countly/countly-sdk-unity) (Community supported)

###How can I help you with your efforts?

Glad you asked. We need ideas, feedbacks and constructive comments. All your suggestions will be taken care with upmost importance. We are on [Twitter](http://twitter.com/gocountly) and [Facebook](http://www.facebook.com/Countly) if you would like to keep up with our fast progress!

If you like Countly, why not use one of our badges and give a link back to us, so others know about this wonderful platform? 

![Light badge](https://count.ly/wp-content/uploads/2014/10/countly_badge_5.png)  ![Dark badge](https://count.ly/wp-content/uploads/2014/10/countly_badge_6.png)

### Support

For a public community support page, visit [http://community.count.ly](http://community.count.ly "Countly Community Forum").

[![NPM](https://nodei.co/npm/countly-sdk-web.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/countly-sdk-web/)

