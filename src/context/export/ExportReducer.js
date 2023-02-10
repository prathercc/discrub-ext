export const DmReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    default:
      return { ...state, ...payload };
  }
};
