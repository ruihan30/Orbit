import { Appbar, Badge } from "react-native-paper"
import { View, Text } from "react-native"
import { User, Bell, ArrowLeft } from "phosphor-react-native"
import Logo from '../../assets/logo_name_nopad.svg';
import { COLORS } from "../colors/colors";
import { styles } from "../styles/styles";
import { useNavigation } from "@react-navigation/native";

export const TopBar = ({ title, left=false }) => {
  const navigation = useNavigation();

  return (
    <Appbar.Header 
      mode='small' 
      style={{backgroundColor: COLORS.white, height: 58}}
      elevated={true}
    > 
      {left && (
        <Appbar.Action
        icon={() => 
          <View style={styles.iconWrapper}>
            <ArrowLeft size={24} color={COLORS.grey700} weight='regular' />
          </View>
        } 
        onPress={() => navigation.goBack()} 
      />
      )}

      <Appbar.Content 
        style={{flex: 1}} 
        title={title}
        titleStyle={styles.header}
      ></Appbar.Content>

      {!left && (
        <>
          <Appbar.Action 
            style={styles.action}
            icon={() => 
              <View style={styles.iconWrapper}>
                <User size={24} color={COLORS.grey700} weight='regular' />
              </View>
            } 
            onPress={() => navigation.navigate('Profile')} 
          />
          
          <Appbar.Action 
            style={styles.action} 
            icon={() => 
              <View style={styles.iconWrapper}>
                {/* <Badge size={10} style={styles.badge}></Badge> */}
                <Bell size={24} color={COLORS.grey700} weight='regular' />
              </View>
            } 
            onPress={() => {}} 
          />
        </>
      )}

      
    </Appbar.Header>
  );

}