import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await api.get("/creator/courses");
      return data.data;
    },
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ["courses", id],
    queryFn: async () => {
      const { data } = await api.get(`/creator/courses/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      pricing_type?: string;
      price_inr?: number;
    }) => {
      const { data } = await api.post("/creator/courses", payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}
