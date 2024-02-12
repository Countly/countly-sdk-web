# Countly Implementation Examples

This folder is filled with examples of Countly implementations to help you to get an idea
how to integrate Countly into your own personal project too.

For all projects you should change 'YOUR_APP_KEY' value with your own application's app key, 'https://your.server.ly' value with your own server url. 

If you have not separated 'examples' folder from the 'COUNTLY-SDK-WEB' project folder nor made some changes to file names in the periphery, any path to countly.js or the plugins must be still correct. 

But if you did make some changes you should check if the paths, like '../lib/countly.js', are correct or not inside the example files.

## Generating Examples

You can use the create_examples.py to generate example implementations of Countly Web SDK for React or Angular.
It also can create an example that can be used to demonstrate the symbolication for Web SDK.

To use the script:

```bash
python create_examples.py
# or python3 create_examples.py
```

It would ask for the example you want to create (react/angular/symbolication/all).
After it creates the example(s) you want, you will have to run the following command(s) to serve/run the example(s):

```bash
# For angular-example
cd angular-example
ng serve
```

```bash
# For react-example
cd react-example
npm start
```

```bash
# For symbolication-example
cd symbolication-example
npm run build
npm start
```
