# Countly Web SDK Crash Test Sample App

This project has been created to generate crashes in sourcemapped files to
demonstrate Countly's ability to process stacktraces that occured on uglified
(minified, transpiled etc) Javascript files to point to the correct locations
on their original source files.

To build the main javascript file (which also produces a sourcemap file), run:

```
npm run build
```

You can observe that webpack packed our `src/index.js` file and our
`countly-web-sdk` dependency into a single file `dist/main.js`. It also
produced a sourcemap file `dist/main.js.map` which contains the contents of 
all the files it packed into `dist/main.js` along with information on how
original source files are mapped into their final form, so we can later tell
where an error occured on the original source files.

To symbolicate errors on Countly you need to navigate to `Improve > Errors >
Manage Symbols` on your Countly instance and upload your symbolmap there,
making sure the application version you enter there matches the application
version you pass to the Countly Web SDK in `src/index.js`.

Then you can navigate to `static/index.html` on your browser and click the
error buttons to fire off some errors and send them to your Countly instance.

Now, to symbolicate them, navigate to `Improve > Errors > Overview` and find
the error that goes something like `ReferenceError: undefined_function is not
defined` and click on it. Then click the Symbolicate button to symbolicate it
and see that the symbolicated stacktrace lines point to the correct positions
in the original source files.
