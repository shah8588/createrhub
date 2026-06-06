"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MoreVertical,
  FileText,
  Play,
  Paperclip,
  ArrowLeft,
  Globe,
  Archive,
} from "lucide-react";
import { useCourse, useUpdateCourse, usePublishCourse } from "@/lib/hooks/use-courses";
import { useCreateModule, useUpdateModule, useDeleteModule } from "@/lib/hooks/use-modules";
import { useCreateLesson, useUpdateLesson, useDeleteLesson } from "@/lib/hooks/use-lessons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  content_type: "video" | "text" | "file" | "quiz";
  content: string | null;
  youtube_url: string | null;
  is_free_preview: boolean;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
  pricing_type: string;
  price_inr: number;
  modules: Module[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname === "youtu.be") videoId = u.pathname.slice(1);
    else if (u.searchParams.has("v")) videoId = u.searchParams.get("v");
    else if (u.pathname.startsWith("/embed/")) videoId = u.pathname.split("/embed/")[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function lessonIcon(type: Lesson["content_type"]) {
  if (type === "video") return <Play className="h-3.5 w-3.5 shrink-0" />;
  if (type === "file") return <Paperclip className="h-3.5 w-3.5 shrink-0" />;
  return <FileText className="h-3.5 w-3.5 shrink-0" />;
}

// ─── Lesson Editor ───────────────────────────────────────────────────────────

function LessonEditor({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
  const updateLesson = useUpdateLesson(courseId);
  const [tab, setTab] = useState<"text" | "video" | "file">(
    lesson.content_type === "video" ? "video" : lesson.content_type === "file" ? "file" : "text"
  );
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtube_url ?? "");
  const [isFreePreview, setIsFreePreview] = useState(lesson.is_free_preview);

  // Reset local state when a different lesson is selected
  useEffect(() => {
    setTitle(lesson.title);
    setContent(lesson.content ?? "");
    setYoutubeUrl(lesson.youtube_url ?? "");
    setIsFreePreview(lesson.is_free_preview);
    setTab(lesson.content_type === "video" ? "video" : lesson.content_type === "file" ? "file" : "text");
  }, [lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedContent = useDebounce(content, 800);
  const prevContent = useRef(content);

  useEffect(() => {
    if (debouncedContent !== prevContent.current) {
      prevContent.current = debouncedContent;
      updateLesson.mutate({ lessonId: lesson.id, content: debouncedContent });
    }
  }, [debouncedContent]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveTitle = useCallback(() => {
    if (title !== lesson.title) {
      updateLesson.mutate({ lessonId: lesson.id, title });
    }
  }, [title, lesson.title, lesson.id, updateLesson]);

  const saveYoutubeUrl = useCallback(() => {
    if (youtubeUrl !== (lesson.youtube_url ?? "")) {
      updateLesson.mutate({ lessonId: lesson.id, youtube_url: youtubeUrl || undefined });
    }
  }, [youtubeUrl, lesson.youtube_url, lesson.id, updateLesson]);

  const toggleFreePreview = useCallback(() => {
    const next = !isFreePreview;
    setIsFreePreview(next);
    updateLesson.mutate({ lessonId: lesson.id, is_free_preview: next });
  }, [isFreePreview, lesson.id, updateLesson]);

  const embedUrl = youtubeUrl ? youtubeEmbedUrl(youtubeUrl) : null;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-8">
      {/* Title */}
      <input
        className="mb-6 w-full bg-transparent text-2xl font-semibold text-paper outline-none placeholder:text-surface-border"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={saveTitle}
        placeholder="Lesson title"
      />

      {/* Content type tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-surface-2 p-1 w-fit">
        {(["text", "video", "file"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "bg-surface text-paper shadow-sm"
                : "text-muted hover:text-paper"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Text content */}
      {tab === "text" && (
        <textarea
          className="min-h-64 flex-1 resize-none rounded-xl border border-surface-border bg-surface-2 p-4 text-sm text-paper placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
          placeholder="Write your lesson content here (HTML supported)…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      )}

      {/* Video content */}
      {tab === "video" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">YouTube URL</label>
            <input
              className="w-full rounded-lg border border-surface-border bg-surface-2 px-3 py-2 text-sm text-paper placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onBlur={saveYoutubeUrl}
            />
          </div>
          {embedUrl ? (
            <div className="aspect-video overflow-hidden rounded-xl border border-surface-border">
              <iframe
                src={embedUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-2">
              <div className="text-center">
                <Play className="mx-auto mb-2 h-8 w-8 text-muted" />
                <p className="text-sm text-muted">Paste a YouTube URL above to preview</p>
                <p className="mt-3 text-xs text-muted/60">
                  Mux direct upload — coming in Phase 3
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File content */}
      {tab === "file" && (
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-2">
          <div className="text-center">
            <Paperclip className="mx-auto mb-2 h-8 w-8 text-muted" />
            <p className="text-sm text-muted">File uploads — coming in Phase 3</p>
          </div>
        </div>
      )}

      {/* Free preview toggle */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={toggleFreePreview}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            isFreePreview ? "bg-accent" : "bg-surface-border"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
              isFreePreview ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </button>
        <span className="text-sm text-muted">Free preview</span>
      </div>
    </div>
  );
}

// ─── Course Settings Panel ────────────────────────────────────────────────────

function CourseSettingsPanel({ course }: { course: Course }) {
  const updateCourse = useUpdateCourse(course.id);
  const publishCourse = usePublishCourse();

  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [pricingType, setPricingType] = useState(course.pricing_type);
  const [priceInr, setPriceInr] = useState(String(course.price_inr ?? 0));

  useEffect(() => {
    setTitle(course.title);
    setDescription(course.description ?? "");
    setPricingType(course.pricing_type);
    setPriceInr(String(course.price_inr ?? 0));
  }, [course.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveField = useCallback(
    (field: string, value: unknown) => updateCourse.mutate({ [field]: value }),
    [updateCourse]
  );

  const isPublished = course.status === "published";

  return (
    <div className="overflow-y-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-paper">Course Settings</h2>
        <div className="flex items-center gap-2">
          {course.status === "draft" || course.status === "archived" ? (
            <Button
              size="sm"
              onClick={() => publishCourse.mutate({ id: course.id })}
              isLoading={publishCourse.isPending}
            >
              <Globe className="h-4 w-4" />
              Publish
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => publishCourse.mutate({ id: course.id, archive: true })}
              isLoading={publishCourse.isPending}
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-5 max-w-lg">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Title</label>
          <input
            className="w-full rounded-lg border border-surface-border bg-surface-2 px-3 py-2 text-sm text-paper placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== course.title && saveField("title", title)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Description</label>
          <textarea
            className="w-full resize-none rounded-lg border border-surface-border bg-surface-2 px-3 py-2 text-sm text-paper placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
            rows={4}
            placeholder="What will students learn?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== (course.description ?? "") && saveField("description", description)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Pricing</label>
          <select
            className="w-full rounded-lg border border-surface-border bg-surface-2 px-3 py-2 text-sm text-paper focus:outline-none focus:ring-1 focus:ring-accent/50"
            value={pricingType}
            onChange={(e) => {
              setPricingType(e.target.value);
              saveField("pricing_type", e.target.value);
            }}
          >
            <option value="free">Free</option>
            <option value="one_time">One-time payment</option>
            <option value="subscription">Subscription</option>
            <option value="payment_plan">Payment plan</option>
          </select>
        </div>

        {pricingType !== "free" && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Price (₹)</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-surface-border bg-surface-2 px-3 py-2 text-sm text-paper focus:outline-none focus:ring-1 focus:ring-accent/50"
              value={priceInr}
              onChange={(e) => setPriceInr(e.target.value)}
              onBlur={() => saveField("price_inr", Number(priceInr) || 0)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module Tree ─────────────────────────────────────────────────────────────

function ModuleItem({
  module,
  courseId,
  selected,
  onSelect,
}: {
  module: Module;
  courseId: string;
  selected: Lesson | null;
  onSelect: (lesson: Lesson | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(module.title);
  const [addingLesson, setAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const updateModule = useUpdateModule(courseId);
  const deleteModule = useDeleteModule(courseId);
  const createLesson = useCreateLesson(courseId);

  const commitRename = useCallback(() => {
    setRenaming(false);
    if (name.trim() && name !== module.title) {
      updateModule.mutate({ moduleId: module.id, title: name.trim() });
    } else {
      setName(module.title);
    }
  }, [name, module.title, module.id, updateModule]);

  const handleAddLesson = useCallback(async () => {
    if (!newLessonTitle.trim()) return;
    const lesson = await createLesson.mutateAsync({
      module_id: module.id,
      title: newLessonTitle.trim(),
      content_type: "text",
      order: (module.lessons.length ?? 0) + 1,
    });
    setAddingLesson(false);
    setNewLessonTitle("");
    onSelect(lesson);
  }, [newLessonTitle, module.id, module.lessons.length, createLesson, onSelect]);

  return (
    <div>
      {/* Module header */}
      <div className="group flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-surface-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 text-muted hover:text-paper"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {renaming ? (
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm text-paper outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") { setName(module.title); setRenaming(false); }
            }}
          />
        ) : (
          <span className="flex-1 truncate text-sm font-medium text-paper">{module.title}</span>
        )}

        <div className="relative opacity-0 group-hover:opacity-100">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded p-1 text-muted hover:bg-surface-border hover:text-paper"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-surface-border bg-surface shadow-lg">
              <button
                onClick={() => { setMenuOpen(false); setRenaming(true); }}
                className="w-full px-3 py-2 text-left text-sm text-paper hover:bg-surface-2"
              >
                Rename
              </button>
              <button
                onClick={() => { setMenuOpen(false); deleteModule.mutate(module.id); }}
                className="w-full px-3 py-2 text-left text-sm text-accent hover:bg-surface-2"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lessons */}
      {expanded && (
        <div className="ml-5 border-l border-surface-border pl-2">
          {module.lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => onSelect(lesson)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                selected?.id === lesson.id
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-paper"
              )}
            >
              {lessonIcon(lesson.content_type)}
              <span className="flex-1 truncate">{lesson.title}</span>
            </button>
          ))}

          {/* Add Lesson */}
          {addingLesson ? (
            <div className="mt-1 px-2">
              <input
                autoFocus
                className="w-full rounded border border-surface-border bg-surface-2 px-2 py-1 text-sm text-paper outline-none"
                placeholder="Lesson title"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                onBlur={() => { if (!newLessonTitle) setAddingLesson(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddLesson();
                  if (e.key === "Escape") { setAddingLesson(false); setNewLessonTitle(""); }
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingLesson(true)}
              className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted hover:text-paper"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Lesson
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CourseBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: course, isLoading } = useCourse(id);
  const createModule = useCreateModule(id);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const handleSelectLesson = useCallback((lesson: Lesson | null) => {
    setSelectedLesson(lesson);
    setShowSettings(false);
  }, []);

  const handleAddModule = useCallback(async () => {
    if (!newModuleTitle.trim()) return;
    await createModule.mutateAsync({
      title: newModuleTitle.trim(),
      order: (course?.modules?.length ?? 0) + 1,
    });
    setAddingModule(false);
    setNewModuleTitle("");
  }, [newModuleTitle, course?.modules?.length, createModule]);

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-72 border-r border-surface-border p-4 space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 bg-surface-2" />)}
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-8 w-64 bg-surface-2" />
          <Skeleton className="h-40 bg-surface-2" />
        </div>
      </div>
    );
  }

  if (!course) return null;

  const statusBadgeVariant =
    course.status === "published" ? "success" :
    course.status === "archived" ? "outline" : "warning";

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left sidebar: module/lesson tree ── */}
      <div className="flex w-72 shrink-0 flex-col border-r border-surface-border bg-surface overflow-hidden">
        {/* Back + course title */}
        <div className="border-b border-surface-border p-3">
          <button
            onClick={() => router.push("/dashboard/courses")}
            className="mb-2 flex items-center gap-1.5 text-xs text-muted hover:text-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Courses
          </button>
          <button
            onClick={() => { setSelectedLesson(null); setShowSettings(true); }}
            className={cn(
              "w-full rounded-lg px-2 py-2 text-left",
              showSettings && !selectedLesson ? "bg-surface-2" : "hover:bg-surface-2"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-paper truncate">{course.title}</span>
              <Badge variant={statusBadgeVariant} className="shrink-0 ml-2 text-xs">
                {course.status}
              </Badge>
            </div>
          </button>
        </div>

        {/* Module tree */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {course.modules?.map((mod: Module) => (
            <ModuleItem
              key={mod.id}
              module={mod}
              courseId={id}
              selected={selectedLesson}
              onSelect={handleSelectLesson}
            />
          ))}

          {/* Add Module */}
          {addingModule ? (
            <div className="px-2 pt-1">
              <input
                autoFocus
                className="w-full rounded border border-surface-border bg-surface-2 px-2 py-1.5 text-sm text-paper outline-none"
                placeholder="Module title"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                onBlur={() => { if (!newModuleTitle) setAddingModule(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddModule();
                  if (e.key === "Escape") { setAddingModule(false); setNewModuleTitle(""); }
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingModule(true)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-paper"
            >
              <Plus className="h-4 w-4" />
              Add Module
            </button>
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 overflow-hidden bg-surface">
        {selectedLesson ? (
          <LessonEditor lesson={selectedLesson} courseId={id} />
        ) : (
          <CourseSettingsPanel course={course} />
        )}
      </div>
    </div>
  );
}
