import { DialogTitle, IconButton } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

type EnhancedDialogTitleProps = {
  title: string;
  onClose: () => void;
};

const EnhancedDialogTitle = ({ title, onClose }: EnhancedDialogTitleProps) => {
  return (
    <>
      <DialogTitle sx={{ padding: "10px 24px 0px 24px" }}>{title}</DialogTitle>
      <IconButton
        size="small"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
    </>
  );
};

export default EnhancedDialogTitle;
