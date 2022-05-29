import { chain, groupBy } from "lodash";
import styled from "styled-components";
import { useRatesContext } from "../../exchanges/RatesProvider";
import { formatCurrency, useExpirations, useStrikes } from "../../util";
import ProviderIcon from "../../components/ProviderIcon";
import { OptionsMap, OptionType } from "../../types";
import { StyledTable } from "./styled";
import { Paper } from "@mui/material";

const RowHeader = styled.td`
  font-weight: 600;
`;

const StyledOptionCouple = styled(Paper).attrs((props) => ({
  ...props,
  variant: "outlined",
}))`
  display: flex;
  align-items: center;
  padding: 1px;
  flex: 1;
`;

const StyledOptionValue = styled.div<{ color?: string }>`
  height: 20px;
  min-width: 40px;
  text-align: end;
  color: ${({ color }) => color};
`;

const OptionValue = ({ type, price }: { price?: number; type: OptionType }) =>
  price ? (
    <StyledOptionValue color={type === OptionType.CALL ? "#32C47A" : "#EB5757"}>
      ${Math.round(price)}
    </StyledOptionValue>
  ) : (
    <StyledOptionValue />
  );

const OptionsCouple = ({ optionCouple }: { optionCouple?: OptionsMap }) => {
  if (!optionCouple) return <div style={{ flex: 1 }} />;
  const { [OptionType.CALL]: call, [OptionType.PUT]: put } =
    optionCouple.options;

  return (
    <StyledOptionCouple>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <OptionValue type={OptionType.CALL} price={call?.askPrice} />
        <OptionValue type={OptionType.PUT} price={put?.askPrice} />
      </div>
    </StyledOptionCouple>
  );
};

type TermStrikesOptions = {
  [term: string]: { [strike: string]: OptionsMap[] };
};

const AggregatedTable = () => {
  const rates = useRatesContext();
  const { allStrikes = [] } = useStrikes();

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

  return (
    <StyledTable>
      <thead>
        <tr>
          <td>Strike/Term</td>
          {expirations.map(([term]) => {
            return (
              <th style={{ fontWeight: 600 }} key={term}>
                {term}
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  {termProviders[term]?.map((provider) => (
                    <div style={{ flex: 1 }}>
                      <ProviderIcon provider={provider} />
                    </div>
                  ))}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {deribitStrikes.map((strike) => {
          return (
            <tr key={strike}>
              <RowHeader key={strike}>{formatCurrency(+strike)}</RowHeader>
              {expirations.map(([term]) => {
                const deribitCouple = rates.DERIBIT?.find(
                  (optionMap) =>
                    optionMap.term === term && optionMap.strike === strike
                );
                const lyraCouple = rates.LYRA?.find(
                  (optionMap) =>
                    optionMap.term === term && optionMap.strike === strike
                );
                const premiaCouple = rates.PREMIA?.find(
                  (optionMap) =>
                    optionMap.term === term && optionMap.strike === strike
                );

                if (!deribitCouple && !lyraCouple && !premiaCouple)
                  return <td key={term} />;

                const providers = termProviders[term];
                const termStrikeOptions = allRates[term][strike];

                return (
                  <td key={term}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      {providers.map((provider) => (
                        <OptionsCouple
                          optionCouple={termStrikeOptions.find(
                            (option) => option.provider === provider
                          )}
                        />
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </StyledTable>
  );
};

export default AggregatedTable;
