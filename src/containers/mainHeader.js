import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { CommonActions ,StackActions} from '@react-navigation/native';
import myColors from '../styles/colors'
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const ImageHeader = () => (
    <View
        style={{ 
            flexDirection: 'row' ,backgroundColor:'transparent',
            flex: 1, alignItems: "center", justifyContent: "center",
        }}
    > 
      <Image
        style={{
            width: 200/1.5,
            height: 90/1.5,
            // marginLeft: 15,
            backgroundColor:'transparent'
          }}
        
        source={require('../img/yoldot_logo.png')}
      />
    </View>
);
const BackButton =(props)=>(
    <TouchableOpacity style={styles.base}
                onPress={() => {
                    props.logState();
                    const resetAction = CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                      props.navigation.dispatch(resetAction)
                }}>
                    <View style={{}
                        // styles.baseBottom
                        } >
                        <Text style={{fontSize:10,fontWeight:'bold', color:myColors.red}}>התנתקות</Text>
                    </View>
                </TouchableOpacity> 
);

const styles = StyleSheet.create({
    base: {
        marginRight:15,
        // marginVertical:10,
        flex: 1, alignItems: 'flex-end', justifyContent: "center",
    },
    baseBottom: {
        backgroundColor: myColors.red,
        opacity:0.8,
        borderRadius:5,
        height: 90/1.5 - 30,
        width: 50,
        justifyContent:'center',
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 9,
        },
        shadowOpacity: 0.50,
        shadowRadius: 12.35,
        elevation: 19,
    }
})
const MainHeader = (props) =>(
    <View style={{
            height:90/1.5,
            flexDirection:'row',
            justifyContent:'space-between', 
            marginVertical:5,
            }}>
        <ImageHeader {...props}/>
        <BackButton {...props}/>
    </View>
)
export default MainHeader;
