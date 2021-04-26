import React , {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal'
import AsyncStorage from '@react-native-community/async-storage';
import { CommonActions } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import myColor from '../styles/colors'
import connection from '../netConfig'


class Login extends Component {
  constructor(){
    super();
    this.state = {
      email:null,
      password:null,
      isLoading: false,
      errorEmail:1,
      eErrorVisible:false,
    };
    // create reference for email in field, used for keyboard focusing on form submition
    this.ref_email = React.createRef();
  }
  //save the received id token for persistence
  async saveItem(item, selectedValue) {
    try {
      await AsyncStorage.setItem(item, selectedValue);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
  validateInput=(input)=>{
    var re = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(input);
  }
  userLogin() {
    // empty fields and verify
    if (!this.state.email || !this.state.password ){ 
      Alert.alert('שגיאה','יש למלא את כל השדות');
      return;
    }
    if( !this.validateInput(this.state.email)){
      this.setState({ errorEmail:3, eErrorVisible:true})  
    }
    // TODO: verify legit input, and dont allow sending bad input
    // create post parameters
    let fd = new FormData();
    fd.append('email',this.state.email);
    fd.append('password', this.state.password);
    // navigation config
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
    this.setState({isLoading:true})
    fetch(connection.URL+'login.php', {
      method: 'POST', 
      headers: { Accept: 'application/json', 
      'Content-Type': 'multipart/form-data' },
      body: fd, 
    })
    .then((response) => response.json())
    .then((responseData) => {
      // show error messege - mostly user doesnt exist 
      if(responseData.error == true){
        Alert.alert('שגיאה',responseData.error_msg)
    }
    else{
      this.saveItem('id_token', responseData.uid),
      this.saveItem('email', responseData.user.email)
      this.props.navigation.dispatch(resetAction)
    }
    }).catch((error)=>Alert.alert('שגיאה','יש לבדוק את חיבור האינטרנט'))
    .finally(()=>this.setState({isLoading:false}))// remove activity indicator
    .done();
  }
  passwordReset(){
    if (!this.state.email){ 
      Alert.alert('שגיאה','יש להכניס אימייל ');
      return;
    }
    // TODO: verify legit input, and dont allow sending bad input
    // create post parameters
    let fd = new FormData();
    fd.append('email',this.state.email);
    
    this.setState({isLoading:true})
    fetch(connection.URL+'newpass.php', {
      method: 'POST', 
      headers: { Accept: 'application/json', 
      'Content-Type': 'multipart/form-data' },
      body: fd, 
    })
    .catch((error)=>Alert.alert(error))
    .finally(()=>this.setState({isLoading:false}))// remove activity indicator
    .done();
  }
    render(){
        return (
        <>  
            
            <LinearGradient colors={[ myColor.gold,'#fff', myColor.lightBlue, myColor.darkBlue]}
                            locations={[0,0.1,0.7,1]}
                            style={styles.linearGradient}
                            >
            <ScrollView
                style={styles.scrollView}
                >
                  <SafeAreaView >
                  <Modal backdropOpacity={0.3}
                    isVisible={this.state.isLoading}>
                    <ActivityIndicator color={myColor.gold} size={Platform.OS === 'ios'?'large': 200}></ActivityIndicator>
                  </Modal>
                  <View style={styles.logo}><Image source={require('../img/yoldot_logoT.png')} /></View>
                    {/* navigate to register screen */}
                  <TouchableOpacity 
                    style = {[styles.btnContainer,{marginHorizontal:20}]}
                    onPress={()=>{this.props.navigation.navigate('Register')}}>
                    <View style={{justifyContent:'center'}}>
                      <Text style={{textAlign:'center',padding: 10, color: 'white'}}>
                          {'להרשמה'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                    {/* divider */}
                  <View style ={{marginVertical: 20,borderBottomColor: '#737373', borderBottomWidth: StyleSheet.hairlineWidth,}}/>
                  <View style={styles.sectionContainer}>
                    <Text style={{alignSelf:'center',fontSize:24,color:myColor.darkBlue, fontWeight: 'bold',}}>
                        משתמשת רשומה
                    </Text>
                  <View>
                    <Text style = {styles.fieldTxt}>אימייל:</Text>
                        <TextInput 
                          editable={true}
                          onChangeText = {(email)=> this.setState({email})}
                          placeholder = 'example@example.com'
                          onSubmitEditing={()=>{this.ref_email.current.focus()}}
                          returnKeyType='next'
                          value = {this.state.email}
                          keyboardType='email-address' 
                          textContentType='emailAddress' 
                          style={[styles.txtInp,{borderWidth:this.state.errorEmail}]}/>
                          {this.state.eErrorVisible && <View><Text style = {{color:'red'}}>*אימייל לא תיקני</Text></View>}
                      <Text style = {[styles.fieldTxt,{marginTop:30,}]}>סיסמא:</Text>
                        <TextInput 
                          editable={true}
                          onChangeText={(password) => this.setState({password})}
                          placeholder='Password'
                          ref={this.ref_email}
                          returnKeyType='next'
                          value={this.state.password}
                          textContentType='password' 
                          secureTextEntry={true}  
                          style={[styles.txtInp,{marginBottom:30,}]}/>
                      {/**login... */}
                      <View style = {{marginBottom:20}}>
                        <TouchableOpacity 
                          style = {styles.btnContainer}
                          onPress={  
                            this.userLogin.bind(this)
                            }>
                          <View style={{justifyContent:'center'}}>
                            <Text style={{textAlign:'center',padding: 10, color: 'white'}}>
                                {'לכניסה'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                      {/** TODO: implement in server */}
                        <TouchableOpacity 
                        onPress={this.passwordReset.bind(this)}  
                        style={{alignSelf:'center',fontSize:16,fontWeight:'bold', color: myColor.red}}>
                          <Text>שכחתי את הסיסמא
                            </Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                    </SafeAreaView>
            </ScrollView>
            </LinearGradient>
           
        </>
        )
    }
}

     
const styles = StyleSheet.create({

    logo:{
      backgroundColor: 'transparent',
      alignSelf:'center',
      marginTop:20,
    },
    btnContainer:{
      backgroundColor: myColor.red,
        justifyContent:'center',
        flex:1,
        borderRadius:10,
    },
    txtInp:{
      borderRadius:10,
      
      borderWidth:1,
      color:'#000',
      backgroundColor:'#fff',
      opacity:0.5,
      borderColor:myColor.red,
    },
    scrollView: {
      backgroundColor: 'transparent',
      borderRadius:5,
      flexGrow: 1, flexShrink: 1,
    },

    sectionContainer: {
      marginTop: 20,
      paddingHorizontal: 24,
    },
    linearGradient: {
      flex:1,
    },
    fieldTxt:{
      fontSize: 14,
      paddingRight:5,
      color: myColor.darkBlue,
    },
  });
export default Login;