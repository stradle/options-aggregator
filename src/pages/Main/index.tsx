import { useLocalStorage } from "react-use";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, CircularProgress } from "@mui/material";
import DealsTable from "./DealsTable";
import AggregatedTable from "./AggregatedTable";
import { useRatesContext } from "../../exchanges/RatesProvider";

enum Tabs {
  DEALS = "DEALS",
  MARKETS = "MARKETS",
}

const Main = () => {
  const [tab = Tabs.DEALS, setTab] = useLocalStorage<Tabs>("tab", Tabs.DEALS);
  const rates = useRatesContext();
  const showLoader = Object.values(rates).some((rates) => !rates);

  return (
    <Box>
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
          {showLoader ? (
            <div
              style={{
                margin: "5rem",
                alignItems: "center",
                display: "flex",
                gap: "1rem",
              }}
            >
              <CircularProgress />
              Aggregating data...
            </div>
          ) : (
            <>
              <TabPanel value={Tabs.DEALS}>
                <DealsTable />
              </TabPanel>
              <TabPanel value={Tabs.MARKETS}>
                <AggregatedTable />
              </TabPanel>
            </>
          )}
        </div>
      </TabContext>
    </Box>
  );
};

export default Main;
