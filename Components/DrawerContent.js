import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
    useTheme,
    Avatar,
    Title,
    Caption,
    Paragraph,
    Drawer,
    Text,
    TouchableRipple,
    Switch
} from 'react-native-paper';
import { getDoc, auth , doc, db} from '../Firebase/config'
import {
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList,
} from '@react-navigation/drawer';
import { green } from './Constants';
import Icon from 'react-native-vector-icons';

// import{ AuthContext } from '../components/context';

export function DrawerContent(props) {

    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');

    React.useEffect(() => {
        getUser();
    }, [])
    
    const getUser = async() =>
    {
        try{
            const document = await getDoc(doc(db, "User", auth.currentUser.uid));
    
            setName(document.data().name);
            setEmail(document.data().email);
        }catch(e)
        {
            console.log(e);
        }
        
    }

    const signOutFromAcc = () => {
        auth
            .signOut()
            .then(() => {
                props.navigation.replace("Login");
                console.log("Sign out");
            })
            .catch((error) => alert("Cannot signout from the application!!"));
    };

    return(
        <View style={{flex:1}}>
            <DrawerContentScrollView {...props} >
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        {/* <View style={{flexDirection:'row',marginTop: 15}}> */}
                            {/* <Avatar.Image 
                                source={{
                                    uri: 'https://api.adorable.io/avatars/50/abott@adorable.png'
                                }}
                                size={50}
                            /> */}
                            <View style={{marginLeft:15, flexDirection:'column'}}>
                            <Text style={styles.welcome}>Welcome !</Text>
                            <Title style={styles.title}>{name}</Title>
                            <Caption style={styles.caption}>{email}</Caption>
                            </View>
                        {/* </View> */}

                    </View>

                    {/* <Drawer.Section style={styles.drawerSection}> */}
                    <DrawerItemList {...props} />
                        {/* <DrawerItem 
                            label="Home"
                            onPress={() => {}}
                        /> */}
                        {/* <DrawerItem 
                            label="Profile"
                            onPress={() => {props.navigation.navigate('Profile')}}
                        />
                        <DrawerItem 
                            label="Fixed Payment"
                            onPress={() => {}}
                        />
                        <DrawerItem 
                            label="Notifications"
                            onPress={() => {}}
                        />
                        <DrawerItem
                            label="Settings"
                            onPress={() => {}}
                        /> */}

                    {/* </Drawer.Section> */}
                    {/* <Drawer.Section title="Preferences">
                        <TouchableRipple onPress={() => {toggleTheme()}}>
                            <View style={styles.preference}>
                                <Text>Dark Theme</Text>
                                <View pointerEvents="none">
                                    <Switch value={paperTheme.dark}/>
                                </View>
                            </View>
                        </TouchableRipple>
                    </Drawer.Section> */}
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem 
                    label="Sign Out"
                    onPress={() => {signOutFromAcc()}}
                />
            </Drawer.Section>
        </View>
    );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    padding : 0,
    margin : 0, 
  },
  userInfoSection: {
    paddingLeft: 5,
    backgroundColor: green,
    height:150
  },
  welcome: {
    fontSize: 30,
    color: 'white',
    marginTop: 12,
    // fontWeight: 'bold',
  },
  title: {
    fontSize: 27,
    marginTop: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  caption: {
    fontSize: 15,
    lineHeight: 14,
    marginTop:4,
    color: 'white',
    flexWrap: 'wrap'
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
      marginBottom: 15,
      borderTopColor: '#f4f4f4',
      borderTopWidth: 1
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});