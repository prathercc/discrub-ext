export const toggleDebugPause = async (callback, message, time = 500) => {
  callback(message);
  await new Promise((resolve) => setTimeout(resolve, time));
  callback("");
};
