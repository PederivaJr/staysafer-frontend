import Toast from "react-native-root-toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useSafeToast() {
  const insets = useSafeAreaInsets();

  return (message, duration = Toast.durations.LONG) => {
    Toast.show(message, {
      duration,
      position: Toast.positions.BOTTOM - insets.bottom - 16,
      shadow: true,
      animation: true,
      hideOnPress: true,
    });
  };
}
