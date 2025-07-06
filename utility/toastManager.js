import Toast from "react-native-root-toast";

let lastToastTime = 0;
const debounceDuration = 5000; // 5 seconds

const showDebouncedToast = (message, options = {}) => {
  const now = Date.now();
  if (now - lastToastTime < debounceDuration) return;

  lastToastTime = now;

  Toast.show(message, {
    duration: Toast.durations.LONG,
    position: Toast.positions.BOTTOM,
    ...options,
  });
};

export default {
  show: showDebouncedToast,
};
