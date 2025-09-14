import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, loading } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-20));

  useEffect(() => {
    // Start fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Start fade out after 1.5 seconds
    const fadeOutTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);

    // Navigate after animations complete (2.5 seconds total)
    const navigationTimer = setTimeout(() => {
      if (!loading) {
        if (user) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('SignIn');
        }
      }
    }, 2500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(navigationTimer);
    };
  }, [fadeAnim, slideAnim, navigation, user, loading]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.welcomeText,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Welcome to Campus</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
});

export default WelcomeScreen; 