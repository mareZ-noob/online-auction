import EmptyCartImage from "@/assets/EmptyCartImage.png";
import { useTranslation } from "react-i18next";

function WatchListFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center mb-36">
      <img src={EmptyCartImage} />
      <p className="text-xl">{t("watchList.empty")}</p>
    </div>
  );
}

export default WatchListFallback;
