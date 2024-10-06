import React, { useContext } from 'react';
import { Button } from 'react-native';
import { AuthContext } from './AuthContext'; // Adjust path

const LogoutButton = () => {
  const { signOut } = useContext(AuthContext);

  return <Button title="Logout" onPress={signOut} />;
};

export default LogoutButton;
