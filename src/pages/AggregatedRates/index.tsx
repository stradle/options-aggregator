import { Fragment } from "react";
import { filter, maxBy, minBy } from "lodash";
import { useLocalStorage } from "react-use";
import {
  Button,
  ButtonGroup,
  Divider,
  FormControlLabel,
  Paper,
  styled,
  Switch,
  Typography,
} from "@mui/material";
import { useRatesData } from "../../services/hooks";
import {
  formatCurrency,
  useExpirations,
  useStrikes,
} from "../../services/util";
import { useRatesContext } from "../../context/RatesProvider";
import { ColoredOptionType, ProviderIcon, StyledTable } from "../../components";
import ProviderSelector from "../../components/ProviderSelector";
import OptionValue from "../../components/OptionValue";
import { ConfigSection, PageWrapper } from "../styled";
import { BuySellModes, DealsFields, OptionsMap, OptionType } from "../../types";

const StyledCell = styled("div")({
  display: "flex",
  gap: "3px",
});

const TableHeader = ({ text }: { text: string }) => {
  return <Typography fontWeight={500}>{text}</Typography>;
};

const StyledOptionCouple = styled("div")`
  display: flex;
  flex-direction: column;
  min-width: 40px;
  align-items: end;
  flex: 1;
`;

const OptionsCouple = ({
  optionCouple,
  markCheap,
  dealMode,
}: {
  optionCouple: OptionsMap;
  markCheap: { call: boolean; put: boolean };
  dealMode: BuySellModes;
}) => {
  return (
    <StyledOptionCouple>
      <OptionValue
        dealMode={dealMode}
        highlight={markCheap.call}
        instrument={optionCouple.CALL}
      />
      <OptionValue
        dealMode={dealMode}
        highlight={markCheap.put}
        instrument={optionCouple.PUT}
      />
    </StyledOptionCouple>
  );
};

const buyAskOptions = Object.values(BuySellModes);

const DealModeSelector = ({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: BuySellModes) => void;
}) => {
  return (
    <ButtonGroup variant="outlined">
      {buyAskOptions.map((asset) => (
        <Button
          key={asset}
          variant={asset === value ? "contained" : undefined}
          onClick={() => setValue(asset)}
        >
          {asset}
        </Button>
      ))}
    </ButtonGroup>
  );
};

const compare = (
  options: OptionsMap[],
  type: OptionType,
  mode: BuySellModes
) => {
  const field = DealsFields[mode];
  const compareFunc = mode === BuySellModes.BUY ? minBy : maxBy;

  return (
    filter(options, `${type}.${field}`).length > 1 &&
    compareFunc(options, `${type}.${field}`)?.provider
  );
};

const AggregatedRates = () => {
  const [highlight, setHighlight] = useLocalStorage("highlight", false);
  const [dealMode = BuySellModes.BUY, setDealMode] = useLocalStorage(
    "ask-bid",
    BuySellModes.BUY
  );
  const rates = useRatesContext();
  const { allStrikes = [] } = useStrikes();
  const expirations = useExpirations(rates.LYRA);
  const { allRates, termProviders } = useRatesData(
    dealMode === BuySellModes.SELL
  );

  return (
    <PageWrapper gap={"10px"} width={"100%"}>
      <ConfigSection sx={{ justifyContent: "space-between", width: "100%" }}>
        <DealModeSelector value={dealMode} setValue={setDealMode} />
        <FormControlLabel
          control={
            <Switch
              checked={highlight}
              onChange={(e) => setHighlight(e.target.checked)}
            />
          }
          label="Best value"
          sx={{
            userSelect: "none",
          }}
        />
        <ProviderSelector />
      </ConfigSection>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <StyledTable>
          <thead>
            <tr>
              <th key={1}>
                <div>
                  <ColoredOptionType positive>CALL</ColoredOptionType>
                </div>
                <div>
                  <ColoredOptionType>PUT</ColoredOptionType>
                </div>
              </th>
              {expirations.map(([term]) => {
                const providers = termProviders[term];

                return (
                  <th key={term}>
                    <TableHeader text={term} />
                    <StyledCell>
                      {providers?.map((provider, index) => (
                        <Fragment key={provider}>
                          <div
                            style={{
                              flex: 1,
                            }}
                          >
                            <ProviderIcon provider={provider} />
                          </div>
                          {index !== providers.length - 1 && (
                            <Divider orientation="vertical" flexItem />
                          )}
                        </Fragment>
                      ))}
                    </StyledCell>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {allStrikes.map((strike) => {
              return (
                <tr key={strike}>
                  <th key={strike}>
                    <TableHeader text={formatCurrency(+strike)} />
                  </th>
                  {expirations.map(([term]) => {
                    const termStrikeOptions = allRates[term][strike];
                    const providers = termProviders[term];

                    const cheapestCallProvider =
                      highlight &&
                      compare(termStrikeOptions, OptionType.CALL, dealMode);
                    const cheapestPutProvider =
                      highlight &&
                      compare(termStrikeOptions, OptionType.PUT, dealMode);

                    if (!termStrikeOptions?.length) return <td key={term} />;

                    return (
                      <td key={term}>
                        <StyledCell>
                          {providers.map((provider, index) => {
                            const optionCouple = termStrikeOptions.find(
                              (option) => option.provider === provider
                            );
                            const markCheap = {
                              call: cheapestCallProvider === provider,
                              put: cheapestPutProvider === provider,
                            };

                            return (
                              <Fragment key={provider}>
                                {optionCouple ? (
                                  <OptionsCouple
                                    markCheap={markCheap}
                                    dealMode={dealMode}
                                    optionCouple={optionCouple}
                                  />
                                ) : (
                                  <div style={{ flex: 1 }} />
                                )}
                                {index !== providers.length - 1 && (
                                  <Divider
                                    flexItem
                                    orientation="vertical"
                                    variant="middle"
                                  />
                                )}
                              </Fragment>
                            );
                          })}
                        </StyledCell>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </StyledTable>
      </Paper>
    </PageWrapper>
  );
};

export default AggregatedRates;
