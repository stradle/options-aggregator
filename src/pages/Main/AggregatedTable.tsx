import { chain } from "lodash";
import styled from "styled-components";
import { useRatesContext } from "../../exchanges/RatesProvider";
import { formatCurrency, useExpirations, useStrikes } from "../../util";
import ProviderIcon from "../../components/ProviderIcon";
import { OptionsMap, OptionType, ProviderType } from "../../types";

const StyledTable = styled.table`
  border-collapse: collapse;

  th,
  td {
    border: 1px gray solid;
    border-radius: 5px;
  }

  thead {
    text-align: center;
  }
`;
const RowHeader = styled.td`
  font-weight: 600;
`;

const StyledOptionCouple = styled.div`
  display: flex;
  align-items: center;
`;

const StyledOptionValue = styled.div<{ color?: string }>`
  height: 20px;
  min-width: 40px;
  color: ${({ color }) => color};
`;

const OptionValue = ({ type, price }: { price?: number; type: OptionType }) =>
  price ? (
    <StyledOptionValue
      color={type === OptionType.CALL ? "darkgreen" : "darkred"}
    >
      ${Math.round(price)}
    </StyledOptionValue>
  ) : (
    <StyledOptionValue />
  );

const OptionsCouple = ({ optionCouple }: { optionCouple: OptionsMap }) => {
  const { [OptionType.CALL]: call, [OptionType.PUT]: put } =
    optionCouple.options;

  return (
    <StyledOptionCouple>
      <ProviderIcon provider={optionCouple.provider} />
      <div>
        {
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <OptionValue type={OptionType.CALL} price={call?.bidPrice} />
            <OptionValue type={OptionType.PUT} price={put?.bidPrice} />
          </div>
        }
      </div>
    </StyledOptionCouple>
  );
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

  return (
    <StyledTable>
      <thead style={{ fontWeight: 600 }}>
        <tr>
          <td />
          {expirations.map(([term]) => (
            <td key={term}>{term}</td>
          ))}
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
                    optionMap.term === term &&
                    optionMap.strike === strike &&
                    optionMap.provider === ProviderType.DERIBIT
                );
                const lyraCouple = rates.LYRA?.find(
                  (optionMap) =>
                    optionMap.term === term &&
                    optionMap.strike === strike &&
                    optionMap.provider === ProviderType.LYRA
                );
                const premiaCouple = rates.PREMIA?.find(
                  (optionMap) =>
                    optionMap.term === term &&
                    optionMap.strike === strike &&
                    optionMap.provider === ProviderType.PREMIA
                );

                if (!deribitCouple && !lyraCouple && !premiaCouple)
                  return <td key={term} />;

                return (
                  <td key={term}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      {deribitCouple ? (
                        <OptionsCouple optionCouple={deribitCouple} />
                      ) : (
                        <div />
                      )}
                      {lyraCouple ? (
                        <OptionsCouple optionCouple={lyraCouple} />
                      ) : (
                        <div />
                      )}
                      {premiaCouple ? (
                        <OptionsCouple optionCouple={premiaCouple} />
                      ) : (
                        <div />
                      )}
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
