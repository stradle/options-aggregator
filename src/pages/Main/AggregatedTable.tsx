import { chain, groupBy } from "lodash";
import styled from "styled-components";
import { Divider } from "@mui/material";
import { useRatesContext } from "../../exchanges/RatesProvider";
import { formatCurrency, useExpirations, useStrikes } from "../../util";
import ProviderIcon from "../../components/ProviderIcon";
import { ColoredOptionType, StyledTable } from "./styled";
import { Option, OptionsMap, OptionType } from "../../types";

const StyledOptionCouple = styled.div`
  display: flex;
  align-items: center;
  padding: 1px;
  flex: 1;
`;
const StyledOptionValue = styled(ColoredOptionType)`
  height: 20px;
  min-width: 40px;
  text-align: end;
  color: ${({ color }) => color};
`;
const OptionValue = ({ option }: { option?: Option }) =>
  option?.askPrice ? (
    <StyledOptionValue type={option.type}>
      {formatCurrency(option.askPrice)}
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
        <OptionValue option={call} />
        <OptionValue option={put} />
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
          <th style={{ display: "flex", flexDirection: "column" }} key={1}>
            <ColoredOptionType type={OptionType.CALL}>CALL</ColoredOptionType>
            <ColoredOptionType type={OptionType.PUT}>PUT</ColoredOptionType>
          </th>
          {expirations.map(([term]) => {
            const providers = termProviders[term];

            return (
              <th style={{ fontWeight: 600 }} key={term}>
                {term}
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  {providers?.map((provider, index) => (
                    <>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ProviderIcon provider={provider} />
                      </div>
                      {index !== providers.length - 1 && (
                        <Divider orientation="vertical" flexItem />
                      )}
                    </>
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
              <th key={strike}>{formatCurrency(+strike)}</th>
              {expirations.map(([term]) => {
                const termStrikeOptions = allRates[term][strike];
                const providers = termProviders[term];

                if (!termStrikeOptions.length) return <td key={term} />;

                return (
                  <td key={term}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "3px",
                      }}
                    >
                      {providers.map((provider, index) => (
                        <>
                          <OptionsCouple
                            key={provider}
                            optionCouple={termStrikeOptions.find(
                              (option) => option.provider === provider
                            )}
                          />
                          {index !== providers.length - 1 && (
                            <Divider
                              orientation="vertical"
                              flexItem
                              variant={"middle"}
                            />
                          )}
                        </>
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
