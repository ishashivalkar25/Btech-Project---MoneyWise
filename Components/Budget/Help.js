import React from 'react';
import { Text, View, StyleSheet, ImageBackground } from 'react-native';
import { Title, Caption } from 'react-native-paper';

const Help = () => {
  return (
    <View style={{ width: "100%" }}>
      <ImageBackground
        source={require("../../Assets/Background.jpg")}
        style={{
          height: "100%",
        }}
      >
        <Text style={styles.heading}> Details about budgeting techniques </Text>

        <Title style={styles.title}>1. Envelop Method</Title>
        <Caption style={styles.caption}>       It is a budgeting technique where you divide your income into
          different categories and assign a specific amount of money for each category.</Caption>

        <Title style={styles.title}>2. Zero Based Budgeting</Title>
        <Caption style={styles.caption}>    It is a budgeting technique where every expense must be justified for each new period. This means that the budget starts from scratch, or zero, every time a new budgeting period begins,
          rather than taking the previous period's budget as the starting point.  </Caption>

        <Title style={styles.title}>3. 50-30-20</Title>
        <Caption style={styles.caption}>      Under this technique, you divide your income into three categories:  </Caption>
        <Caption style={styles.caption}>i) Needs (50%): This category includes expenses that are necessary for your survival, such as rent, utilities, food, transportation, and healthcare.</Caption>
        <Caption style={styles.caption}>ii) Wants (30%): This category includes discretionary expenses such as entertainment, dining out, travel, and shopping.</Caption>
        <Caption style={styles.caption}>iii) Savings and Debt Repayment (20%): This category includes money that you set aside for savings, investments, and debt repayment.</Caption>

      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    marginTop: 15,
    fontWeight: 'bold',
    color: 'white',
    paddingLeft: 7,
    fontStyle: 'italic',
  },
  title: {
    fontSize: 17,
    marginTop: 15,
    fontWeight: 'bold',
    color: 'white',
    paddingLeft: 25,
  },
  caption: {
    fontSize: 15,
    lineHeight: 14,
    marginTop: 4,
    color: 'white',
    flexWrap: 'wrap',
    paddingLeft: 45,
    paddingRight : 25,
    textAlign: 'justify'
  },

});

export default Help;