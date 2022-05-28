import { ReactComponent as DeribitLogo } from "../assets/deribit.svg";
import { ReactComponent as LyraLogo } from "../assets/lyra.svg";
import { ReactComponent as PremiaLogo } from "../assets/premia.svg";
import { ProviderType } from "../types";

const providerIcons = {
  [ProviderType.DERIBIT]: DeribitLogo,
  [ProviderType.LYRA]: LyraLogo,
  [ProviderType.PREMIA]: PremiaLogo,
};

const ProviderIcon = ({
  provider,
  width = 15,
}: {
  provider: ProviderType;
  width?: number;
}) => {
  const IconComponent = providerIcons[provider];

  return <IconComponent width={`${width}px`} />;
};

export default ProviderIcon;
