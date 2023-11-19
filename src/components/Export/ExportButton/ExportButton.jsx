import React, { useRef } from "react";
import { Button } from "@mui/material";
import ExportMessages from "../../Export/ExportMessages/ExportMessages";
import ExportModal from "../../Modals/ExportModal/ExportModal";
import { useDispatch, useSelector } from "react-redux";
import {
  resetExportSettings,
  selectExport,
} from "../../../features/export/exportSlice";

const ExportButton = ({
  dialogOpen,
  setDialogOpen,
  isDm = false,
  bulk = false,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const { isGenerating } = useSelector(selectExport);

  const exportType = isDm ? "DM" : "Guild";

  const contentRef = useRef();

  return (
    <>
      <Button
        disabled={disabled}
        onClick={async () => {
          dispatch(resetExportSettings());
          setDialogOpen(true);
        }}
        variant="contained"
      >
        Export {bulk ? exportType : "Messages"}
      </Button>
      {isGenerating && <ExportMessages componentRef={contentRef} bulk={bulk} />}
      <ExportModal
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        bulk={bulk}
        isDm={isDm}
        contentRef={contentRef}
      />
    </>
  );
};

export default ExportButton;
