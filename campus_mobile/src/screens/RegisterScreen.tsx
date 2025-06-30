import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

const RegisterScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-gray-800">
          Register Screen
        </Text>
        <Text className="text-gray-600 mt-2">
          Coming soon...
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen; 