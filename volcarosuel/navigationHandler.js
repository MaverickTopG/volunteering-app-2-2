// navigationHandler.js
export const handleNavigation = (navigation, item) => {
    if (navigation && navigation.navigate) {
      navigation.navigate('DisplayScreen', { item });
    } else {
      console.error("Navigation object is undefined");
    }
  };
  