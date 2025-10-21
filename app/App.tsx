import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Index from "./index";
import {
  registerBackgroundFetch,
  unregisterBackgroundFetch,
} from "../app/tasks/backgroundTask";

const App = () => {
  useEffect(() => {
    // Register the background fetch task when the app starts
    registerBackgroundFetch();

    // Optional: Unregister the task when the app is unmounted (cleanup)
    return () => {
      unregisterBackgroundFetch();
    };
  }, []);

  return (
    <NavigationContainer>
      <Index />
    </NavigationContainer>
  );
};

export default App;
