# Campus Mobile App

A React Native mobile application for the Campus marketplace platform, built with Expo.

## 📱 Overview

Campus Mobile is the mobile companion to the Campus web platform, providing students with a seamless marketplace experience for buying, selling, and connecting within their university community.

## 🚀 Features

### Core Features
- **Authentication**: JWT-based login/register with email verification
- **Marketplace**: Browse and search listings across multiple categories
- **Real-time Messaging**: Chat with other users via WebSocket
- **User Profiles**: View and edit profiles with social media links
- **Image Uploads**: Upload images for listings and profile pictures
- **Saved Listings**: Bookmark and manage favorite listings

### Categories
- 📚 **Books**: Textbooks and course materials
- 🏠 **Sublets**: Short-term housing rentals
- 👥 **Roommates**: Find roommates and housing partners
- 🚗 **Rideshare**: Carpool and transportation
- 🎉 **Events**: Campus events and activities

## 🛠 Tech Stack

### Frontend
- **React Native** 0.73+ with Expo SDK 50
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS for React Native)
- **React Navigation** for routing and navigation
- **React Hook Form** + **Zod** for form handling and validation

### State Management & Data
- **React Context** for global state management
- **Axios** for API communication
- **AsyncStorage** for local data persistence
- **Expo SecureStore** for sensitive data storage

### UI/UX
- **Expo Vector Icons** (Ionicons)
- **React Native Reanimated** for animations
- **Expo Image Picker** for image selection
- **Expo Constants** for environment configuration

### Development Tools
- **Expo CLI** for development and building
- **EAS Build** for cloud builds
- **TypeScript** for type safety
- **ESLint** for code quality

## 📁 Project Structure

```
campus_mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API services
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── assets/             # Static assets
├── assets/                 # Expo assets (icons, splash)
├── app.json               # Expo configuration
├── babel.config.js        # Babel configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json           # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus_mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Development Commands

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Build for production
eas build --platform ios
eas build --platform android
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
API_URL=https://campus-backend-if2p.onrender.com/api
WS_URL=wss://campus-backend-if2p.onrender.com

# Development
API_URL_DEV=http://localhost:8000/api
WS_URL_DEV=ws://localhost:8000

# App Configuration
APP_NAME=Campus
APP_VERSION=1.0.0
```

### Backend Integration

The mobile app connects to the same Django backend as the web application:

- **API Base URL**: `https://campus-backend-if2p.onrender.com/api`
- **WebSocket URL**: `wss://campus-backend-if2p.onrender.com`
- **Authentication**: JWT tokens with automatic refresh
- **File Uploads**: Multipart form data for images

## 📱 Mobile-Specific Features

### Navigation
- **Bottom Tab Navigation**: Main app sections (Marketplace, Messages, Board, Profile)
- **Stack Navigation**: Authentication flow and detail screens
- **Deep Linking**: Support for shared listing links

### Mobile Optimizations
- **Touch Targets**: Minimum 44px for all interactive elements
- **Swipe Gestures**: Pull-to-refresh, swipe actions
- **Keyboard Handling**: Proper keyboard avoidance and form handling
- **Image Optimization**: Compressed images for faster loading
- **Offline Support**: Basic offline state handling

### Platform-Specific Features
- **iOS**: Native iOS design patterns and animations
- **Android**: Material Design components and behaviors
- **Cross-Platform**: Consistent experience across platforms

## 🧪 Testing

### Manual Testing
1. **Expo Go**: Test on physical devices using Expo Go app
2. **Simulators**: Test on iOS Simulator and Android Emulator
3. **Real Devices**: Test on actual iOS and Android devices

### Testing Checklist
- [ ] Authentication flow (login, register, password reset)
- [ ] Marketplace browsing and search
- [ ] Listing creation and editing
- [ ] Real-time messaging
- [ ] Image uploads
- [ ] Profile management
- [ ] Navigation and deep linking

## 📦 Building & Deployment

### EAS Build Configuration

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Build for platforms**
   ```bash
   # iOS
   eas build --platform ios
   
   # Android
   eas build --platform android
   
   # Both
   eas build --platform all
   ```

### App Store Deployment

1. **iOS App Store**
   ```bash
   eas submit --platform ios
   ```

2. **Google Play Store**
   ```bash
   eas submit --platform android
   ```

## 🔒 Security

### Data Protection
- **Secure Storage**: Sensitive data stored in Expo SecureStore
- **Token Management**: Automatic JWT refresh and secure token storage
- **API Security**: HTTPS-only communication with backend
- **Input Validation**: Client-side validation with Zod schemas

### Privacy
- **Image Permissions**: Explicit permission requests for photo access
- **Data Minimization**: Only collect necessary user data
- **Local Storage**: Sensitive data stored locally when possible

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **NativeWind not working**
   ```bash
   npx expo start --clear
   # Restart the development server
   ```

3. **iOS build failures**
   - Check Xcode version compatibility
   - Verify iOS deployment target
   - Check bundle identifier conflicts

4. **Android build failures**
   - Verify Android SDK installation
   - Check Java version compatibility
   - Verify package name uniqueness

### Debug Mode
```bash
# Enable debug logging
EXPO_DEBUG=true npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow React Native best practices
- Use NativeWind for styling
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Expo documentation
- Contact the development team

## 🔄 Updates & Maintenance

### Regular Maintenance
- Keep Expo SDK updated
- Update dependencies regularly
- Monitor API compatibility
- Test on new iOS/Android versions

### Version Updates
- Follow semantic versioning
- Update app.json version
- Test thoroughly before release
- Document breaking changes

---

**Built with ❤️ for the Campus community** 