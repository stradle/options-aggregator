import { chain, groupBy } from "lodash";
import styled from "styled-components";
import { Box, Divider } from "@mui/material";

import { useRatesContext } from "../../exchanges/RatesProvider";
import { formatCurrency, useExpirations, useStrikes } from "../../services/util";
import { ColoredOptionType, StyledTable, Loader, ProviderIcon } from "../../components";
import { Option, OptionsMap, OptionType } from "../../types";
import { StyledProviderLink } from "../styled";

const StyledOptionType = styled(ColoredOptionType)`
  height: 20px;
  min-width: 40px;
  text-align: end;
  color: ${({ color }) => color};
`;

const OptionValue = ({ option }: { option?: Option }) =>
  option?.askPrice ? (
    <StyledOptionType type={option.type}>{formatCurrency(option.askPrice)}</StyledOptionType>
  ) : (
    <StyledOptionType />
  );

const OptionsCouple = ({ optionCouple }: { optionCouple: OptionsMap }) => {
  const { [OptionType.CALL]: call, [OptionType.PUT]: put } = optionCouple.options;

  return (
    <StyledProviderLink provider={optionCouple.provider}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}>
        <OptionValue option={call} />
        <OptionValue option={put} />
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
    <Box>
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

                  if (!termStrikeOptions.length) return <td key={term} />;

                  return (
                    <td key={term}>
                      <StyledCell>
                        {providers.map((provider, index) => {
                          const optionCouple = termStrikeOptions.find(
                            (option) => option.provider === provider
                          );

                          return (
                            <>
                              {optionCouple ? (
                                <OptionsCouple key={provider} optionCouple={optionCouple} />
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
