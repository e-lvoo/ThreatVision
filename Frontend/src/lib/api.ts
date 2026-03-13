import { supabase } from "@/integrations/supabase/client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface DetectionResult {
  classification: string;
  confidence: number;
  model_version: string;
  alert_generated: boolean;
}

export const api = {
  async analyze(networkData: string): Promise<DetectionResult> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ network_data: networkData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Analysis failed");
    }

    return response.json();
  },

  async getHealth() {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.json();
  },

  async getModelInfo() {
    const response = await fetch(`${BACKEND_URL}/model-info`);
    return response.json();
  }
};
