import type { Metadata } from "next";

export const metadata: Metadata = { title: "Learn" };

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LearnPage({ params }: Props) {
  const { courseId, lessonId } = await params;

  return (
    <div className="flex min-h-screen">
      {/* Video/content area */}
      <div className="flex flex-1 flex-col">
        <div className="aspect-video w-full bg-surface-2 flex items-center justify-center">
          <p className="text-muted">Video player — lesson {lessonId}</p>
        </div>
        <div className="p-8">
          <p className="text-sm text-muted">Course: {courseId}</p>
        </div>
      </div>
      {/* Curriculum sidebar */}
      <aside className="hidden w-72 border-l border-surface-border bg-surface xl:block">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-paper">Curriculum</h3>
        </div>
      </aside>
    </div>
  );
}
