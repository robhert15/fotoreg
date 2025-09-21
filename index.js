// index.js
// Must be at the very top to properly initialize gesture handler
import 'react-native-gesture-handler';
// Reanimated should also be imported at the entry point
import 'react-native-reanimated';

import { registerRootComponent } from 'expo';
import App from './src/App.tsx';

registerRootComponent(App);