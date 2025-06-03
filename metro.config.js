const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);

const stubPath = path.resolve(
  __dirname,
  'node_modules/react-native-web-maps'
);

config.resolver.alias = {
  ...(config.resolver.alias || {}),
  'react-native-maps':           stubPath,
  'react-native-maps/lib':       stubPath,        
  'react-native-maps/lib/':      stubPath          
};

module.exports = config;
