import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { SegmentedTabs, type SegmentedTab } from "../ui/SegmentedTabs";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { smallTransition } from "../../utils/motion";
import { REPORT_RANGE_OPTIONS, type ReportDateRangeId } from "../../utils/analytics";

interface ReportDateFilterBarProps {
  activeId: ReportDateRangeId;
  onSelect: (id: ReportDateRangeId) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
  onApplyCustom: () => void;
  onResetCustom: () => void;
}

/**
 * Date range control for Reports & Analytics — same SegmentedTabs pattern
 * used for status filters elsewhere (Patients, Appointments, Doctors), plus
 * the same `Input type="date"` used by AppointmentsPage's date filter for
 * the custom-range inputs.
 */
export function ReportDateFilterBar({
  activeId,
  onSelect,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  onApplyCustom,
  onResetCustom,
}: ReportDateFilterBarProps) {
  const tabs: SegmentedTab<ReportDateRangeId>[] = REPORT_RANGE_OPTIONS.map((opt) => ({ id: opt.id, label: opt.label }));

  return (
    <div>
      <SegmentedTabs tabs={tabs} active={activeId} onChange={onSelect} layoutGroupId="reports-range-tabs" />

      <AnimatePresence initial={false}>
        {activeId === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={smallTransition}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-3 border-t border-mx-border pt-3 sm:flex-row sm:items-end">
              <div className="sm:w-44">
                <Input label="Start date" type="date" value={customStart} max={customEnd || undefined} onChange={(e) => onCustomStartChange(e.target.value)} />
              </div>
              <div className="sm:w-44">
                <Input label="End date" type="date" value={customEnd} min={customStart || undefined} onChange={(e) => onCustomEndChange(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={onApplyCustom} disabled={!customStart || !customEnd}>
                  Apply
                </Button>
                <Button size="sm" variant="ghost" icon={<RotateCcw size={14} aria-hidden="true" />} onClick={onResetCustom}>
                  Reset
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}