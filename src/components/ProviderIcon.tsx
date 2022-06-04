import { ReactComponent as DeribitLogo } from "../assets/deribit.svg";
import { ReactComponent as LyraLogo } from "../assets/lyra.svg";
import { ReactComponent as PremiaLogo } from "../assets/premia.svg";
import { ProviderType } from "../types";

const providerIcons = {
  [ProviderType.DERIBIT]: DeribitLogo,
  [ProviderType.LYRA]: LyraLogo,
  [ProviderType.PREMIA]: PremiaLogo,
};

export const ProviderIcon = ({
  provider,
  width = 15,
  marginLeft = 0,
}: {
  provider: ProviderType;
  width?: number;
  marginLeft?: number;
}) => {
  const IconComponent = providerIcons[provider];

  return <IconComponent style={{ marginLeft: `${marginLeft}px` }} width={`${width}px`} />;
};
