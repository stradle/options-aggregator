import { filter, maxBy, minBy } from "lodash";
import { useLocalStorage } from "react-use";
import {
  alpha,
  Button,
  ButtonGroup,
  Divider,
  FormControlLabel,
  styled,
  Switch,
  Typography,
} from "@mui/material";
import { useRatesData } from "../../services/hooks";
import { formatCurrency, useExpirations, useStrikes } from "../../services/util";
import { useRatesContext } from "../../providers/RatesProvider";
import useOptionPopover from "./useOptionPopover";
import { ColoredOptionType, ProviderIcon, StyledTable } from "../../components";
import { ConfigSection, PageWrapper, StyledProviderLink } from "../styled";
import { Option, OptionsMap, OptionType } from "../../types";
import { OptionTypeColors } from "../../services/util/constants";

enum DealModes {
  BUY = "Buy",
  SELL = "Sell",
}

const StyledOptionType = styled(ColoredOptionType)<{ highlight?: boolean; type?: OptionType }>(
  ({ highlight, theme, type }) => ({
    color: OptionTypeColors[type ?? OptionType.CALL],
    height: "20px",
    lineHeight: "20px",
    textAlign: "end",
    borderRadius: "4px",
    width: "fit-content",
    border: highlight ? "1px solid" : "",
    borderColor: theme.palette.divider,
    backgroundColor: highlight
      ? alpha(theme.palette.text.primary, theme.palette.action.focusOpacity)
      : "",
  })
);
const StyledCell = styled("div")({
  display: "flex",
  gap: "3px",
});

const TableHeader = ({ text }: { text: string }) => {
  return <Typography fontWeight={500}>{text}</Typography>;
};

const DealsFields = {
  [DealModes.BUY]: "askPrice",
  [DealModes.SELL]: "bidPrice",
};

const OptionValue = ({
  option,
  highlight,
  dealMode,
}: {
  option?: Option;
  highlight?: boolean;
  dealMode: DealModes;
}) => (
  <StyledOptionType highlight={highlight} type={option?.type}>
    {
      // @ts-ignore
      option?.askPrice && formatCurrency(option[DealsFields[dealMode]])
    }
  </StyledOptionType>
);

const OptionsCouple = ({
  optionCouple,
  markCheap,
  dealMode,
  onClick,
}: {
  optionCouple: OptionsMap;
  markCheap: { call: boolean; put: boolean };
  dealMode: DealModes;
  onClick: (event: React.MouseEvent, option: OptionsMap) => void;
}) => {
  const { [OptionType.CALL]: call, [OptionType.PUT]: put } = optionCouple.options;

  return (
    <StyledProviderLink onClick={(event) => onClick(event, optionCouple)}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: "40px",
          alignItems: "end",
        }}>
        <OptionValue dealMode={dealMode} highlight={markCheap.call} option={call} />
        <OptionValue dealMode={dealMode} highlight={markCheap.put} option={put} />
      </div>
    </StyledProviderLink>
  );
};

const buyAskOptions = Object.values(DealModes);

const DealModeSelector = ({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: DealModes) => void;
}) => {
  return (
    <ButtonGroup variant="outlined">
      {buyAskOptions.map((asset) => (
        <Button
          key={asset}
          variant={asset === value ? "contained" : undefined}
          onClick={() => setValue(asset)}>
          {asset}
        </Button>
      ))}
    </ButtonGroup>
  );
};

const compare = (options: OptionsMap[], type: OptionType, mode: DealModes) => {
  const field = DealsFields[mode];
  const compareFunc = mode === DealModes.BUY ? minBy : maxBy;

  return (
    filter(options, `options.${type}.${field}`).length > 1 &&
    compareFunc(options, `options.${type}.${field}`)?.provider
  );
};

const AggregatedRates = () => {
  const [highlight, setHighlight] = useLocalStorage("highlight", false);
  const [dealMode = DealModes.BUY, setDealMode] = useLocalStorage("ask-bid", DealModes.BUY);
  const rates = useRatesContext();
  const { allStrikes = [] } = useStrikes();

  const [expirations] = useExpirations(rates.DERIBIT);
  const { allRates, termProviders } = useRatesData(dealMode === DealModes.SELL);

  const { handleOpen, OptionPopover } = useOptionPopover();

  return (
    <PageWrapper gap={"10px"}>
      {OptionPopover}
      <ConfigSection>
        <DealModeSelector value={dealMode} setValue={setDealMode} />
        <FormControlLabel
          control={<Switch checked={highlight} onChange={(e) => setHighlight(e.target.checked)} />}
          label="Best value"
          sx={{
            userSelect: "none",
          }}
        />
      </ConfigSection>
      <StyledTable>
        <thead>
          <tr>
            <th key={1}>
              <ColoredOptionType type={OptionType.CALL}>CALL</ColoredOptionType>
              <ColoredOptionType type={OptionType.PUT}>PUT</ColoredOptionType>
            </th>
            {expirations.map(([term]) => {
              const providers = termProviders[term];

              return (
                <th key={term}>
                  <TableHeader text={term} />
                  <StyledCell>
                    {providers?.map((provider, index) => (
                      <>
                        <div
                          style={{
                            flex: 1,
                          }}>
                          <ProviderIcon provider={provider} />
                        </div>
                        {index !== providers.length - 1 && (
                          <Divider orientation="vertical" flexItem />
                        )}
                      </>
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
                    highlight && compare(termStrikeOptions, OptionType.CALL, dealMode);
                  const cheapestPutProvider =
                    highlight && compare(termStrikeOptions, OptionType.PUT, dealMode);

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
                            <>
                              {optionCouple ? (
                                <OptionsCouple
                                  key={provider}
                                  markCheap={markCheap}
                                  dealMode={dealMode}
                                  optionCouple={optionCouple}
                                  onClick={handleOpen}
                                />
                              ) : (
                                <div style={{ flex: 1 }} />
                              )}
                              {index !== providers.length - 1 && (
                                <Divider orientation="vertical" flexItem variant="middle" />
                              )}
                            </>
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
    </PageWrapper>
  );
};

export default AggregatedRates;
