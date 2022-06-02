import { chain, filter, groupBy, minBy } from "lodash";
import styled from "styled-components";
import { Box, Divider, FormControlLabel, Switch } from "@mui/material";

import { useRatesContext } from "../../exchanges/RatesProvider";
import { formatCurrency, useExpirations, useStrikes } from "../../services/util";
import {
  ColoredOptionType,
  StyledTable,
  Loader,
  ProviderIcon,
  BasePriceWidget,
} from "../../components";
import { Option, OptionsMap, OptionType } from "../../types";
import { StyledProviderLink } from "../styled";
import { useState } from "react";

const StyledOptionType = styled(ColoredOptionType)<{ highlight?: boolean }>`
  height: 20px;
  //min-width: 40px;
  text-align: end;
  border-radius: 4px;
  width: fit-content;
  ${({ highlight }) => highlight && "background-color: rgba(144,202,249,0.1)"}
`;

const OptionValue = ({ option, highlight }: { option?: Option; highlight?: boolean }) =>
  option?.askPrice ? (
    <StyledOptionType highlight={highlight} type={option.type}>
      {formatCurrency(option.askPrice)}
    </StyledOptionType>
  ) : (
    <StyledOptionType />
  );

const OptionsCouple = ({
  optionCouple,
  markCheap,
}: {
  optionCouple: OptionsMap;
  markCheap: { call: boolean; put: boolean };
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
        <OptionValue highlight={markCheap.call} option={call} />
        <OptionValue highlight={markCheap.put} option={put} />
      </div>
    </StyledProviderLink>
  );
};

type TermStrikesOptions = {
  [term: string]: { [strike: string]: OptionsMap[] };
};

const StyledCell = styled.div`
  display: flex;
  gap: 3px;
`;

const AggregatedRates = () => {
  const [highlight, setHighlight] = useState(false);
  const rates = useRatesContext();
  const { allStrikes = [] } = useStrikes();
  const showLoader = Object.values(rates).some((rates) => !rates);

  const [expirations] = useExpirations(rates.DERIBIT);

  const deribitStrikes = chain(rates.DERIBIT)
    .map("strike")
    .uniq()
    .filter((val) => allStrikes.includes(+val))
    .sortBy((strike) => +strike)
    .value();

  const allRates = chain(rates)
    .values()
    .flatten()
    .groupBy("term")
    .mapValues((optionsMap: OptionsMap) => groupBy(optionsMap, "strike"))
    .value() as unknown as TermStrikesOptions;

  const termProviders = chain(allRates)
    .mapValues((strikeOptions) =>
      chain(strikeOptions).values().max().map("provider").sort().value()
    )
    .value();

  if (showLoader) {
    return <Loader />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-around" }}></div>
      <BasePriceWidget />
      <FormControlLabel
        control={<Switch checked={highlight} onChange={(e) => setHighlight(e.target.checked)} />}
        label="Highlight cheapest"
      />
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
          {deribitStrikes.map((strike) => {
            return (
              <tr key={strike}>
                <th key={strike}>{formatCurrency(+strike)}</th>
                {expirations.map(([term]) => {
                  const termStrikeOptions = allRates[term][strike];
                  const providers = termProviders[term];

                  const cheapestCallProvider =
                    highlight &&
                    filter(termStrikeOptions, "options.CALL.askPrice").length > 1 &&
                    minBy(termStrikeOptions, "options.CALL.askPrice")?.provider;
                  const cheapestPutProvider =
                    highlight &&
                    filter(termStrikeOptions, "options.PUT.askPrice").length > 1 &&
                    minBy(termStrikeOptions, "options.PUT.askPrice")?.provider;

                  if (!termStrikeOptions.length) return <td key={term} />;

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
                                  markCheap={markCheap}
                                  key={provider}
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
    </Box>
  );
};

export default AggregatedRates;
