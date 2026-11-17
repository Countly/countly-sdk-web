# ngx-countly workspace

[Countly](https://countly.com) for Angular. The library is in [`projects/ngx-countly`](projects/ngx-countly) (its README is the package's documentation); [`projects/demo`](projects/demo) is a small app using it.

| | |
|---|---|
| `npm run build:lib` | build the library into `dist/ngx-countly` |
| `npm run test:ci` | run its tests once in headless Chrome (`ng test ngx-countly` to watch) |
| `npx ng serve demo` | the demo, after `build:lib` (it imports the built package) |
| `cd dist/ngx-countly && npm publish` | publish |

The workspace stays on the oldest supported Angular (17): ng-packagr's partial compilation output is linked by the app's own Angular, so one build works from 17 up. CI builds it into a fresh app on the latest Angular to keep that promise honest.
