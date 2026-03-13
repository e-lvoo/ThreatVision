import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export const useAnalysis = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (networkData: string) => api.analyze(networkData),
        onSuccess: (data) => {
            // Invalidate detections and alerts locally to refresh lists
            queryClient.invalidateQueries({ queryKey: ["detections"] });
            queryClient.invalidateQueries({ queryKey: ["alerts"] });

            toast({
                title: "Analysis Complete",
                description: `Traffic classified as ${data.classification} with ${(data.confidence * 100).toFixed(1)}% confidence.`,
                variant: data.classification === "Malicious" ? "destructive" : "default",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Analysis Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });
};
