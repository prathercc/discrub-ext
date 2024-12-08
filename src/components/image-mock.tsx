import MuiImg from "../common-components/mui-img/mui-img.tsx";
import { SxProps } from "@mui/material";
import { ResolutionType } from "../enum/resolution-type.ts";

type ImageMockProps = {
  url: string | undefined;
  width: number;
  height: number;
  resMode: string;
};

const ImageMock = ({ url, width, height, resMode }: ImageMockProps) => {
  return (
    <>
      {url && (
        <a target="_blank" rel="noopener noreferrer" href={url}>
          <MuiImg
            props={{
              src: url,
              alt: "attachment",
            }}
            sx={{
              transition: "all ease-in-out .5s",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: "4px 5px 6px 0px rgba(0,0,0,0.75)",
              ...getMediaResProps(resMode, width, height),
            }}
          />
        </a>
      )}
    </>
  );
};

const getMediaResProps = (
  resMode: string,
  fullWidth: number,
  fullHeight: number,
): SxProps => {
  const thumbnailWidth = 100;
  const thumbnailHeight = 100;
  const safeWidth = 400;
  const safeHeight = 400;

  const thumbnailProps = {
    width: fullWidth < thumbnailWidth ? fullWidth : thumbnailWidth,
    height: fullHeight < thumbnailHeight ? fullHeight : thumbnailHeight,
  };
  const fullProps = { width: fullWidth, height: fullHeight };
  const safeProps = {
    width: fullWidth > safeWidth ? safeWidth : fullWidth,
    height: fullHeight > safeHeight ? safeHeight : fullHeight,
  };

  switch (resMode) {
    case ResolutionType.HOVER_LIMITED:
      return {
        ...thumbnailProps,
        "&:hover": {
          ...safeProps,
        },
      };
    case ResolutionType.HOVER_FULL:
      return {
        ...thumbnailProps,
        "&:hover": {
          ...fullProps,
        },
      };
    case ResolutionType.NO_HOVER_FULL:
      return {
        ...fullProps,
      };
    case ResolutionType.NO_HOVER_LIMITED:
      return {
        ...safeProps,
      };
    default:
      return {};
  }
};
export default ImageMock;
