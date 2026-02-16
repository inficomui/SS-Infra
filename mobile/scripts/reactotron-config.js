import { NativeModules } from 'react-native';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';

/**
 * Enhanced Reactotron Configuration
 * Designed for reusability across React Native projects.
 * 
 * @param config - Optional configuration object
 * @param config.name - Name of the application (default: 'React Native App')
 * @param config.host - Custom host IP (default: auto-detected for Android/iOS)
 * @param config.plugins - Array of additional Reactotron plugins
 */
const configureReactotron = (config = {}) => {
    // Only run in development mode to avoid overhead in production
    if (!__DEV__) {
        return {
            createEnhancer: undefined,
            log: () => { },
            display: () => { },
        };
    }

    const {
        name = 'React Native App',
        host,
        plugins = [],
    } = config;

    // Auto-detect host machine IP for Android emulator connection
    let scriptHostname = 'localhost';
    try {
        const { scriptURL } = NativeModules.SourceCode;
        scriptHostname = scriptURL.split('://')[1].split(':')[0];
    } catch (e) {
        console.log('Reactotron: Could not determine host, falling back to localhost');
    }

    // Initialize Reactotron
    const reactotron = Reactotron.configure({
        name: name,
        host: host || scriptHostname,
    })
        .useReactNative({
            asyncStorage: false, // Disable async storage tracking by default to prevent issues
            networking: {
                ignoreUrls: /symbolicate/, // Ignore metro bundler symbolication requests
            },
            editor: false,
            errors: { veto: (stackFrame) => false }, // Log all errors
            overlay: false,
        })
        .use(reactotronRedux()); // Add Redux plugin

    // Add custom plugins if provided
    plugins.forEach(plugin => reactotron.use(plugin));

    // Connect to the desktop app
    reactotron.connect();

    // Clear logs on startup for a fresh debugging session
    reactotron.clear();

    // Patch console.log to send logs to Reactotron (Optional, but recommended)
    const yeOldeConsoleLog = console.log;
    console.log = (...args) => {
        yeOldeConsoleLog(...args);
        Reactotron.display({
            name: 'CONSOLE',
            value: args,
            preview: args.length > 0 && typeof args[0] === 'string' ? args[0] : null,
        });
    };

    return reactotron;
};

export default configureReactotron;
