import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await api.get("/creator/settings");
      return data.data as {
        id: string;
        name: string;
        email: string;
        bio: string | null;
        phone: string | null;
        avatar_url: string | null;
        slug: string;
        gstin: string | null;
        business_name: string | null;
        business_address: string | null;
        state_code: string | null;
        youtube_url: string | null;
        instagram_handle: string | null;
        twitter_handle: string | null;
        website_url: string | null;
        settings: {
          primary_color: string | null;
          secondary_color: string | null;
          font_family: string | null;
          invoice_prefix: string | null;
          custom_domain: string | null;
          domain_status: string | null;
        };
      };
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.patch("/creator/settings", payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => {
      const { data } = await api.post("/creator/settings/change-password", payload);
      return data;
    },
  });
}
