const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for NativeWind
config.resolver.sourceExts.push('css');

module.exports = config; 