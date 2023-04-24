import { View, TouchableOpacity, Image, StatusBar, Pressable, StyleSheet} from "react-native";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContent } from './Components/DrawerContent';
import HomePage from "./Components/HomePage";
import SplashScreen from "./Components/SplashScreen/SplashScreen";
import ProfileScreen from "./Components/ProfileScreen";
import EditProfile from "./Components/EditProfile";
import FixedExp from "./Components/FixedExpenses/FixedExp";
import AddFixedExp from "./Components/FixedExpenses/AddFixedExp";
import Budget from "./Components/Budget/Budget";
import Index from "./Components/Index";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import AddIncome from "./Components/Income/AddIncome";
import ShowIncomeDetails from "./Components/Income/ShowIncomeDetails";
import Visualisation from "./Components/Visualisation/Visualisation";
import Header from "./Components/Header";
import ConfirmUntrackedIncTrans from "./Components/Income/ConfirmUntrackedIncTrans";
import AddExpense from "./Components/Expense/AddExpense";
import AddGrpExpMembers from "./Components/Expense/AddGrpExpMembers";
import ShowExpenseDetails from "./Components/Expense/ShowExpenseDetails";


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function Root({navigation}) {
  return (
    <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />} >
      <Drawer.Screen name="HomePage"
            component={HomePage}
            options={{
              drawerIcon: ({ focused, size }) => (
                <Image
                  source={require("./Assets/home.png")}
                  style={[focused ? styles.drawerActive : styles.drawerInActive, { height: 20, width: 20}]}
                />
              ),
              drawerActiveTintColor:"#006A42",
              headerTitle: () => <Header></Header>,
              headerRight: () => (
                <View>
                  <TouchableOpacity >
                    <Image
                      source={require("./Assets/log-out.png")}
                      style={{ width: 27, height: 27, alignSelf: "center" }}
                    />
                  </TouchableOpacity>
                </View>
              ),
              headerStyle: {
                height: 60,
                // borderBottomLeftRadius: 50,
                // borderBottomRightRadius: 50,
                shadowColor: "#000",
                elevation: 25,
              },
            }}
          />
      <Drawer.Screen name="Profile" component={ProfileScreen}
        options={{
          drawerIcon: ({ focused, size }) => (
            <Image
              source={require("./Assets/profile.png")}
              style={[focused ? styles.drawerActive : styles.drawerInActive, { height: 20, width: 20}]}
            />
          ),
          drawerActiveTintColor:"#006A42",
        }}
      />
      <Drawer.Screen name="Fixed Expense" component={FixedExp} 
        options={{
          drawerIcon: ({ focused, size }) => (
            <Image
              source={require("./Assets/Fixed_Payment.png")}
              style={[focused ? styles.drawerActive : styles.drawerInActive, { height: 20, width: 20}]}
            />
          ),
          drawerActiveTintColor:"#006A42",
        }}
      />
      <Drawer.Screen name="Manage Budget" component={Budget} 
        options={{
          drawerIcon: ({ focused, size }) => (
            <Image
              source={require("./Assets/Budget.png")}
              style={[focused ? styles.drawerActive : styles.drawerInActive, { height: 20, width: 20}]}
            />
          ),
          drawerActiveTintColor:"#006A42",
        }}
      />
    </Drawer.Navigator>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar></StatusBar>
      <Stack.Navigator>
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
        {/* <Stack.Screen name="Index" component={Index} options={{ headerShown: false }} /> */}
        <Stack.Screen name="Login" component={Login} options={{ headerTitle: () => <Header></Header> }} />
        <Stack.Screen name="Sign Up" component={SignUp} options={{ headerTitle: () => <Header></Header> }} />
        <Stack.Screen name="Root" component={Root} options={{ headerShown: false }}/>
        <Stack.Screen name="AddIncome" component={AddIncome} options={{headerTitle: () => <Header></Header>}}/>
        <Stack.Screen name="AddExpense" component={AddExpense} options={{headerTitle: () => <Header></Header>}}/>
        <Stack.Screen name="Visualisation" component={Visualisation} options={{headerTitle: () => <Header></Header>}}/>
        <Stack.Screen name="AddFixedExp" component={AddFixedExp} />
        <Stack.Screen name="ConfirmUntrackedIncTrans" component={ConfirmUntrackedIncTrans} />
        <Stack.Screen name="AddGrpExpMembers" component={AddGrpExpMembers} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="ShowIncomeDetails" component={ShowIncomeDetails} />
        <Stack.Screen name="ShowExpenseDetails" component={ShowExpenseDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;

const styles = StyleSheet.create({
  drawerActive: {
    // color:'#006A42',
  },
  drawerInActive: {

  }
});