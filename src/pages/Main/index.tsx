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
    // @ts-ignore
    <TabContext value={tab}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <TabList
          onChange={(_, val) => setTab(val)}
          aria-label="lab API tabs example"
        >
          <Tab label="Deals chart" value={Tabs.DEALS} />
          <Tab label="Aggregated rates" value={Tabs.MARKETS} />
        </TabList>
      </Box>
      <TabPanel value={Tabs.DEALS}>
        <DealsTable />
      </TabPanel>
      <TabPanel value={Tabs.MARKETS}>
        <AggregatedTable />
      </TabPanel>
    </TabContext>
  );
};

export default Main;
