import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Users } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SegmentedTabs, type SegmentedTab } from "../../../components/ui/SegmentedTabs";
import { ListPageSkeleton } from "../../../components/ui/Skeleton";
import { Pagination } from "../../../components/ui/Pagination";
import { PatientStatusBadge } from "../../../components/admin/PatientStatusBadge";
import { PatientDetailsDrawer } from "../../../components/admin/PatientDetailsDrawer";
import { MOCK_PATIENTS } from "../../../data/mockPatients";
import { useSimulatedLoad } from "../../../hooks/useSimulatedLoad";
import { staggerContainer, staggerItem } from "../../../utils/motion";
import { countPatientsByStatus, patientMatchesQuery } from "../../../utils/patients";
import type { Patient, PatientDirectoryStatus } from "../../../types";

type FilterTab = "all" | PatientDirectoryStatus;
const PAGE_SIZE = 8;

/**
 * Admin Patients directory (replaces the "coming soon" placeholder). Same
 * search + segmented-tab-filter + table/card pattern used by Doctor
 * Applications and Doctors, with an added gender filter and pagination.
 * `patientUID` is the only identifier shown/used — no duplicate patient ID.
 *
 * TODO(real-backend): swap MOCK_PATIENTS for a real
 * `GET /admin/patients` response (see data/mockPatients.ts) — the rest of
 * this page reads through local state only, so no other change is needed.
 */
export default function PatientsPage() {
  const { loading } = useSimulatedLoad();
  const [patients] = useState<Patient[]>(MOCK_PATIENTS);
  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [tab, setTab] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const counts = useMemo(() => countPatientsByStatus(patients), [patients]);

  const tabs: SegmentedTab<FilterTab>[] = [
    { id: "all", label: "All Patients", count: counts.all },
    { id: "active", label: "Active", count: counts.active },
    { id: "inactive", label: "Inactive", count: counts.inactive },
    { id: "critical", label: "Critical", count: counts.critical },
  ];

  const genderOptions = useMemo(() => {
    const unique = Array.from(new Set(patients.map((p) => p.gender)));
    return [{ value: "all", label: "All Genders" }, ...unique.map((g) => ({ value: g, label: g }))];
  }, [patients]);

  const filtered = useMemo(() => {
    return patients.filter(
      (p) => (tab === "all" || p.status === tab) && (genderFilter === "all" || p.gender === genderFilter) && patientMatchesQuery(p, query)
    );
  }, [patients, tab, genderFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  if (loading) return <ListPageSkeleton rows={6} />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-mx-ink">Patients</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">View and manage every patient registered with your organization.</p>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-mx-border p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="sm:max-w-xs sm:flex-1">
              <Input
                label="Search patients"
                hideLabel
                placeholder="Search by name, UID, phone, or email"
                icon={<Search size={16} aria-hidden="true" />}
                value={query}
                onChange={(e) => updateFilter(() => setQuery(e.target.value))}
              />
            </div>
            <div className="sm:w-48">
              <Select
                label="Filter patients"
                hideLabel
                options={genderOptions}
                value={genderFilter}
                onChange={(e) => updateFilter(() => setGenderFilter(e.target.value))}
              />
            </div>
          </div>
          <SegmentedTabs tabs={tabs} active={tab} onChange={(id) => updateFilter(() => setTab(id))} layoutGroupId="patients-tabs" />
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<Users size={22} aria-hidden="true" />} title="No patients found" description="Try adjusting your search or filters." />
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="mx-scrollbar hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead>
                  <tr className="border-y border-mx-border bg-mx-surface-sunken text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
                    <th className="px-5 py-3 font-semibold">Patient</th>
                    <th className="px-3 py-3 font-semibold">Patient UID</th>
                    <th className="px-3 py-3 font-semibold">Age</th>
                    <th className="px-3 py-3 font-semibold">Gender</th>
                    <th className="px-3 py-3 font-semibold">Phone</th>
                    <th className="px-3 py-3 font-semibold">Last Visit</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <motion.tbody key={`${tab}-${genderFilter}-${query}-${currentPage}`} variants={staggerContainer(0.035)} initial="hidden" animate="show">
                  {paged.map((patient) => (
                    <motion.tr
                      key={patient.id}
                      variants={staggerItem}
                      onClick={() => setSelectedPatient(patient)}
                      className="cursor-pointer border-b border-mx-border transition-colors duration-150 last:border-b-0 hover:bg-mx-surface-sunken"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={patient.fullName} size={34} />
                          <p className="truncate font-semibold text-mx-ink">{patient.fullName}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-mx-ink-soft">{patient.patientUID}</td>
                      <td className="px-3 py-3 text-mx-ink-soft">{patient.age}</td>
                      <td className="px-3 py-3 text-mx-ink-soft">{patient.gender}</td>
                      <td className="px-3 py-3 text-mx-ink-soft">{patient.phone}</td>
                      <td className="px-3 py-3 text-mx-ink-soft">{patient.lastVisit}</td>
                      <td className="px-3 py-3">
                        <PatientStatusBadge status={patient.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye size={14} aria-hidden="true" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                        >
                          View Patient
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <motion.div
              key={`m-${tab}-${genderFilter}-${query}-${currentPage}`}
              variants={staggerContainer(0.035)}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3 p-4 sm:hidden"
            >
              {paged.map((patient) => (
                <motion.div key={patient.id} variants={staggerItem}>
                  <Card interactive onClick={() => setSelectedPatient(patient)} className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar name={patient.fullName} size={36} />
                        <div>
                          <p className="font-semibold text-mx-ink">{patient.fullName}</p>
                          <p className="font-mono text-xs text-mx-ink-muted">{patient.patientUID}</p>
                        </div>
                      </div>
                      <PatientStatusBadge status={patient.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-mx-ink-muted">
                      <span>
                        {patient.age} yrs · {patient.gender}
                      </span>
                      <span>Last visit {patient.lastVisit}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={setPage}
              summary={`Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} patients`}
            />
          </>
        )}
      </Card>

      <PatientDetailsDrawer patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
    </div>
  );
}
