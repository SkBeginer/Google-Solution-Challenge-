export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Claim {
  id?: string;
  claimId: string;
  userId: string;
  userName: string;
  vehicleType: string;
  vehicleNumber: string;
  status: "pending" | "review" | "approved" | "rejected";
  location: string;
  description: string;
  voiceNote?: string;
  images: string[];
  analysis?: DamageAnalysis;
  fraudRisk: "low" | "medium" | "high";
  estimatedCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface DamageAnalysis {
  damagedParts: string[];
  severity: "minor" | "moderate" | "severe" | "total loss";
  estimatedCost: number;
  fraudRisk: "low" | "medium" | "high";
  confidence: number;
  findings: string;
  recommendation: string;
}
