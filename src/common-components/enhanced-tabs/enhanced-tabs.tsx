import { AppBar, Box, Tab, Tabs, useTheme } from "@mui/material";
import { ReactNode, useState } from "react";

export type EnhancedTab = {
  label: string;
  disabled?: boolean;
  getComponent: () => ReactNode;
};
type EnhancedTabsProps = {
  tabs: EnhancedTab[];
};

const EnhancedTabs = ({ tabs }: EnhancedTabsProps) => {
  const theme = useTheme();
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  return (
    <Box sx={{ width: "100%" }}>
      <AppBar position="static" sx={{ marginBottom: theme.spacing(1) }}>
        <Tabs
          value={selectedTabIndex}
          onChange={(_, idx) => setSelectedTabIndex(idx)}
          centered
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab disabled={!!tab.disabled} label={tab.label} />
          ))}
        </Tabs>
      </AppBar>
      {tabs[selectedTabIndex].getComponent()}
    </Box>
  );
};

export default EnhancedTabs;
