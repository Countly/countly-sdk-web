# Countly Web SDK 
[![Build Status](https://api.travis-ci.org/Countly/countly-sdk-web.png)](https://travis-ci.org/Countly/countly-sdk-web) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/031d2021b8334af3ac8d2462500bd1aa)](https://www.codacy.com/app/ar2rsawseen/countly-sdk-web?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Countly/countly-sdk-web&amp;utm_campaign=Badge_Grade) [![npm version](https://badge.fury.io/js/countly-sdk-web.svg)](https://badge.fury.io/js/countly-sdk-web) [![Inline docs](https://inch-ci.org/github/Countly/countly-sdk-web.svg?branch=master)](https://inch-ci.org/github/Countly/countly-sdk-web) [![](https://data.jsdelivr.com/v1/package/npm/countly-sdk-web/badge)](https://www.jsdelivr.com/package/npm/countly-sdk-web)

## What's Countly?
[Countly](https://count.ly) is an innovative, real-time, open source mobile & [web analytics](https://count.ly/web-analytics), [rich push notifications](https://count.ly/push-notifications) and [crash reporting](https://count.ly/crash-reports) platform powering more than 2500 web sites and 14000 mobile applications as of 2017 Q3. It collects data from mobile phones, tablets, Apple Watch and other internet-connected devices, and visualizes this information to analyze application usage and end-user behavior. 

With the help of [Web SDK](https://github.com/countly/countly-sdk-web), Countly is a web analytics platform with features on par with mobile SDKs. For more information about web analytics capabilities, [see this link](https://count.ly/web-analytics).

There are two parts of Countly: the server that collects and analyzes data, and an SDK (mobile, web or desktop) that sends this data. This repository includes Countly Community Edition (server side). For more information other versions (e.g Enterprise Edition), see [comparison of different Countly editions](https://count.ly/compare)

This repository includes the Countly Web SDK. For more information about this SDK, [Countly SDK for Web](https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-) integration guide at [Countly Resources](https://support.count.ly/hc/en-us) or [Countly Web SDK Documentation](https://countly.github.io/countly-sdk-web/)

* **Slack user?** [Join our community](https://slack.count.ly) to ask questions and get answers!
* **Questions?** [Ask in our Community forum](https://support.count.ly/hc/en-us/community/topics)

## Implementing Countly SDK in your web pages

There are 3 ways to get Countly SDK.

### 1. Available with Countly server
Since Countly server 16.02, Countly Web SDK is available in your Countly server installation in `countly/frontend/express/public/sdk/web/countly.min.js` which should be available through URL as `https://yourserver.com/sdk/web/countly.min.js`

### 2. Installation using package managers

    bower install countly-sdk-web
or

    npm install countly-sdk-web
or

    yarn add countly-sdk-web
    
### 3. Use a CDN (content delivery network)

Countly web SDK is available on CDNJS. Use either

[https://cdnjs.cloudflare.com/ajax/libs/countly-sdk-web/20.11.0/countly.min.js](https://cdnjs.cloudflare.com/ajax/libs/countly-sdk-web/20.4.0/countly.min.js)

or

[https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/lib/countly.min.js](https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/lib/countly.min.js)

## How to use Countly Web SDK?

Link to the script and call helper methods based on what you want to track: sessions, views, clicks, custom events, user data, etc. More information is available at [https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-](https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-)

![Using Countly web SDK in your web page](https://count.ly/github/countly-web-sdk.png)

Countly Web SDK has JSDoc3 compatible comments and you can generate documentation by running `npm run-script docs` or access online version at [https://countly.github.io/countly-sdk-web/](https://countly.github.io/countly-sdk-web/)

## Security

Security is very important to us. If you discover any issue regarding security, please disclose the information responsibly by sending an email to security@count.ly and **not by creating a GitHub issue**.

## Other Github resources

Check Countly Community Edition source code here: 

- [Countly Server](https://github.com/Countly/countly-server)

There are also other Countly SDK repositories below:

- [Countly iOS SDK](https://github.com/Countly/countly-sdk-ios)
- [Countly Android SDK](https://github.com/Countly/countly-sdk-android)
- [Countly Windows Phone SDK](https://github.com/Countly/countly-sdk-windows-phone)
- [Countly Appcelerator Titanium SDK](https://github.com/euforic/Titanium-Count.ly) (Community supported)
- [Countly Unity3D SDK](https://github.com/Countly/countly-sdk-unity) (Community supported)

## How can I help you with your efforts?

Glad you asked. We need ideas, feedbacks and constructive comments. All your suggestions will be taken care with upmost importance. We are on [Twitter](http://twitter.com/gocountly) and [Facebook](https://www.facebook.com/Countly) if you would like to keep up with our fast progress!

## Badges

If you like Countly, [why not use one of our badges](https://count.ly/brand-assets) and give a link back to us, so others know about this wonderful platform? 

<a href="https://count.ly/f/badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/dark.svg" alt="Countly - Product Analytics" /></a>

    <a href="https://count.ly/f/badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/dark.svg" alt="Countly - Product Analytics" /></a>

<a href="https://count.ly/f/badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/light.svg" alt="Countly - Product Analytics" /></a>

    <a href="https://count.ly/f/badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/light.svg" alt="Countly - Product Analytics" /></a>

## Support

For a public community support page, visit [https://support.count.ly/hc/en-us/community/topics](https://support.count.ly/hc/en-us/community/topics "Countly Community Forum").

[![NPM](https://nodei.co/npm/countly-sdk-web.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/countly-sdk-web/)

