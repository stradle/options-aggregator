import {formatCurrency} from "../../util";
import {OptionsMap, OptionType, ProviderType} from "../../types";
import {chain} from "lodash";
import {useRateContext} from "../../exchanges/RateProvider";
import styled from "styled-components";
import {ReactComponent as LyraLogo} from "../../assets/lyra.svg";
import {ReactComponent as DeribitLogo} from "../../assets/deribit.svg";
import {ReactComponent as PremiaLogo} from "../../assets/premia.svg";

const StyledTable = styled.table`
  border: solid 1px lightgray;
  border-radius: 5px;
`;
const RowHeader = styled.td`
  font-weight: 600;
`;

const StyledOptionCouple = styled.div`
  overflow: hidden;
  position: relative;

  svg {
    opacity: 0.4;
    position: absolute;
    left: 25%;
    top: 25%;
    width: 2rem;
    height: auto;
    aspect-ratio: 1 / 1;
  }

  .content {
    position: relative;
  }
`;

const StyledOptionValue = styled.div<{ color?: string }>`
  height: 20px;
  min-width: 40px;
  color: ${({ color }) => color};
`;

const providerLogos = {
    [ProviderType.LYRA]: LyraLogo,
    [ProviderType.DERIBIT]: DeribitLogo,
    [ProviderType.PREMIA]: PremiaLogo,
};


const OptionsCouple = ({ optionCouple }: { optionCouple: OptionsMap }) => {
    const { [OptionType.CALL]: call, [OptionType.PUT]: put } =
        optionCouple.options;

    const callPrice = call?.midPrice ?? call?.bidPrice;
    const putPrice = put?.midPrice ?? put?.bidPrice;
    const LogoComponent = providerLogos[optionCouple.provider];

    return (
        <StyledOptionCouple>
            {<LogoComponent />}
            <div className={"content"}>
                {
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <StyledOptionValue color={"darkgreen"}>
                            {callPrice && formatCurrency(callPrice)}
                        </StyledOptionValue>
                        <StyledOptionValue color={"darkred"}>
                            {putPrice && formatCurrency(putPrice)}
                        </StyledOptionValue>
                    </div>
                }
            </div>
        </StyledOptionCouple>
    );
};

export const BigTable = () => {
    const rates = useRateContext()


    const deribitTerms = chain(rates.DERIBIT)
        .uniqBy("term")
        .sortBy("expiration")
        .map("term")
        .value();
    const deribitStrikes = chain(rates.DERIBIT)
        .map("strike")
        .uniq()
        .filter((val) => +val % 100 === 0)
        .sortBy((strike) => +strike)
        .value();
    return <div>
        <h3>Options Markets Grid</h3>
        <StyledTable>
            <thead style={{ fontWeight: 600 }}>
            <tr>
                <td />
                {deribitTerms.map((term) => (
                    <td key={term}>{term}</td>
                ))}
            </tr>
            </thead>

            <tbody>
            {deribitStrikes.map((strike) => {
                return (
                    <tr key={strike}>
                        <RowHeader key={strike}>
                            {formatCurrency(+strike)}
                        </RowHeader>
                        {deribitTerms.map((term) => {
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
                            // if(term === "3JUN22")

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
    </div>
}