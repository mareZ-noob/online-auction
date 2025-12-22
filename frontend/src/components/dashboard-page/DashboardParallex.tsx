import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useTranslation } from "react-i18next";

function DashboardParallex() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();

  const backgroundOpacity = useTransform(
    scrollY,
    [0, 400, 900, 1400],
    [1, 0.85, 0.65, 0.5]
  );

  const yTextRaw = useTransform(
    scrollY,
    [0, 300, 800, 1400],
    [0, 100, 200, 400]
  );

  const scaleTextRaw = useTransform(scrollY, [0, 600, 1200], [1, 1.08, 1.15]);

  const yText = useSpring(yTextRaw, {
    stiffness: 80,
    damping: 22,
  });

  const scaleText = useSpring(scaleTextRaw, {
    stiffness: 70,
    damping: 18,
  });

  return (
    <section className="relative -mx-16 h-screen overflow-hidden">
      <motion.img
        src="/auction-background.jpg"
        alt="Auction background"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: backgroundOpacity }}
      />

      <div className="absolute inset-0 bg-black/30" />

      <motion.div
        className="relative z-10 flex h-screen items-center justify-center"
        style={{
          y: yText,
          scale: scaleText,
        }}
      >
        <div className="flex flex-col items-center text-center px-4">
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-8 whitespace-nowrap">
            Bid with Confidence. Own with Style.
          </h1>

          <p className="text-white text-base md:text-lg lg:text-xl max-w-3xl leading-relaxed opacity-90">
            {t("dashboard.description")}
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default DashboardParallex;
