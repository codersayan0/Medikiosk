import { motion, useReducedMotion } from "framer-motion";
import { Leaf, CalendarDays } from "lucide-react";
import { Card, CardTitle } from "../../../components/ui/Card";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { useAyushHealth } from "../../../context/PatientContext";
import { fadeInUp, smallTransition } from "../../../utils/motion";

/** Widest grid we ever render the tiles at (lg:grid-cols-5) — used to group
 * tiles into "rows" for a quick, batched stagger instead of animating every
 * tile individually. */
const ROW_SIZE = 5;
/** Delay added per row group; reuses the same small-stagger feel as the rest of the app. */
const ROW_DELAY = 0.05;

const TILE_CLASSES =
  "flex flex-col items-center gap-1 rounded-mx-md border border-transparent bg-mx-surface-sunken px-3 py-4 text-center transition-[border-color,box-shadow] duration-150 ease-out hover:border-mx-border-strong hover:shadow-mx-sm";

export default function AyushHealthPage() {
  const ayush = useAyushHealth();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">AYUSH Health</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">
          Your traditional-medicine constitutional assessment (Dashavidha Pariksha) alongside AYUSH lifestyle parameters.
        </p>
      </div>

      <motion.div initial={prefersReducedMotion ? false : "hidden"} animate="show" variants={prefersReducedMotion ? undefined : fadeInUp}>
        <Card className="flex items-center gap-2 text-xs text-mx-ink-muted">
          <CalendarDays size={13} aria-hidden="true" />
          Assessment Date: {ayush.assessmentDate}
        </Card>
      </motion.div>

      <motion.div initial={prefersReducedMotion ? false : "hidden"} animate="show" variants={prefersReducedMotion ? undefined : fadeInUp}>
        <Card>
          <CardTitle className="mb-4">Dashavidha Pariksha</CardTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {ayush.dashavidha.map((tile, i) => (
              <motion.div
                key={tile.label}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smallTransition, delay: prefersReducedMotion ? 0 : Math.floor(i / ROW_SIZE) * ROW_DELAY }}
                className={TILE_CLASSES}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">{tile.label}</p>
                <p className="text-sm font-bold text-mx-ink">{tile.value}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <MedicalIcon icon={Leaf} tone="green" size={16} className="h-9 w-9" />
            <CardTitle>Ahara-Vihara</CardTitle>
          </div>
          <p className="text-sm text-mx-ink-soft">{ayush.aharaVihara}</p>
        </Card>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        <Card>
          <CardTitle className="mb-4">Other AYUSH Parameters</CardTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {ayush.otherParams.map((tile, i) => (
              <motion.div
                key={tile.label}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ ...smallTransition, delay: prefersReducedMotion ? 0 : Math.floor(i / ROW_SIZE) * ROW_DELAY }}
                className={TILE_CLASSES}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">{tile.label}</p>
                <p className="text-sm font-bold text-mx-ink">{tile.value}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
