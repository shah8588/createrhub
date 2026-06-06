"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Pencil, Trash2, Globe, Archive } from "lucide-react";
import { useCourses, useCreateCourse, useDeleteCourse, usePublishCourse } from "@/lib/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";

function StatusBadge({ status }: { status: string }) {
  if (status === "published") return <Badge variant="success">Published</Badge>;
  if (status === "archived") return <Badge variant="outline">Archived</Badge>;
  return <Badge variant="warning">Draft</Badge>;
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-20 text-center">
      <div className="mb-4 rounded-full bg-surface-2 p-4">
        <BookOpen className="h-8 w-8 text-muted" />
      </div>
      <h3 className="text-base font-semibold text-paper">No courses yet</h3>
      <p className="mt-1 text-sm text-muted">Create your first course to get started.</p>
      <Button className="mt-6" onClick={onNew}>
        <Plus className="mr-2 h-4 w-4" />
        New Course
      </Button>
    </div>
  );
}

interface CourseRow {
  id: string;
  title: string;
  status: string;
  category?: string;
  lessons_count?: number;
  enrolments_count?: number;
  revenue?: number;
}

export default function CoursesPage() {
  const router = useRouter();
  const { data: courses, isLoading } = useCourses();
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const publishCourse = usePublishCourse();

  const [modalOpen, setModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPricingType, setNewPricingType] = useState("free");
  const [newPrice, setNewPrice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openModal = useCallback(() => {
    setWizardStep(1); setNewTitle(""); setNewDescription(""); setNewPricingType("free"); setNewPrice("");
    setModalOpen(true);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return;
    const course = await createCourse.mutateAsync({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      pricing_type: newPricingType,
      price_inr: newPricingType !== "free" ? Number(newPrice) || 0 : 0,
    });
    setModalOpen(false);
    router.push(`/dashboard/courses/${course.id}`);
  }, [newTitle, newDescription, newPricingType, newPrice, createCourse, router]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteCourse.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget, deleteCourse]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-paper">Courses</h1>
        <Button onClick={openModal}>
          <Plus className="mr-2 h-4 w-4" />
          New Course
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl bg-surface" />
          ))}
        </div>
      ) : !courses?.length ? (
        <EmptyState onNew={openModal} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted">Lessons</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted">Students</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(courses as CourseRow[]).map((course) => (
                <tr
                  key={course.id as string}
                  className="border-b border-surface-border last:border-0 hover:bg-surface-2"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-paper">{course.title}</p>
                    {course.category && (
                      <p className="text-xs text-muted">{course.category}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={course.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {course.lessons_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {course.enrolments_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {course.revenue
                      ? `₹${(course.revenue / 100).toLocaleString("en-IN")}`
                      : "₹0"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                        className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-paper"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {course.status !== "archived" && (
                        <button
                          onClick={() =>
                            publishCourse.mutate({
                              id: course.id,
                              archive: course.status === "published",
                            })
                          }
                          className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-paper"
                          title={course.status === "published" ? "Archive" : "Publish"}
                        >
                          {course.status === "published" ? (
                            <Archive className="h-4 w-4" />
                          ) : (
                            <Globe className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(course.id)}
                        className="rounded-lg p-1.5 text-muted hover:bg-accent/10 hover:text-accent"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Course Wizard */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={wizardStep === 1 ? "New Course — Basics" : wizardStep === 2 ? "New Course — Pricing" : "Review & Create"}
        description={wizardStep === 1 ? "Step 1 of 3 — You can change everything later." : wizardStep === 2 ? "Step 2 of 3 — Set how students will pay." : "Step 3 of 3"}
        size="sm"
      >
        {wizardStep === 1 && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Title *</label>
              <Input
                placeholder="e.g. Complete React Masterclass"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && newTitle.trim() && setWizardStep(2)}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Short description</label>
              <textarea
                className="w-full resize-none rounded-lg border border-surface-border bg-surface-2 px-3 py-2 text-sm text-paper placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
                rows={2}
                placeholder="What will students learn?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
        )}
        {wizardStep === 2 && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Pricing type</label>
              <select
                className="w-full rounded-lg border border-surface-border bg-surface-2 px-3 py-2 text-sm text-paper focus:outline-none focus:ring-1 focus:ring-accent/50"
                value={newPricingType}
                onChange={(e) => setNewPricingType(e.target.value)}
              >
                <option value="free">Free</option>
                <option value="one_time">One-time payment</option>
                <option value="subscription">Subscription (monthly)</option>
                <option value="payment_plan">Payment plan</option>
              </select>
            </div>
            {newPricingType !== "free" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Price (₹)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 1999"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
        {wizardStep === 3 && (
          <div className="rounded-lg bg-surface-2 p-4 text-sm space-y-1">
            <p><span className="text-muted">Title:</span> <span className="text-paper font-medium">{newTitle}</span></p>
            {newDescription && <p><span className="text-muted">Description:</span> <span className="text-paper">{newDescription}</span></p>}
            <p><span className="text-muted">Pricing:</span> <span className="text-paper capitalize">{newPricingType.replace("_", " ")}{newPricingType !== "free" ? ` — ₹${newPrice}` : ""}</span></p>
          </div>
        )}
        <ModalFooter>
          {wizardStep > 1 ? (
            <Button variant="ghost" onClick={() => setWizardStep(wizardStep - 1)}>Back</Button>
          ) : (
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          )}
          {wizardStep < 3 ? (
            <Button onClick={() => setWizardStep(wizardStep + 1)} disabled={wizardStep === 1 && !newTitle.trim()}>
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={!newTitle.trim() || createCourse.isPending}>
              {createCourse.isPending ? "Creating…" : "Create Course"}
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete course?"
        description="This will permanently delete the course and all its lessons. This cannot be undone."
        size="sm"
      >
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteCourse.isPending}
          >
            {deleteCourse.isPending ? "Deleting…" : "Delete"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
