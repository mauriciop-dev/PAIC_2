import { Type } from "@google/genai";

// Obfuscated tool spec sent to the AI.
// Names and descriptions are intentionally vague to prevent prompt injection
// that could expose internal function names.
export const HIDDEN_TOOLS_SPEC = [{
  functionDeclarations: [
    {
      name: "resident_action_tool_1",
      description: "INTERNAL TOOL: Manage registered occupants (create).",
      parameters: { type: Type.OBJECT, properties: {
        apartment: { type: Type.STRING, description: "Unit identifier." },
        name: { type: Type.STRING, description: "Full name." },
        email: { type: Type.STRING, description: "Email address." },
        phone: { type: Type.STRING, description: "Phone number." },
      }, required: ["apartment", "name", "email", "phone"] }
    },
    {
      name: "resident_action_tool_2",
      description: "INTERNAL TOOL: Modify registered occupant data.",
      parameters: { type: Type.OBJECT, properties: {
        apartment: { type: Type.STRING, description: "Target unit." },
        data: { type: Type.OBJECT, properties: {
          name: { type: Type.STRING }, email: { type: Type.STRING }, phone: { type: Type.STRING },
        }, description: "Fields to update." }
      }, required: ["apartment", "data"] }
    },
    {
      name: "resident_action_tool_3",
      description: "INTERNAL TOOL: Remove an occupant record.",
      parameters: { type: Type.OBJECT, properties: {
        apartment: { type: Type.STRING, description: "Unit to remove." },
      }, required: ["apartment"] }
    },
    {
      name: "provider_tool_1",
      description: "INTERNAL TOOL: Register a new service provider.",
      parameters: { type: Type.OBJECT, properties: {
        company: { type: Type.STRING, description: "Provider name." },
        specialty: { type: Type.STRING, description: "Service category." },
        email: { type: Type.STRING }, phone: { type: Type.STRING },
      }, required: ["company", "specialty", "email", "phone"] }
    },
    {
      name: "provider_tool_2",
      description: "INTERNAL TOOL: Update provider information.",
      parameters: { type: Type.OBJECT, properties: {
        company: { type: Type.STRING, description: "Provider to modify." },
        data: { type: Type.OBJECT, properties: {
          specialty: { type: Type.STRING }, email: { type: Type.STRING }, phone: { type: Type.STRING },
        }, description: "Fields to update." }
      }, required: ["company", "data"] }
    },
    {
      name: "provider_tool_3",
      description: "INTERNAL TOOL: Remove a service provider.",
      parameters: { type: Type.OBJECT, properties: {
        company: { type: Type.STRING, description: "Provider to remove." },
      }, required: ["company"] }
    },
    {
      name: "staff_tool_1",
      description: "INTERNAL TOOL: Add internal personnel record.",
      parameters: { type: Type.OBJECT, properties: {
        name: { type: Type.STRING }, position: { type: Type.STRING, description: "Job title." },
        email: { type: Type.STRING }, phone: { type: Type.STRING },
      }, required: ["name", "position", "email", "phone"] }
    },
    {
      name: "staff_tool_2",
      description: "INTERNAL TOOL: Update internal personnel data.",
      parameters: { type: Type.OBJECT, properties: {
        name: { type: Type.STRING, description: "Person to update." },
        data: { type: Type.OBJECT, properties: {
          position: { type: Type.STRING }, email: { type: Type.STRING }, phone: { type: Type.STRING },
        }, description: "Fields to update." }
      }, required: ["name", "data"] }
    },
    {
      name: "staff_tool_3",
      description: "INTERNAL TOOL: Delete personnel record.",
      parameters: { type: Type.OBJECT, properties: {
        name: { type: Type.STRING, description: "Person to remove." },
      }, required: ["name"] }
    },
    {
      name: "reservation_tool_1",
      description: "INTERNAL TOOL: Book a shared facility.",
      parameters: { type: Type.OBJECT, properties: {
        commonAreaName: { type: Type.STRING }, apartment: { type: Type.STRING },
        date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
        startTime: { type: Type.STRING, description: "Format HH:mm" },
        endTime: { type: Type.STRING, description: "Format HH:mm" },
      }, required: ["commonAreaName", "apartment", "date", "startTime", "endTime"] }
    },
    {
      name: "query_tool_1",
      description: "INTERNAL TOOL: Look up stored records.",
      parameters: { type: Type.OBJECT, properties: {
        table: { type: Type.STRING, enum: ["residents", "account_status"] },
        query_description: { type: Type.STRING, description: "Natural language query." },
      }, required: ["table", "query_description"] }
    },
    {
      name: "query_tool_2",
      description: "INTERNAL TOOL: Find service providers.",
      parameters: { type: Type.OBJECT, properties: {
        specialty: { type: Type.STRING },
      } }
    },
    {
      name: "communication_tool_1",
      description: "INTERNAL TOOL: Send group notification.",
      parameters: { type: Type.OBJECT, properties: {
        group: { type: Type.STRING, enum: ["all", "debtors", "providers", "internal"] },
        subject: { type: Type.STRING }, body: { type: Type.STRING },
      }, required: ["group", "subject", "body"] }
    },
    {
      name: "finance_tool_1",
      description: "INTERNAL TOOL: Record revenue entry.",
      parameters: { type: Type.OBJECT, properties: {
        description: { type: Type.STRING }, amount: { type: Type.NUMBER },
        category: { type: Type.STRING, enum: ["Cuota de Administración", "Multas", "Alquiler de Áreas", "Otros"] },
        date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
      }, required: ["description", "amount", "category", "date"] }
    },
    {
      name: "finance_tool_2",
      description: "INTERNAL TOOL: Record expense entry.",
      parameters: { type: Type.OBJECT, properties: {
        description: { type: Type.STRING }, amount: { type: Type.NUMBER },
        category: { type: Type.STRING, enum: ["Servicios", "Mantenimiento", "Nómina", "Administrativos", "Otros"] },
        date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
        providerId: { type: Type.INTEGER },
      }, required: ["description", "amount", "category", "date"] }
    },
    {
      name: "security_tool_1",
      description: "INTERNAL TOOL: Approve guest access.",
      parameters: { type: Type.OBJECT, properties: {
        visitorName: { type: Type.STRING }, apartment: { type: Type.STRING },
        date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
      }, required: ["visitorName", "apartment", "date"] }
    },
    {
      name: "security_tool_2",
      description: "INTERNAL TOOL: Log delivered item.",
      parameters: { type: Type.OBJECT, properties: {
        apartment: { type: Type.STRING }, courier: { type: Type.STRING },
        trackingNumber: { type: Type.STRING },
      }, required: ["apartment", "courier"] }
    },
    {
      name: "security_tool_3",
      description: "INTERNAL TOOL: Update visitor status.",
      parameters: { type: Type.OBJECT, properties: {
        logId: { type: Type.INTEGER },
        status: { type: Type.STRING, enum: ["Ingresó", "Salió"] },
      }, required: ["logId", "status"] }
    },
    {
      name: "query_tool_3",
      description: "INTERNAL TOOL: List accounts with outstanding balance.",
      parameters: { type: Type.OBJECT, properties: {} }
    },
  ]
}];

export const TOOL_IMPLEMENTATION_MAP: Record<string, string> = {
  "resident_action_tool_1": "addResident",
  "resident_action_tool_2": "updateResident",
  "resident_action_tool_3": "deleteResident",
  "provider_tool_1": "addProvider",
  "provider_tool_2": "updateProvider",
  "provider_tool_3": "deleteProvider",
  "staff_tool_1": "addInternalStaff",
  "staff_tool_2": "updateInternalStaff",
  "staff_tool_3": "deleteInternalStaff",
  "reservation_tool_1": "createReservation",
  "query_tool_1": "queryDatabase",
  "query_tool_2": "queryProviders",
  "communication_tool_1": "sendMassEmail",
  "finance_tool_1": "addIncome",
  "finance_tool_2": "addExpense",
  "security_tool_1": "authorizeVisitor",
  "security_tool_2": "registerPackage",
  "security_tool_3": "updateVisitorStatus",
  "query_tool_3": "queryDebtors"
};
