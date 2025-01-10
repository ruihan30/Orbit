import { BottomNavigation } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';

const CustomTabBar = ({ navigation, state, descriptors, insets }) => {
  return (
    <BottomNavigation.Bar
      navigationState={state}
      safeAreaInsets={insets}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (event.defaultPrevented) {
          preventDefault();
        } else {
        navigation.dispatch({
            ...CommonActions.navigate(route.name, route.params),
            target: state.key,
          });
        }
      }}
      renderIcon={({ route, focused, color }) => {
        const { options } = descriptors[route.key];
        if (options.tabBarIcon) {
          return options.tabBarIcon({ focused, color, size: 28 });
        }

        return null;
      }}
      getLabelText={({ route }) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.title;

        return label;
      }}
      barStyle={{
        paddingTop: 0,  // Adjust top padding
        paddingBottom: 10,  // Adjust bottom padding
        paddingHorizontal: 20,  // Adjust horizontal padding
        height: 200,  // Adjust overall height of the bottom bar
      }}
    />
  );
}

export default CustomTabBar;