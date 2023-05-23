// __mocks__/react-native-get-sms-android.js

const SmsAndroid = {
    // Define mock functions or properties you need for testing
    // For example:
    list: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn().mockReturnValue([]),
    // ...
  };
  
  export default SmsAndroid;
  