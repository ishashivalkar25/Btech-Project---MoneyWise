// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const Profile = () => {
//   return (
//     <View>
//       <Text>Profile</Text>
//     </View>
//   )
// }

// export default Profile

// const styles = StyleSheet.create({})

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const AddFixedPayment = () => {
    return (
      <View style={styles.container}>
        <Text>Profile Screen</Text>
        <Button
          title="Click Here"
          onPress={() => alert('Button Clicked!')}
        />
      </View>
    );
};

export default AddFixedPayment;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
});