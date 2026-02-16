import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

let reactotron;

if (__DEV__) {
  // Get machine IP for Android emulator/device connection
  const scriptURL = NativeModules.SourceCode.scriptURL;
  const scriptHostname = scriptURL.split('://')[1].split(':')[0];

  reactotron = Reactotron.configure({
    name: 'SS-Infra Mobile',
    host: scriptHostname,
  })
    .useReactNative({
      asyncStorage: false, // there are some issues with async storage + reactotron sometimes
      networking: {
        ignoreUrls: /symbolicate/,
      },
      editor: false, 
      errors: { veto: (stackFrame) => false }, // let everything through
      overlay: false, 
    })
    .use(reactotronRedux())
    .connect();
    
    // Clear logs on start
    Reactotron.clear?.();
}

export default reactotron;
