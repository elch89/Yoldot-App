import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Linking
} from 'react-native';
import {I18nManager} from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import Footer from '../components/Footer'
import MainHeader from '../containers/mainHeader'
import myColor from '../styles/colors'
import {openDatabase} from 'react-native-sqlite-storage'
import connection from '../netConfig'
// Get access to frontend database
var db = openDatabase({ name: 'qoest_db.db', createFromLocation : 1});


export default class HomePage extends React.Component{
    constructor(){
        super()
        this.state = {
            dataSource:[],
            rating:[],
            tIsLoading:true,
            rIsLoading:true,
        }
        // Query table
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM hospitals', [], (tx, results) => {
                var hospitalist = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    // inserts all rows to list
                    hospitalist.push(results.rows.item(i));
                }
                this.setState({
                    hospitaList: hospitalist,
                });
            });
        });
    }
    // Logut user - async action that it wont affect flow
    async userLogout(){
        try {
            // Remove user token from storage
            await AsyncStorage.removeItem('id_token');
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        }
    }; 
    async componentDidMount(){
        // Check if rtl: TODO:// see relevence
        try{
            console.log('is RTL?:'+I18nManager.isRTL);
        }
        catch(e){console.log(e.message)}
        // Fetch data from server... 
        /**  Compare table titles*/
        try {
            const response = await fetch(connection.URL+'titles.php');
            const responseJson = await response.json();
            this.setState({
                dataSource:responseJson,
                tIsLoading:false,
            });
        }
        catch (error) {
          console.error(error);
        }
        /**  Rating results (using python)*/
        try {
            const response = await fetch(connection.URL+'rating.php',{
                headers:{contentType: "application/json; charset=utf-8"}
            });
            
            const responseJson = await response.json();
            this.setState({
                rating:{mid: 0,responseJson},
                rIsLoading:false,
            });
        }
        catch (error) {
         console.error(error);
        }
    }
    
    render(){
        // couldnt load data from server:
        if (this.state.tIsLoading || this.state.rIsLoading) {
            return (
              <View style={{flex: 1, justifyContent:'center'}}>
                <ActivityIndicator color={myColor.gold} size={Platform.OS === 'ios'?'large': 200}/>
                <Text style ={styles.buttonText} >טוען...</Text>
              </View>
            );
          }
        return(
            <>
            <SafeAreaView style={{flex:1}}>
                <MainHeader logState={this.userLogout} {...this.props}/>
                    <View style = {styles.body}>
                        <View style = {styles.touchableContainer}>
                            <TouchableOpacity 
                            activeOpacity={.5}
                            style = {styles.touchables}
                                onPress={() => {
                                this.props.navigation.navigate('Feedback',{value:this.state.hospitaList})}}>
                                <View style={{justifyContent:'center',alignContent:'center', flex:1}} >
                                    <Text style={styles.toRate}>ספרי לנו על הלידה שלך</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style = {styles.touchableContainer}>
                        <TouchableOpacity 
                        activeOpacity={.5}
                        style = {styles.touchables}
                        onPress={() => {
                            this.props.navigation.navigate('Rating',this.state.rating)}}>
                            <View style={{justifyContent:'center',alignContent:'center', flex:1}}>
                                <Text style={styles.buttonText}>לתוצאות דרוג בתי יולדות</Text>
                            </View>
                        </TouchableOpacity>
                        </View>
                        <View style = {styles.touchableContainer}>
                        <TouchableOpacity 
                        activeOpacity={.5}
                        style = {styles.touchables}
                            onPress={() => {
                            this.props.navigation.navigate('Compare',{value:[this.state.hospitaList,this.state.dataSource]})}}>
                                <View style={{justifyContent:'center',alignContent:'center', flex:1}}>
                                    <Text style={ styles.buttonText}>להשוואת בתי יולדות</Text>
                                </View>
                        </TouchableOpacity>
                        </View>
                        <View style = {styles.touchableContainer}>
                        <TouchableOpacity 
                        activeOpacity={.5}
                        style = {styles.touchables}
                        onPress={() => {
                            const uri = 'http://www.leidaraka.co.il/%D7%A7%D7%95%D7%A8%D7%A1-%D7%94%D7%9B%D7%A0%D7%94-%D7%9C%D7%9C%D7%99%D7%93%D7%94/';
                            // opens URL for online course
                            Linking.openURL(uri);
                            }}>
                            <View style={{justifyContent:'center',alignContent:'center', flex:1}}>
                                <Text style={styles.buttonText}>לקורס האונליין שלנו</Text>
                            </View>
                        
                        </TouchableOpacity>
                        </View>
                        <View style = {styles.touchableContainer}>
                        <TouchableOpacity 
                        activeOpacity={.5}
                        style = {styles.touchables}
                            // onPress={() => {
                        //     this.props.navigation.navigate('Podcasts')}}
                        >
                        <View style={{justifyContent:'center',alignContent:'center', flex:1}}>
                            <Text style={styles.buttonText}>לפודקאסט</Text>
                        </View>
                        <Text style={styles.comingSoon}>בקרוב!</Text>
                        
                        </TouchableOpacity>
                        </View>
                        <View style = {styles.touchableContainer}>
                        <TouchableOpacity 
                        activeOpacity={.5}
                        style = {styles.touchables}
                        // onPress={() => {
                        //     this.props.navigation.navigate('Coupons')}}
                            >
                            <View style={{justifyContent:'center',alignContent:'center', flex:1}}>
                                <Text style={styles.buttonText}>לקבלת קופונים</Text>
                            </View>
                                <Text style={styles.comingSoon}>בקרוב!</Text>
                            
                        </TouchableOpacity>
                        </View>
                    </View>
                    <Footer/>
            </SafeAreaView>
            </>
        )
    }
    
}
const styles = StyleSheet.create({
    body:{
        backgroundColor:'#fff',
        paddingTop: 0,
        paddingHorizontal:0,
        marginHorizontal:-1,
        flex:1,
        elevation:19,
    },
    buttonText: {
        textAlign: 'center',
        fontSize:24,
        fontWeight:'bold',
        color:myColor.darkBlue,
    },
    toRate:{
        fontSize:28,
        fontWeight:'bold',
        color:myColor.darkBlue,
    },
    touchables:{
        justifyContent:'center',
        alignItems:'center',
        flex:1,
        padding:4,
        borderColor:myColor.darkBlue,
        borderWidth:1,
        borderRadius:5,
        
    },
    
    touchableContainer:{
        flex:1,
        backgroundColor:myColor.lightBlue,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row-reverse',
        borderColor:'#fff',
        borderWidth:1,
        padding:4,
        
    },
    comingSoon:{
        textAlign: 'justify',
        padding: 10,
        fontSize:22,
        color:myColor.red,
        fontWeight:'bold',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },  
})