import { ReactComponent as DeribitLogo } from "../assets/deribit.svg";
import { ReactComponent as LyraLogo } from "../assets/lyra.svg";
import { ReactComponent as PremiaLogo } from "../assets/premia.svg";
import { ReactComponent as HegicLogo } from "../assets/hegic.svg";
import { ProviderType } from "../types";

const providerIcons = {
  [ProviderType.DERIBIT]: DeribitLogo,
  [ProviderType.LYRA]: LyraLogo,
  [ProviderType.PREMIA_ARB]: PremiaLogo,
  [ProviderType.PREMIA_OP]: PremiaLogo,
  [ProviderType.HEGIC]: HegicLogo,
};

export const ProviderIcon = ({
  provider,
  height = 15,
  marginLeft = 0,
}: {
  provider: ProviderType;
  height?: number;
  marginLeft?: number;
}) => {
  const IconComponent = providerIcons[provider];

  return (
    <IconComponent
      style={{ marginLeft: `${marginLeft}px` }}
      width={`${height}px`}
      height={`${height}px`}
    />
  );
};
