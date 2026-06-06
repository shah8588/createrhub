import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useCreateLesson(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      module_id: string;
      title: string;
      content_type: "video" | "text" | "file" | "quiz";
      order?: number;
    }) => {
      const { data } = await api.post(`/creator/courses/${courseId}/lessons`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", courseId] }),
  });
}

export function useUpdateLesson(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      ...payload
    }: {
      lessonId: string;
      title?: string;
      content?: string;
      youtube_url?: string;
      is_free_preview?: boolean;
    }) => {
      const { data } = await api.patch(
        `/creator/courses/${courseId}/lessons/${lessonId}`,
        payload
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", courseId] }),
  });
}

export function useDeleteLesson(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      await api.delete(`/creator/courses/${courseId}/lessons/${lessonId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", courseId] }),
  });
}
