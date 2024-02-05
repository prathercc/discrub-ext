import { styled, SxProps } from "@mui/system";

const StyledImg = styled("img", { shouldForwardProp: (prop) => prop !== "sx" })(
  {}
);

export default function MuiImg({
  sx,
  props,
}: {
  sx: SxProps;
  props: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
}) {
  return <StyledImg {...props} sx={sx} />;
}
