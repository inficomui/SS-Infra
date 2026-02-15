const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// The root of the whole space (at 04-SS-Infra)
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Add the external folder to watchFolders
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to look for dependencies
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
];

// 3. Ensure we use the project's node_modules even for external code
// config.resolver.disableHierarchicalLookup = true;

module.exports = config;

