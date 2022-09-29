# Countly Web SDK
 [![Codacy Badge](https://app.codacy.com/project/badge/Grade/79582b7ee7ca4021a3950376402fac00)](https://www.codacy.com/gh/Countly/countly-sdk-web/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Countly/countly-sdk-web&amp;utm_campaign=Badge_Grade) [![npm version](https://badge.fury.io/js/countly-sdk-web.svg)](https://badge.fury.io/js/countly-sdk-web) [![](https://data.jsdelivr.com/v1/package/npm/countly-sdk-web/badge)](https://www.jsdelivr.com/package/npm/countly-sdk-web)

## What is Countly?
[Countly](http://count.ly) is a product analytics solution and innovation enabler that helps teams track product performance and customer journey and behavior across [mobile](https://count.ly/mobile-analytics), [web](http://count.ly/web-analytics), and [desktop](https://count.ly/desktop-analytics) applications. [Ensuring privacy by design](https://count.ly/your-data-your-rules), Countly allows you to innovate and enhance your products to provide personalized and customized customer experiences, and meet key business and revenue goals.

Track, measure, and take action - all without leaving Countly.

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
Countly web SDK is available on CDNJS:

[https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/lib/countly.min.js](https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/lib/countly.min.js)

## How to use Countly Web SDK?
Link to the script and call helper methods based on what you want to track: sessions, views, clicks, custom events, user data, etc. and for much more information check out our documentation at [https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-](https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-)

You can reach minimal integration info for your website from here [https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-#minimal-setup](https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-#minimal-setup)

Countly Web SDK has JSDoc3 compatible comments and you can generate documentation by running `npm run-script docs` or access online version at [https://countly.github.io/countly-sdk-web/](https://countly.github.io/countly-sdk-web/)

## Security
Security is very important to us. If you discover any issue regarding security, please disclose the information responsibly by sending an email to security@count.ly and **not by creating a GitHub issue**.

## Other Github resources
Check Countly Community Edition source code here:

* [Countly Server](https://github.com/Countly/countly-server)

There are also other Countly SDK repositories below:

* [Countly iOS SDK](https://github.com/Countly/countly-sdk-ios)
* [Countly Android SDK](https://github.com/Countly/countly-sdk-android)
* [Countly Windows Phone SDK](https://github.com/Countly/countly-sdk-windows-phone)
* [Countly Appcelerator Titanium SDK](https://github.com/euforic/Titanium-Count.ly) (Community supported)
* [Countly Unity3D SDK](https://github.com/Countly/countly-sdk-unity) (Community supported)

## How can I help you with your efforts?
Glad you asked. We need ideas, feedbacks and constructive comments. All your suggestions will be taken care with upmost importance. We are on [Twitter](http://twitter.com/gocountly) and [Facebook](https://www.facebook.com/Countly) if you would like to keep up with our fast progress!

## Badges
If you like Countly, [why not use one of our badges](https://count.ly/brand-assets) and give a link back to us, so others know about this wonderful platform?

<a href="https://count.ly/f/badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/dark.svg?v2" alt="Countly - Product Analytics" /></a>

    <a href="https://count.ly/f/badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/dark.svg" alt="Countly - Product Analytics" /></a>

<a href="https://count.ly/f/badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/light.svg?v2" alt="Countly - Product Analytics" /></a>

    <a href="https://count.ly/f/badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/light.svg" alt="Countly - Product Analytics" /></a>

## Support
For a public community support page, visit [https://support.count.ly/hc/en-us/community/topics](https://support.count.ly/hc/en-us/community/topics "Countly Community Forum").

[![NPM](https://nodei.co/npm/countly-sdk-web.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/countly-sdk-web/)
