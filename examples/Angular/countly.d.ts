declare module 'countly-sdk-web' {

  namespace Countly {
    /**
     * It initializes the SDK and exposes it to the window object. It should be called before any other SDK methods in sync implementations.
     *
     * @param {object} config - Configuration object. Determines the SDK behavior. Some essential keys are:
     *
     * app_key : "app key" from your Countly server application. (MANDATORY!)
     *
     * url : Your Countly server URL. You may also use your own server URL or IP here. (MANDATORY!)
     *
     * debug : Enables SDK logs to be printed into the browser console. (default: false)
     *
     * For the full list of configuration options, see https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript#h_01HABTQ439HZN7Y6A6F07Y6G0K
     */
    function init(config: object): void;
  }

  export default Countly;
}

interface Window {
  Countly: any;
}
