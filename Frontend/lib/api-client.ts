// API client for communicating with the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PredictionRequest {
  latitude: number;
  longitude: number;
  elevation?: number;
  slope_gradient?: number;
  temperature?: number;
  rainfall_1day?: number;
  rainfall_7day?: number;
}

export interface PredictionResponse {
  prediction: string;
  probability: number;
  risk_level: string;
  confidence: number;
  factors: Record<string, number>;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  total_samples: number;
  dangerous_count: number;
  safe_count: number;
}

export interface FeatureImportance {
  name: string;
  importance: number;
}

export interface TrainingHistory {
  epochs: number[];
  accuracy: number[];
  loss: number[];
  val_accuracy: number[];
  val_loss: number[];
}

export interface RiskMapPoint {
  lat: number;
  lon: number;
  risk: string;
  probability: number;
  elevation: number;
}

export interface ConfusionMatrix {
  matrix: number[][];
  labels: string[];
  metrics: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.fetch<{ status: string; model_loaded: boolean; data_samples: number }>('/api/health');
  }

  // Make a prediction
  async predict(request: PredictionRequest): Promise<PredictionResponse> {
    return this.fetch<PredictionResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get model metrics
  async getModelMetrics(): Promise<ModelMetrics> {
    return this.fetch<ModelMetrics>('/api/metrics');
  }

  // Get feature importance
  async getFeatureImportance(): Promise<{ features: FeatureImportance[] }> {
    return this.fetch('/api/feature-importance');
  }

  // Get training history
  async getTrainingHistory(): Promise<TrainingHistory> {
    return this.fetch<TrainingHistory>('/api/training-history');
  }

  // Get recent predictions
  async getRecentPredictions(limit: number = 10) {
    return this.fetch<{ predictions: any[] }>(`/api/recent-predictions?limit=${limit}`);
  }

  // Get risk map data
  async getRiskMap(): Promise<{ points: RiskMapPoint[] }> {
    return this.fetch('/api/risk-map');
  }

  // Get confusion matrix
  async getConfusionMatrix(): Promise<ConfusionMatrix> {
    return this.fetch<ConfusionMatrix>('/api/confusion-matrix');
  }

  // Get location stats
  async getLocationStats(location: string) {
    return this.fetch(`/api/stats/${location}`);
  }
}

export const apiClient = new APIClient();
