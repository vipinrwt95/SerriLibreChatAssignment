export interface IContact {
  name: string;
  email?: string;
  company?: string;
  role?: string;
  notes?: string;
  attributes?: Record<string, unknown>;
  tenantId?: string;
  search_text: string;
  createdAt?: Date;
  updatedAt?: Date;
}