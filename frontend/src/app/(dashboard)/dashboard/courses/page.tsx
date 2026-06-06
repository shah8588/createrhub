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
  const [newTitle, setNewTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return;
    const course = await createCourse.mutateAsync({ title: newTitle.trim() });
    setModalOpen(false);
    setNewTitle("");
    router.push(`/dashboard/courses/${course.id}`);
  }, [newTitle, createCourse, router]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteCourse.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget, deleteCourse]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-paper">Courses</h1>
        <Button onClick={() => setModalOpen(true)}>
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
        <EmptyState onNew={() => setModalOpen(true)} />
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

      {/* New Course Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setNewTitle(""); }}
        title="New Course"
        description="Give your course a title. You can change it later."
        size="sm"
      >
        <Input
          placeholder="e.g. Complete React Masterclass"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          autoFocus
        />
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setModalOpen(false); setNewTitle(""); }}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!newTitle.trim() || createCourse.isPending}>
            {createCourse.isPending ? "Creating…" : "Create"}
          </Button>
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
