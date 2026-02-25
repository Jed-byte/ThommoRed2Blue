import { apiRequest } from "./queryClient";

export const api = {
  // Assessment endpoints
  assessments: {
    create: (data: any) => apiRequest("POST", "/api/assessments", data),
    getLatest: (userId: number) => apiRequest("GET", `/api/assessments/latest/${userId}`),
    getByUser: (userId: number) => apiRequest("GET", `/api/assessments/user/${userId}`),
  },

  // Chat endpoints
  chat: {
    sendMessage: (data: { userId: number; message: string; sessionId?: number }) =>
      apiRequest("POST", "/api/chat", data),
    getSessions: (userId: number) => apiRequest("GET", `/api/chat/sessions/${userId}`),
  },

  // Progress endpoints
  progress: {
    create: (data: any) => apiRequest("POST", "/api/progress", data),
    getByUser: (userId: number, days?: number) => 
      apiRequest("GET", `/api/progress/${userId}${days ? `?days=${days}` : ""}`),
  },

  // Technique endpoints
  techniques: {
    getAll: () => apiRequest("GET", "/api/techniques"),
    getByCategory: (category: string) => apiRequest("GET", `/api/techniques?category=${category}`),
  },

  // Scenario endpoints
  scenarios: {
    getAll: () => apiRequest("GET", "/api/scenarios"),
    getByPressureLevel: (level: string) => apiRequest("GET", `/api/scenarios?pressureLevel=${level}`),
  },

  // Plan generation
  generatePlan: (userId: number, goals?: string[]) => 
    apiRequest("POST", `/api/generate-plan/${userId}`, { goals }),
};
