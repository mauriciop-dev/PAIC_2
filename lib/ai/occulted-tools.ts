import { geminiTools } from '../../services/geminiTools';

// Since the AI runs entirely on the backend, these tool declarations
// are never exposed to the client browser, satisfying the security requirements.
export const HIDDEN_TOOLS_SPEC = geminiTools;

// Map of tool names to backend operations
export const TOOL_IMPLEMENTATION_MAP: Record<string, string> = {
  "addResident": "addResident",
  "updateResident": "updateResident",
  "deleteResident": "deleteResident",
  "addProvider": "addProvider",
  "updateProvider": "updateProvider",
  "deleteProvider": "deleteProvider",
  "addInternalStaff": "addInternalStaff",
  "updateInternalStaff": "updateInternalStaff",
  "deleteInternalStaff": "deleteInternalStaff",
  "createReservation": "createReservation",
  "queryDatabase": "queryDatabase",
  "queryProviders": "queryProviders",
  "sendMassEmail": "sendMassEmail",
  "addIncome": "addIncome",
  "addExpense": "addExpense",
  "authorizeVisitor": "authorizeVisitor",
  "registerPackage": "registerPackage",
  "updateVisitorStatus": "updateVisitorStatus",
  "queryDebtors": "queryDebtors"
};
