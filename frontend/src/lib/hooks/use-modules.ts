import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useCreateModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; order?: number }) => {
      const { data } = await api.post(`/creator/courses/${courseId}/modules`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", courseId] }),
  });
}

export function useUpdateModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, title }: { moduleId: string; title: string }) => {
      const { data } = await api.patch(
        `/creator/courses/${courseId}/modules/${moduleId}`,
        { title }
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", courseId] }),
  });
}

export function useDeleteModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (moduleId: string) => {
      await api.delete(`/creator/courses/${courseId}/modules/${moduleId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", courseId] }),
  });
}

export function useReorderModules(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (modules: { id: string; order: number }[]) => {
      await api.post(`/creator/courses/${courseId}/modules/reorder`, { modules });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", courseId] }),
  });
}
