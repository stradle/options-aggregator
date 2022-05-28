import DealsTable from "./DealsTable";
import AggregatedTable from "./AggregatedTable";
import { useLocalStorage } from "react-use";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box } from "@mui/material";
enum Tabs {
  DEALS = "DEALS",
  MARKETS = "MARKETS",
}

const Main = () => {
  const [tab, setTab] = useLocalStorage<Tabs>("tab", Tabs.MARKETS);

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
      }}
    >
      {/*@ts-ignore*/}
      <TabContext value={tab}>
        <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
          <TabList
            onChange={(_, val) => setTab(val)}
            aria-label="lab API tabs example"
            orientation="vertical"
            sx={{ borderRight: 1, borderColor: "divider" }}
          >
            <Tab label="Deals chart" value={Tabs.DEALS} />
            <Tab label="Aggregated rates" value={Tabs.MARKETS} />
          </TabList>
          <TabPanel value={Tabs.DEALS}>
            <DealsTable />
          </TabPanel>
          <TabPanel value={Tabs.MARKETS}>
            <AggregatedTable />
          </TabPanel>
        </div>
      </TabContext>
    </Box>
  );
};

export default Main;
