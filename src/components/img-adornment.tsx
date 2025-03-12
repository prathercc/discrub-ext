import React from "react";

type ImgAdornmentProps = {
  src: string;
  style?: React.CSSProperties;
};
const ImgAdornment = ({ src, style = {} }: ImgAdornmentProps) => {
  return (
    <img
      style={{ width: "24px", height: "24px", borderRadius: "50px", ...style }}
      src={src}
      alt={`img-adornment-${src}`}
    />
  );
};

export default ImgAdornment;
