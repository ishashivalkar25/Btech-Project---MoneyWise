import React from 'react'
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from "react-native-root-toast";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Pressable,
  Dimensions,
  Modal,
  Image,
  TouchableOpacity,
  ImageBackground
} from "react-native";

import {
  db,
  collection,
  addDoc,
  getDocs,
  getDoc,
  storage,
  auth,
  doc,
  updateDoc
} from '../../Firebase/config';

import DateTimePicker from "@react-native-community/datetimepicker";

import { useState, useEffect, useContext } from "react";

import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import uploadImg from "../../Assets/uploadReceiptIcon.png";
// import { TouchableOpacity } from 'react-native-web';
import * as ImagePicker from 'react-native-image-picker';
import Background from "../Background";
import { darkGreen } from "../Constants";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const { width } = Dimensions.get("window");
let downloadURL=""


function ShowIncomeDetails({route,navigation}) {
  const {incomeRecId,incomeRec} = route.params;
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState([]);
  const [imagePath, setImagePath] = useState();
  const [datePicker, setDatePicker] = useState(false);
  const [isCatModalVisible, setVisibilityOfCatModal] = useState(false);
  const [isImgModalVisible, setVisibilityOfImgModal] = useState(false);
  const [date, setDate] = useState(incomeRec.incDate.toDate());

  const [amount, setAmount] = useState(0);
  const [previousExpAmt,setPreviousExpAmt] = useState();

  const [description, setDescription] = useState("");
 
  useEffect(()=>{
    setDate(incomeRec.incDate.toDate());
    setAmount(incomeRec.incAmount);
    setSelectedCategory(incomeRec.incCategory);
    let imageSrc=""
    if(incomeRec.incImage)
      imageSrc=incomeRec.incImage;
    else
      imageSrc=pickedImagePath;
    setPickedImagePath(imageSrc);
    const loadData=async () => {
      const catList = [];
      try {
        const user = await getDoc(doc(db, "User", auth.currentUser.uid));
				user.data().incCategories.forEach((item) => {
					//   console.log(doc.id, JSON.stringify(doc.data()));
					getcat = { label: item, value: item };
					// console.log(getcat);
					catList.push(getcat);
				});
				// console.log(user.data() , "user");
				// catList.push(user.data().expCategories);
				catList.push({ label: "other", value: "other" });
				setCategory(catList);
				// setUserIncCategories(user.data().incCategories);

        
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }

    loadData();
  }
    , []);

 
  function showDatePicker() {
    setDatePicker(true);
  }



  function onDateSelected(event, value) {
    setDate(value);
    setDatePicker(false);
  }


  const [selectedCategory, setSelectedCategory] = useState(incomeRec.incCategory);

  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: "blue" }]}>
          Dropdown label
        </Text>
      );
    }
    return null;
  };

  const updateRecord = async () => {
    if (amount == 0) {
      let toast = Toast.show("Please enter amount.", {
        duration: Toast.durations.LONG,
      });
      setTimeout(function hideToast() {
        Toast.hide(toast);
      }, 800);
      return ;
    }
  
    if (selectedCategory == "") {
      let toast = Toast.show("Please select category.", {
        duration: Toast.durations.LONG,
      });
      setTimeout(function hideToast() {
        Toast.hide(toast);
      }, 800);
      return;
    }
  
    let promise = Promise.resolve();
    if (pickedImagePath != Image.resolveAssetSource(uploadImg).uri || pickedImagePath != incomeRec.incImage) {
      promise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          const blobImage = xhr.response;
          const metadata = {
            contentType: "image/jpeg",
          };
          const storageRef = ref(storage, "IncImages/" + Date.now());
          const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
             
              // console.log("Upload is " + progress + "% done");
              switch (snapshot.state) {
                case "paused":
                  console.log("Upload is paused");
                  break;
                case "running":
                  console.log("Upload is running");
                  break;
              }
            },
            (error) => {
              switch (error.code) {
                case "storage/unauthorized":
                  reject(new Error("User doesn't have permission to access the object"));
                  break;
                case "storage/canceled":
                  reject(new Error("User canceled the upload"));
                  break;
                case "storage/unknown":
                  reject(new Error("Unknown error occurred, inspect error.serverResponse"));
                  break;
                default:
                  reject(error);
                  break;
              }
            },
            async () => {
              downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("File available at", downloadURL);
              setPickedImagePath(downloadURL);
              resolve();
            }
          );
        };
        xhr.onerror = function () {
          reject(new Error("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", pickedImagePath, true);
        xhr.send(null);
      });
    }
  
    try {
      await promise;
      setPickedImagePath(downloadURL);
      let updatedData = {
        incAmount: amount,
        incDate: date,
        incCategory: selectedCategory,
        incDescription: description,
      };
      if (pickedImagePath != Image.resolveAssetSource(uploadImg).uri && pickedImagePath!=incomeRec.incImage) {
        updatedData.incImage = pickedImagePath;
      }
      if (pickedImagePath == incomeRec.incImage) {
        updatedData.incImage = incomeRec.incImage;
      }
      const docRef = doc(db, 'User', auth.currentUser.uid, 'Income', incomeRecId);

      await updateDoc(docRef, updatedData);


      const querySnapshot = await getDocs(collection(db, "income"));
      querySnapshot.forEach((doc) => {
        // console.log(doc.id, JSON.stringify(doc.data()));
      });

      console.log("Previous income amount------>",previousExpAmt);

      alert("Record Added Successfully");
      navigation.navigate("HomePage");
    } catch (error_1) {
      console.error("Error adding document: ", error_1);
      throw error_1;
    }
  };


