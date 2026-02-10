export type ModelStatus = 'active' | 'archived' | 'training' | 'failed';
export type ArchitectureType = 'CNN' | 'LSTM' | 'Hybrid CNN-LSTM' | 'Transformer' | 'GNN' | 'Autoencoder';

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  inferenceSpeed: number; // ms
  modelSize: number; // MB
}

export interface MetricTrend {
  timestamp: string;
  value: number;
}

export interface MLModel {
  id: string;
  name: string;
  version: string;
  architecture: ArchitectureType;
  trainingDate: Date;
  deploymentDate?: Date;
  status: ModelStatus;
  metrics: ModelMetrics;
  metricsTrend: MetricTrend[];
  trainingDataset: string;
  datasetSize: number;
  description?: string;
  createdBy: string;
}

export interface TrainingJob {
  id: string;
  modelName: string;
  startTime: Date;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  eta?: string;
  logs: string[];
  epochs: number;
  currentEpoch: number;
}

export interface ConfusionMatrixData {
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
}

export interface ROCPoint {
  fpr: number;
  tpr: number;
}

export interface PrecisionRecallPoint {
  recall: number;
  precision: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface DeploymentStep {
  step: 1 | 2 | 3 | 4;
  label: string;
}
