export interface AuditEntry {
  auditId: number;
  operationType: 'INSERT' | 'UPDATE' | 'DELETE' | string;
  updatedAt: string;
  studentId: number;
  studentName: string;
  subjectLabel: string;
  oldValue: number | null;
  newValue: number | null;
  dbUser: string;
}

export interface AuditStats {
  insertCount: number;
  updateCount: number;
  deleteCount: number;
  totalCount: number;
}