//   const updateRecord=async()=>{

//     try {
//       if (amount == 0) {
//         // Add a Toast on screen.
//         let toast = Toast.show("Please enter amount.", {
//           duration: Toast.durations.LONG,
//         });

//         // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
//         setTimeout(function hideToast() {
//           Toast.hide(toast);
//         }, 800);
//       }
//       else if (selectedCategory == "") {
//         // Add a Toast on screen.
//         let toast = Toast.show("Please select category.", {
//           duration: Toast.durations.LONG,
//         });

//         // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
//         setTimeout(function hideToast() {
//           Toast.hide(toast);
//         }, 800);
//       }
//       else {
//         if (pickedImagePath != Image.resolveAssetSource(uploadImg).uri) {
//           //concerting image to blob image
//           const blobImage = await new Promise((resolve, reject) => {
//             const xhr = new XMLHttpRequest();
//             xhr.onload = function () {
//               resolve(xhr.response);
//             };
//             xhr.onerror = function () {
//               reject(new TypeError("Network request failed"));
//             };
//             xhr.responseType = "blob";
//             xhr.open("GET", pickedImagePath, true);
//             xhr.send(null);
//           });

//           //set metadata of image
//           /**@type */
//           const metadata = {
//             contentType: "image/jpeg",
//           };

//           // Upload file and metadata to the object 'images/mountains.jpg'
//           const storageRef = ref(storage, "IncImages/" + Date.now());
//           const uploadTask = uploadBytesResumable(
//             storageRef,
//             blobImage,
//             metadata
//           );

//           // Listen for state changes, errors, and completion of the upload.
//           uploadTask.on(
//             "state_changed",
//             (snapshot) => {
//               // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
//               const progress =
//                 (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//               // console.log("Upload is " + progress + "% done");
//               switch (snapshot.state) {
//                 case "paused":
//                   console.log("Upload is paused");
//                   break;
//                 case "running":
//                   console.log("Upload is running");
//                   break;
//               }
//             },
//             (error) => {
//               // A full list of error codes is available at
//               // https://firebase.google.com/docs/storage/web/handle-errors
//               switch (error.code) {
//                 case "storage/unauthorized":
//                   // User doesn't have permission to access the object
//                   break;
//                 case "storage/canceled":
//                   // User canceled the upload
//                   break;

//                 // ...

//                 case "storage/unknown":
//                   // Unknown error occurred, inspect error.serverResponse
//                   break;
//               }
//             },
//             () => {
//               // Upload completed successfully, now we can get the download URL
//               getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
//                 console.log("File available at", downloadURL);
//               });
//             }
//           );
//         }

//         // console.log(selectedCategory);
//         if (pickedImagePath != Image.resolveAssetSource(uploadImg).uri) {
//           // Assuming db and auth are initialized properly
//           const docRef = doc(db, 'User', auth.currentUser.uid, 'Income', incomeRecId);

//           const updatedData = {
//             incAmount: amount,
//             incDate: date,
//             incCategory: selectedCategory,
//             incDescription: description,
//             // incImage: imagepath,
//           };

//           await updateDoc(docRef, updatedData);
//         }
//         else {
//           // Assuming db and auth are initialized properly
//             const docRef = doc(db, 'User', auth.currentUser.uid, 'Income', incomeRecId);

//             const updatedData = {
//               incAmount: amount,
//               incDate: date,
//               incCategory: selectedCategory,
//               incDescription: description,
//             };

