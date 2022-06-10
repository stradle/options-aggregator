import { filter, maxBy, minBy } from "lodash";
import styled from "styled-components";
import { useLocalStorage } from "react-use";
import { Button, ButtonGroup, Divider, FormControlLabel, Switch } from "@mui/material";
import { useRatesData } from "../../services/hooks";
import { formatCurrency, useExpirations, useStrikes } from "../../services/util";
import { useRatesContext } from "../../providers/RatesProvider";
import { ColoredOptionType, ProviderIcon, StyledTable } from "../../components";
import { ConfigSection, PageWrapper, StyledProviderLink } from "../styled";
import { Option, OptionsMap, OptionType } from "../../types";

enum DealModes {
  BUY = "Buy",
  SELL = "Sell",
}

const StyledOptionType = styled(ColoredOptionType)<{ highlight?: boolean }>`
  height: 20px;
  line-height: 20px;
  text-align: end;
  border-radius: 4px;
  width: fit-content;
  ${({ highlight }) =>
    highlight &&
    `    
     border: 1px solid rgba(255, 255, 255, 0.088);
     background-color: rgba(144,202,249,0.1)
  `}
`;
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
}: {
  optionCouple: OptionsMap;
  markCheap: { call: boolean; put: boolean };
  dealMode: DealModes;
}) => {
  const { [OptionType.CALL]: call, [OptionType.PUT]: put } = optionCouple.options;

  return (
    <StyledProviderLink provider={optionCouple.provider}>
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

const StyledCell = styled.div`
  display: flex;
  gap: 3px;
`;

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

  return (
    <PageWrapper gap={"10px"}>
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
                  {term}
                  <StyledCell>
                    {providers?.map((provider, index) => (
                      <>
                        <StyledProviderLink
                          provider={provider}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          <ProviderIcon provider={provider} />
                        </StyledProviderLink>
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
                <th key={strike}>{formatCurrency(+strike)}</th>
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
                                />
                              ) : (
                                <div style={{ flex: 1 }} />
                              )}
                              {index !== providers.length - 1 && (
                                <Divider orientation="vertical" flexItem variant={"middle"} />
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
