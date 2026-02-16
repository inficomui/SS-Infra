import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import { NativeModules } from 'react-native';

/**
 * Configure Reactotron for React Native projects.
 * Supports automatic host detection for Android emulators/devices.
 * 
 * @param {string} appName - The name of the application to display in Reactotron
 * @param {boolean} useRedux - Whether to use the Redux plugin (default: true)
 * @returns {typeof Reactotron} The configured Reactotron instance
 */
const configureReactotron = (appName = 'React Native App', useRedux = true) => {
  let reactotron = Reactotron;

  if (__DEV__) {
    // Get machine IP for Android emulator/device connection
    // This is crucial for Android devices to connect to the host machine
    const scriptURL = NativeModules.SourceCode.scriptURL;
    const scriptHostname = scriptURL.split('://')[1].split(':')[0];

    const config = {
      name: appName,
      host: scriptHostname,
    };

    reactotron = Reactotron.configure(config)
      .useReactNative({
        asyncStorage: false, // Async storage can be noisy, enable if needed
        networking: {
          ignoreUrls: /symbolicate/, // Ignore metro symbolicate requests
        },
        editor: false, 
        errors: { veto: (stackFrame) => false }, // let everything through
        overlay: false, 
      });

    if (useRedux) {
      reactotron.use(reactotronRedux());
    }

    reactotron.connect();
    
    // Clear logs on start
    Reactotron.clear?.();
    
    console.log('Reactotron Configured:', appName);
  }

  return reactotron;
};

export default configureReactotron;
