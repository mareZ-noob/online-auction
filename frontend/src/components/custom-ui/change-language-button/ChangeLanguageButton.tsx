import { useUserStore } from "@/store/user-store";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

function ChangeLanguageButton({ lang }: { lang: "en" | "vi" }) {
  const { i18n } = useTranslation();
  const { lang: currentLang } = useUserStore();
  const { setLang } = useUserStore();

  const changeLanguage = (lang: "en" | "vi") => {
    i18n.changeLanguage(lang);
    setLang(lang);
  };

  return (
    <div
      className="w-full text-sm flex items-center gap-2"
      onClick={() => changeLanguage(lang)}
    >
      <p>
        {lang === "en"
          ? i18n.t("userNav.english")
          : i18n.t("userNav.vietnamese")}
      </p>
      {currentLang === lang && <Check />}
    </div>
  );
}

export default ChangeLanguageButton;
