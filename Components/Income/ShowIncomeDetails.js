import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  ImageBackground,
  ScrollView
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
import { green } from "../Constants";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const { width, height } = Dimensions.get("window");
let downloadURL = ""


function ShowIncomeDetails({ route, navigation }) {
  const { incomeRecId, incomeRec } = route.params;
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState([]);
  const [imagePath, setImagePath] = useState();
  const [datePicker, setDatePicker] = useState(false);
  const [isCatModalVisible, setVisibilityOfCatModal] = useState(false);
  const [isImgModalVisible, setVisibilityOfImgModal] = useState(false);
  const [date, setDate] = useState(new Date(incomeRec.incDate.seconds * 1000));

  const [amount, setAmount] = useState(0);
  const [accBalance, setAccBalance] = useState(0);
  const [previousExpAmt, setPreviousExpAmt] = useState();

  const [description, setDescription] = useState("");

  useEffect(() => {
    setDate(new Date(incomeRec.incDate.seconds * 1000));
    setAmount(incomeRec.incAmount);
    setSelectedCategory(incomeRec.incCategory);
    let imageSrc = ""
    if (incomeRec.incImage)
      imageSrc = incomeRec.incImage;
    else
      imageSrc = pickedImagePath;
      setPickedImagePath(imageSrc);
    const loadData = async () => {
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
        catList.push({ label: "Other", value: "Other" });
        setCategory(catList);
        // setUserIncCategories(user.data().incCategories);
        setAccBalance(user.data().accBalance);

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



  function onDateSelected(value) {
    setDate(value);
    setDatePicker(false);
  }


  const [selectedCategory, setSelectedCategory] = useState(incomeRec.incCategory);

  const updateRecord = async () => {
    console.log("Amount changed : ", amount)
    if (amount == 0) {
      console.log("Amount changed1 : ", amount)
      let toast = Toast.show("Please enter amount.", {
        duration: Toast.durations.LONG,
      });
      setTimeout(function hideToast() {
        Toast.hide(toast);
      }, 8000);
      return;
    }

    if (selectedCategory == "") {
      let toast = Toast.show("Please select category.", {
        duration: Toast.durations.LONG,
      });
      setTimeout(function hideToast() {
        Toast.hide(toast);
      }, 8000);
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
      if (pickedImagePath != Image.resolveAssetSource(uploadImg).uri && pickedImagePath != incomeRec.incImage) {
        updatedData.incImage = pickedImagePath;
      }
      if (pickedImagePath == incomeRec.incImage) {
        updatedData.incImage = incomeRec.incImage;
      }
      const docRef = doc(db, 'User', auth.currentUser.uid, 'Income', incomeRecId);

      await updateDoc(docRef, updatedData);

      //update account balance
      await updateDoc(doc(db,"User",auth.currentUser.uid), {
        accBalance : parseFloat(accBalance) - parseFloat(incomeRec.incAmount) + parseFloat(amount) +""
      });


      console.log("Previous income amount------>", previousExpAmt);

      alert("Record Added Successfully");
      navigation.navigate("Root");
    } catch (error_1) {
      console.error("Error adding document: ", error_1);
      throw error_1;
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
    <ImageBackground
      source={require('../../Assets/Background.jpg')}
      style={{ width: width, height: height, marginTop: insets.top }}
    >
      <Text style={styles.Title}>Edit Income</Text>
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <ScrollView>
            <View style={styles.container1}>
              <View style={styles.inputPair}>
                <Text style={styles.head}>Amount: </Text>
                <TextInput
                  testID="setAmtId"
                  keyboardType="numeric"
                  style={styles.inputText}
                  defaultValue={incomeRec.incAmount}
                  onChangeText={(val) => {
                    setPreviousExpAmt(amount);
                    setAmount(val);
                    console.log("Amount :", val)
                  }}
                />
              </View>

              {datePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={new Date(incomeRec.incDate.seconds * 1000)}
                  mode={"date"}
                  textColor={green}
                  display={"default"}
                  is24Hour={true}
                  onChange={onDateSelected}
                  style={styles.datePicker}
                />
              )}

              <View style={styles.inputPair}>
                <Text style={styles.head}>Date: </Text>
                {!datePicker && (
                  <View style={styles.inputText}>
                    <Pressable testID="showDatePicker" style={styles.dateButton} onPress={showDatePicker}>
                      <Text>{date.getDate() + ' / ' + (date.getMonth() + 1) + ' / ' + date.getFullYear()}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.container1}>
              <Text style={styles.headCenter}>Select Category</Text>

              <Dropdown
                testID="setSelectedCatId"
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
                textColor={green}
                searchPlaceholder="Search..."
                value={incomeRec.incCategory}
                onChange={(item) => {
                  if (item.value != "Other") setSelectedCategory(item.value);
                  else {
                    setVisibilityOfCatModal(true);
                  }
                }}

              />
            </View>


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
                  <TouchableOpacity
                    testID="addCategory"
										onPress={() => {
											setVisibilityOfCatModal(!isCatModalVisible);
											setCategory([
												...category,
												{ label: selectedCategory, value: selectedCategory },
											]);
										}}
										style={{
											backgroundColor: green,
											borderRadius: 200,
											alignItems: 'center',
											width: "60%",
											paddingVertical: 5,
											marginVertical: 10,
											alignSelf: 'center',
											//marginTop:30,
										}}>
										<Text style={{ color: "white", fontSize: 20, fontWeight: 'bold', margin: 0 }}> Add Category </Text>
									</TouchableOpacity>

                </View>
              </View>
            </Modal>
          
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
          <Text style={styles.headCenter}>Add Image</Text>

          <Modal
            testID="imgModal"
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
                <TouchableOpacity testID="showImagePicker" onPress={showImagePicker} style={styles.selImg}>
                  <Text style={{ color: "white", fontSize: 15, fontWeight: 'bold' }}> Upload image </Text>
                </TouchableOpacity>

                <TouchableOpacity testID="openCamera" onPress={openCamera} style={styles.selImg}>
                  <Text style={{ color: "white", fontSize: 15, fontWeight: 'bold' }}> Take Photo </Text>
                </TouchableOpacity>

                <TouchableOpacity testID="closeImagePicker" onPress={() => {
                  setVisibilityOfImgModal(!isImgModalVisible);
                }}>
                  <Text style={{ color: green, fontSize: 15, marginTop: 30 }}> Close </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <TouchableOpacity
            testID="setVisibilityOfImgModal"
            onPress={() => {
              console.log("image clicked");
              setVisibilityOfImgModal(true);
            }}
          >
            {pickedImagePath !== "" && (
              <Image
                testID="selectOtherImg"
                source={{ uri: pickedImagePath }}
                style={{ width: 50, height: 50, margin: 15, alignSelf: 'center' }}
                onPress={() => {
                  setVisibilityOfImgModal(true);
                }}
              />
            )}
          </TouchableOpacity>
        </View>


        <TouchableOpacity
          testID="updateIncomeBtn"
          style={{
            backgroundColor: green,
            borderRadius: 200,
            alignItems: 'center',
            width: 250,
            paddingVertical: 5,
            marginVertical: 10,
            alignSelf: 'center',
            //marginTop:30,

          }} onPress={() => {
            updateRecord()
          }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: 'bold' }}> Save </Text>
        </TouchableOpacity>
        </ScrollView>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: height * 0.8,
    width: width,
    backgroundColor: "#fff",
    marginTop: 5,
  },

  mainContainer: {
    padding: 25,
    flex: 1,
    height: "100%",
    justifyContent: "space-between"
  },

  container1: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 15,
    shadowOpacity: 0.5,
    shadowColor: "black",
    shadowOffset: {
      height: 5,
      width: 5
    },
    elevation: 5,
    backgroundColor: "white",
    marginTop: 20,
  },

  container2: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 15,
    shadowOpacity: 0.5,
    shadowColor: "black",
    shadowOffset: {
      // height:5,
      //width:5
    },

    elevation: 5,
    backgroundColor: "white",
    marginTop: 30,
    paddingTop: 5,
    paddingLeft: 20,
    paddingRight: 20,
  },
  container_btn_block: {
    flexDirection: 'row',
    paddingBottom: 10,
    paddingTop: 10,
    justifyContent: "space-around",
  },
  container2_btn: {
    padding: 15,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 100,
    borderRadius: 10,
    backgroundColor: "#841584",
    color: "white",
    width: 150,
    margin: 5,
  },

  Title: {
    color: "white",
    fontSize: 50,
    fontWeight: "bold",
    marginVertical: 20,
    alignSelf: "center",
  },

  inputPair: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10
  },

  head: {
    // marginTop:15,
    fontWeight: "bold",
    fontSize: 16,
    color: green,
  },

  inputText: {
    padding: 0,
    borderRadius: 5,
    color: green,
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

  headCenter: {
    marginTop: 10,
    fontWeight: "bold",
    alignSelf: "center",
    color: green,
    fontSize: 16
  },

  dropDownStyle: {
    width: '85%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 5,
    alignSelf: "center",
    borderRadius: 6,
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  dropDownIcon: {
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

  dateButton: {
    padding: 7,
    alignSelf: "center",
    borderRadius: 5,
    flexDirection: 'row',
    width: 180,
    alignItems: 'center',
    backgroundColor: 'rgb(220,220, 220)',
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
    width: '85%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 5,
    alignSelf: "center",
    borderRadius: 6,
    // flexDirection:'row',
    alignItems: 'center'
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

  selImg: {
    backgroundColor: green,
    borderRadius: 10,
    alignItems: 'center',
    width: 150,
    paddingVertical: 5,
    marginVertical: 10,
    alignSelf: 'center',
    marginTop: 5,
  }
});

export default ShowIncomeDetails;