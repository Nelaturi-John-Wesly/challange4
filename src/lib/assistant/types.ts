/**
 * Campus AI (AETHER) - Type Definitions
 */

export type AssistantLanguage = "en-IN" | "te-IN" | "hi-IN";

export type AssistantActionType =
  | "NAVIGATE"
  | "SEARCH"
  | "READ_DATA"
  | "FILL_FORM"
  | "CONFIRM_ACTION"
  | "MAP_LOCATION"
  | "LMS_HELPER"
  | "PLACEMENT_HELPER"
  | "ROLE_SPECIFIC";

export interface AssistantAction {
  type: AssistantActionType;
  title: string;
  description?: string;
  targetUrl?: string;
  payload?: Record<string, any>;
  requiresConfirmation?: boolean;
  confirmationId?: string;
}

export interface AssistantResultCard {
  id: string;
  type: "attendance" | "schedule" | "quiz" | "map" | "gigs" | "grievance" | "search" | "info" | "study_plan";
  title: string;
  subtitle?: string;
  data: any;
  actionUrl?: string;
  actionLabel?: string;
}

export interface PendingConfirmation {
  id: string;
  actionName: string;
  title: string;
  description: string;
  params: Record<string, any>;
  warning?: string;
  expiresAt: number;
}

export interface AssistantResponse {
  replyText: string;
  language: AssistantLanguage;
  understoodQuery: string;
  actions: AssistantAction[];
  results: AssistantResultCard[];
  needsConfirmation?: PendingConfirmation | null;
  suggestions?: string[];
  providerUsed: "llm" | "offline-rule-matcher";
}

export interface ToolDefinition {
  name: string;
  description: string;
  allowedRoles: string[]; // ["STUDENT", "FACULTY", "ADMIN", "ALL"]
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
  handler: (params: any, context: AssistantContext) => Promise<ToolExecutionResult>;
}

export interface AssistantContext {
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  departmentCode?: string;
  currentPage?: string;
  language: AssistantLanguage;
  isSandbox?: boolean;
}

export interface ToolExecutionResult {
  replyText: string;
  actions?: AssistantAction[];
  results?: AssistantResultCard[];
  needsConfirmation?: PendingConfirmation | null;
}
