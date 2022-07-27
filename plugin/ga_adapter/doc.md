# Countly Google Analytics Adapter

## What's Countly Google Analytics Adapter?
Countly Google Analytics Adapter is a migration tool for your web apps which has already implemented Google Analytics trackers, you can easily send your analytics data to your Countly instance too without any extra integration.

## Implementing Countly Google Analytics Adapter in your web pages
There are only two step for integration.

### 1. Add Countly Web SDK integration snippet into your web page

```js
<script type='text/javascript'>
  
// Some default pre init
var Countly = Countly || {};
Countly.q = Countly.q || [];
Countly.onload = Countly.onload || [];

// Provide your app key that you retrieved from Countly dashboard
Countly.app_key = "YOUR_APP_KEY";

// Provide your server IP or name. Use try.count.ly or us-try.count.ly 
// or asia-try.count.ly for EE trial server.
// If you use your own server, make sure you have https enabled if you use
// https below.
Countly.url = "https://yourdomain.com"; 

// Start pushing function calls to queue
// Track sessions automatically (recommended)
Countly.q.push(['track_sessions']);
  
//track web page views automatically (recommended)
Countly.q.push(['track_pageview']);
  
// Uncomment the following line to track web heatmaps (Enterprise Edition)
// Countly.q.push(['track_clicks']);

// Uncomment the following line to track web scrollmaps (Enterprise Edition)
// Countly.q.push(['track_scrolls']);
  
// Load Countly script asynchronously
(function() {
 var cly = document.createElement('script'); cly.type = 'text/javascript'; 
 cly.async = true;
 // Enter url of script here (see below for other option)
 cly.src = 'https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/lib/countly.min.js';
 cly.onload = function(){Countly.init()};
 var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(cly, s);
})();
</script>
```

### 2. Declare your plugin's script after integrating Countly

```js
<script src="../plugin/ga_adapter/ga_adapter.js"></script>
```

### 3. Change your Google Analytics integration code like below

```js
<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// add this line into your google analytics snippet
CountlyGAAdapter();

ga('create', 'UA-56295140-3', 'auto');
ga('send','event','category','action','label');
ga('send','pageview','page.html');

</script>
```

That's all. Now you can track your app from your Countly instance too. You can check examples folder for an implementation example.