//             await updateDoc(docRef, updatedData);
//         }

//         const querySnapshot = await getDocs(collection(db, "income"));
//         querySnapshot.forEach((doc) => {
//           // console.log(doc.id, JSON.stringify(doc.data()));
//         });

//         alert("Record Added Successfully");
//         navigation.navigate("HomePage");
//       }

//     } catch (e) {
//       console.error("Error adding document: ", e);
//     }
//     // console.log("Date",date)

// }


  //   { label: 'Salary', value: 'Salary' },
  //   { label: 'Rent', value: 'Rent' },
  //   { label: 'Bonus', value: 'Bonus' },
  //   { label: 'Allowance', value: 'Allowance' },
  //   { label: 'other', value: 'other' }

  const get_category_list = async () => {
    const catList = [];
    try {
      const querySnapshot = await getDocs(collection(db, "IncCategory"));
      querySnapshot.forEach((doc) => {
        
        catName = doc.data();
        getcat = { label: catName.IncCatName, value: catName.IncCatName };
        
        catList.push(getcat);
      });

      
      catList.map((getcat) => setCategory([...category, getcat]));

    } catch (e) {
      console.error("Error adding document: ", e);
    }
    return catList;
  };

  const addCategoryToFD = async (value) => {
    try {
        const docRef = await addDoc(collection(db, "IncCategory"), {
        IncCatName: value,
      });

      const querySnapshot = await getDocs(collection(db, "Income"));
      querySnapshot.forEach((doc) => {
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

 

  const [pickedImagePath, setPickedImagePath] = useState(
    Image.resolveAssetSource(uploadImg).uri
  );

  // This function is triggered when the "Select an image" button pressed
  const showImagePicker = () => {
    ImagePicker.launchImageLibrary()
      .then((result) => {
        if (result) {
          setPickedImagePath(result.assets[0].uri);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // This function is triggered when the "Open camera" button pressed
  const openCamera = () => {
  ImagePicker.launchCamera()
    .then((result) => {
      // console.log(result.assets[0].uri, "file");
      setPickedImagePath(result.assets[0].uri);
    })
    .catch((error) => {
      console.log(error);
    });
};

  return (
    <Background> 
      <Text style={styles.Title}>Income Record</Text>
      <View style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.container1}>
        <View style={styles.amt}>
          <Text style={styles.head}>Amount: </Text>
          <TextInput
            keyboardType="numeric"
            style={styles.inputText}
            defaultValue={incomeRec.incAmount}
            onChangeText={(val)=>{
              setPreviousExpAmt(amount);
              setAmount(val);
            }}
          />
          </View>

          {datePicker && (
            <DateTimePicker
              value={incomeRec.incDate.toDate()}
              mode={"date"}
              textColor='green'
              display={Platform.OS === "ios" ? "spinner" : "default"}
              is24Hour={true}
              onChange={onDateSelected}
              style={styles.datePicker}
            />
          )}

      <View style={styles.date}>
          <Text style={styles.head}>Date: </Text>
          {!datePicker && (
            <View style={styles.inputText}>
              <Pressable style={styles.dateButton} onPress={showDatePicker}>
                <Text>{date.getDate() + ' / ' + (date.getMonth() + 1) + ' / ' + date.getFullYear()}</Text>
              </Pressable>
            </View>
          )}
       </View>
       </View>

       <View style={styles.container1}>
          <Text style={styles.head1}>Select Category</Text>
          {/* <FlatList
        style={[
          {
            flexDirection: "row",
            alignContent: "space-between",
          },
        ]}
          numColumns={3}
          keyExtractor={(item) => item.id}
          data={category}
          renderItem={({item}) => (
            <Text style={styles.catItem} onPress= {({item})=>{getCategory({item})}}>{item.name}</Text>
          )}
          /> */}

          <Dropdown
            
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={category}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Category"
            textColor="green"
            searchPlaceholder="Search..."
            value={incomeRec.incCategory}
            onChange={(item) => {
              if (item.value != "other") setSelectedCategory(item.value);
              else {
                setVisibilityOfCatModal(true);
              }
            }}
           
          />
          </View> 

          {/* <FontAwesomeIcon icon={solid('user-secret')} /> */}
          {/* <Modal            
          animationType = {"fade"}  
          transparent = {false}  
          visible = {isCatModalVisible}  
          onRequestClose = {() =>{ console.log("Modal has been closed.") } }>  
          
              <View style = {styles.modal}>  
              <TextInput 
                style={styles.input}
                placeholder='Enter Category'
                onChangeText= {(text)=>{setSelectedCategory(text)}}/>
              <Button title="Add Category" onPress = {() => {  
                 setVisibilityOfCatModal(!isCatModalVisible)
                 setCategory([...category,{ label: selectedCategory, value: selectedCategory }])
                 }}/>  
          </View>  
        </Modal>   */}

          <Modal
            animationType="slide"
            transparent
            visible={isCatModalVisible}
            presentationStyle="overFullScreen"
            onDismiss={() => {
              setVisibilityOfCatModal(!isCatModalVisible);
            }}
          >
            <View style={styles.viewWrapper}>
              <View style={styles.modalView}>
                <TextInput
                  placeholder="Enter Category"
                  style={styles.textInput}
                  onChangeText={(value) => {
                    setSelectedCategory(value);
                  }}
                />

                {/** This button is responsible to close the modal */}
                <Button
                  title="Add Category"
                  onPress={() => {
                    setVisibilityOfCatModal(!isCatModalVisible);
                    setCategory([
                      ...category,
                      { label: selectedCategory, value: selectedCategory },
                    ]);
                    addCategoryToFD(selectedCategory);
                  }}
                />
              </View>
            </View>
          </Modal>
        </View>
         
          {/* <Image source = {{uri :pickedImagePath}}
    style = {{width: '100%', height: 200}} onPress={()=>{setVisibili}}></Image> */}
          {/* <Modal            
          animationType = {"fade"}  
          transparent = {false}  
          visible = {isImgModalVisible}  
          onRequestClose = {() =>{ console.log("Modal has been closed.") } }>  
              <View style = {styles.modal}>  
                <Button onPress={showImagePicker} title="Select an image" />
                <Button onPress={openCamera} title="Open camera" />
              <Button title="Close" onPress = {() => {  
                 setVisibilityOfImgModal(!isImgModalVisible)
                 }}/>  
          </View>  
        </Modal>   */}

        <View style={styles.container2}>
         <Text style={styles.head}>Add note</Text>
        <TextInput
          placeholder="Description"
          style={styles.input1}
          defaultValue={incomeRec.incDescription}
          onChangeText={(value) => {
            setDescription(value);
          }}
        />
        {/* {console.log(imagePath)} */}
      <Text style={styles.head1}>Add Image</Text>

          <Modal
            animationType="slide"
            transparent
            visible={isImgModalVisible}
            presentationStyle="overFullScreen"
            onDismiss={() => {
              setVisibilityOfCatModal(!isImgModalVisible);
            }}
          >
            <View style={styles.viewWrapper}>
            <View style={styles.modalView}>
                <TouchableOpacity onPress={showImagePicker} style={styles.selImg}>
                   <Text style={{color: "white", fontSize: 15, fontWeight: 'bold'}}> Upload image </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={openCamera} style={styles.selImg}>
                   <Text style={{color: "white", fontSize: 15, fontWeight: 'bold'}}> Take Photo </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                  setVisibilityOfImgModal(!isImgModalVisible); }}>
                   <Text style={{color: darkGreen, fontSize: 15, marginTop:30}}> Close </Text>
                </TouchableOpacity>
            </View>
          </View>
          </Modal>
          <TouchableOpacity
            onPress={() => {
              console.log("image clicked");
              setVisibilityOfImgModal(true);
            }}
          >
            {pickedImagePath !== "" && (
              <Image
                source={{ uri: pickedImagePath }}
                style={{ width: 50, height: 50, margin: 15, alignSelf: 'center' }}
                onPress={() => {
                  console.log("image clicked");
                  setVisibilityOfImgModal(true);
                }}
              />
            )}
          </TouchableOpacity>
        </View>
      

      <TouchableOpacity
      
      style={{
      backgroundColor: darkGreen,
      borderRadius: 200,
      alignItems: 'center',
      width: 250,
      paddingVertical: 5,
      marginVertical: 10,
      alignSelf:'center',
      //marginTop:30,
      
    }} onPress={() => {
      updateRecord()
    }}>
    <Text style={{color: "white", fontSize: 20, fontWeight: 'bold'}}> Save </Text>
    </TouchableOpacity>
    </View>
    </Background>
  )
}


const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 600,
    width: 340,
    alignSelf:'center',
    backgroundColor: "#fff",
   marginTop: 5,
 },

  mainContainer: {
    padding: 20,
    flex: 2,
  },

  container1: {
    width:'98%',
    alignSelf: "center",
    borderRadius:15,
    shadowOpacity:0.5,
    shadowColor:"black",
    shadowOffset:{
      height:5,
      width:5
    },
    elevation:5,
    backgroundColor:"white",
    marginTop:20,
  },
  
  container2: {
    width:'87%',
    alignSelf: "center",
    borderRadius:15,
    shadowOpacity:0.5,
    shadowColor:"black",
    shadowOffset:{
   // height:5,
    //width:5
    },

    elevation:5,
    backgroundColor:"white",
    marginTop:10,
    paddingTop:5,
    paddingLeft:20
  },

  Title: {
    color: "white",
    fontSize: 50,
    fontWeight: "bold",
    marginVertical: 20,
    alignSelf:"center"
  },

  amt: {
      flexDirection:"row",
      justifyContent:"space-around",
      padding:15      
    },

    head: {
     // marginTop:15,
      fontWeight:"bold",
      fontSize: 16 ,
      color: darkGreen,
    },

    input: {
      borderRadius: 5, 
      color: darkGreen, 
      paddingHorizontal: 5,
      width: '60%', 
      height:30,
      backgroundColor: 'rgb(220,220, 220)',
      justifyContent:'space-around'
    },

    inputText: {
      padding : 0,
      borderRadius: 5,
      color: darkGreen,
      paddingHorizontal: 5,
      width: '60%',
      height: 35,
      backgroundColor: 'rgb(220,220, 220)',
    },

    input1: {
      borderWidth: 1,
      borderColor: '#777',
      borderRadius: 10,
      padding: 10,
      width: "100%",
      height: 80,
      marginTop: 10,
      marginBottom: 15,
      textAlignVertical: "top",
      textAlign: 'left'
    },

        date: {
      flexDirection:"row",
      justifyContent:"space-around"
    },

    head1: {
      marginTop:12,
      fontWeight:"bold",
      alignSelf: "center",
      color: darkGreen,
      fontSize:16
    },  

    dropDownStyle:{
      width:'85%',
      backgroundColor:'rgba(0,0,0,0.2)',
      padding:5,
      alignSelf: "center",
      borderRadius:6,
      justifyContent:'space-between',
      alignItems:'center'
    },

    dropDownIcon:{
      resizeMode: 'contain',
    },

  modal: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    height: 300,
    width: "80%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
    marginTop: 80,
    marginLeft: 40,
  },

  //cat modal styles
  viewWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },

  modalView: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    elevation: 5,
    transform: [{ translateX: -(width * 0.4) }, { translateY: -90 }],
    height: 180,
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 7,
  },

  textInput: {
    width: "80%",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    marginBottom: 8,
  },

  // text: {
  //   fontSize: 25,
  //   color: 'red',
  //   padding: 3,
  //   marginBottom: 10,
  //   textAlign: 'center'
  // },

  // Style for iOS ONLY...
  datePicker: {
    justifyContent: "center",
    alignItems: "flex-start",
    width: 320,
    height: 50,
    display: "flex",
  },

  dateLabel: {
    marginTop: 15,
  },

  dateButton: {
padding:7,
alignSelf: "center",
borderRadius:5,
flexDirection:'row',
width:180,
alignItems:'center',
backgroundColor: 'rgb(220,220, 220)',
},

  dateText: {
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: "black",
  },

  catItem: {
    padding: 10,
    backgroundColor: "skyblue",
    fontSize: 14,
    marginHorizontal: 10,
    marginTop: 24,
  },

  dropdown: {
  margin: 10,
  width:'85%',
  backgroundColor:'rgba(0,0,0,0.2)',
  padding:5,
  alignSelf: "center",
  borderRadius:6,
  // flexDirection:'row',
  alignItems:'center'
},

  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imgButtonContainer: {
    width: 400,
    flexDirection: "column",
    justifyContent: "space-around",
  },
  imageContainer: {
    padding: 30,
  },
  
  image: {
    width: 200,
    height: 10,
    resizeMode: "cover",
  },

  buttonContainer: {
    backgroundColor:'#33adff',
    padding:5,
  
    alignItems:'center',
    borderRadius:10,
    width:"85%",
    alignSelf:'center',
    fontWeight:"bold",
    fontSize:50,
    paddingLeft:30,
  },
  
  backImg: {
    height: "100%"
  },

  selImg :{
    backgroundColor: darkGreen,
    borderRadius: 10,
    alignItems: 'center',
    width: 150,
    paddingVertical: 5,
    marginVertical: 10,
    alignSelf:'center',
    marginTop:5,    
  }
});

export default ShowIncomeDetails