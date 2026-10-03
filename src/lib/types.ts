// ============================================
// Interior Operations Control System - Types
// ============================================

export type UserRole = 'owner' | 'subadmin' | 'thekedar';

export type ProjectStatus = 'On Track' | 'Attention' | 'Delayed' | 'Completed';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical' | 'Urgent';
export type MaterialRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Ordered' | 'Partially Delivered' | 'Delivered';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus = 'Open' | 'In Review' | 'Assigned' | 'Resolved' | 'Closed';
export type IssueCategory = 'Material' | 'Labour' | 'Design' | 'Electrical' | 'Client' | 'Other';
export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day';
export type PhotoCategory = 'Progress' | 'Material' | 'Issue' | 'Before' | 'After' | 'Other';
export type DailyOverallStatus = 'Good' | 'Normal' | 'Delayed';
export type WorkerTrade = 'Carpenter' | 'Electrician' | 'Plumber' | 'Painter' | 'Mason' | 'Helper' | 'POP / False Ceiling' | 'Furniture Installer' | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  assignedSiteIds: string[];
  assignedProjectIds: string[];
  status?: 'Active' | 'Inactive';
  agencyName?: string;
  trade?: string;
  workerCount?: number;
  rating?: number;
  gstNumber?: string;
  panNumber?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  address: string;
  projectValue: number;
  startDate: string;
  expectedCompletion: string;
  progress: number;
  status: ProjectStatus;
  managerId: string;
  subAdminId: string;
  thekedarId: string;
  siteId: string;
  workerCount: number;
  description: string;
  budget?: number;
  spentCost?: number;
  materialCost?: number;
  labourCost?: number;
  billedAmount?: number;
  receivedAmount?: number;
  createdAt: string;
}

export interface Site {
  id: string;
  projectId: string;
  name: string;
  address: string;
  location: string;
  subAdminId: string;
  thekedarId: string;
  workerCount: number;
  status: ProjectStatus;
  lastUpdate: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  siteId: string;
  name: string;
  assignedTo: string;
  thekedarId: string;
  startDate: string;
  dueDate: string;
  progress: number;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  createdAt: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  workerId: string;
  trade: WorkerTrade;
  thekedarId: string;
  assignedSiteId: string;
  dailyWage: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface DailyUpdate {
  id: string;
  projectId: string;
  siteId: string;
  taskId: string;
  taskName: string;
  submittedBy: string;
  submittedByName: string;
  date: string;
  time: string;
  progress: number;
  description: string;
  status: TaskStatus;
  photos: string[];
  createdAt: string;
}

export interface DailyReport {
  id: string;
  projectId: string;
  siteId: string;
  submittedBy: string;
  submittedByName: string;
  date: string;
  workersPresent: number;
  workCompleted: string;
  materialReceived: string;
  materialNeeded: string;
  issues: string;
  overallProgress: DailyOverallStatus;
  notes: string;
  photos: string[];
  createdAt: string;
}

export interface Attendance {
  id: string;
  workerId: string;
  workerName: string;
  siteId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  totalStock: number;
  lowStockThreshold: number;
  createdAt: string;
}

export interface MaterialRequest {
  id: string;
  requestId: string;
  projectId: string;
  projectName: string;
  siteId: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  requiredBy: string;
  priority: TaskPriority;
  reason: string;
  requestedBy: string;
  requestedByName: string;
  status: MaterialRequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  issueId: string;
  projectId: string;
  projectName: string;
  siteId: string;
  category: IssueCategory;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  reportedBy: string;
  reportedByName: string;
  assignedTo?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  photos: string[];
  createdAt: string;
}

export interface SitePhoto {
  id: string;
  projectId: string;
  siteId: string;
  category: PhotoCategory;
  uploadedBy: string;
  uploadedByName: string;
  date: string;
  url: string;
  caption: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'daily_update' | 'material_request' | 'material_approval' | 'issue' | 'task_assignment' | 'project_delay' | 'worker_update' | 'daily_report';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  siteId?: string;
  userId: string;
  read: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  projectId?: string;
  projectName?: string;
  siteId?: string;
  details: string;
  createdAt: string;
}

// ── PAYROLL & PAYMENT GATEWAY TYPES ──
export interface StaffEmployee {
  id: string;
  empCode: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: 'Design & Architecture' | 'Site Operations' | 'Project Management' | 'Procurement' | 'Finance & Accounts' | 'Executive';
  joiningDate: string;
  monthlySalary: number;
  bankAccount: string;
  bankName: string;
  ifsc: string;
  upiId: string;
  panNumber: string;
  status: 'Active' | 'On Leave';
}

export interface PayrollRecord {
  id: string;
  batchNumber: string;
  cycle: string; // e.g. "September 2026", "Week 39 - Sep 2026"
  type: 'Staff Salary' | 'Labour Wages' | 'Contractor Milestone';
  recipientType: 'staff' | 'worker' | 'contractor';
  recipientId: string;
  recipientName: string;
  designationOrTrade: string;
  siteName?: string;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  upiId?: string;
  paymentRail: 'Instant UPI' | 'IMPS Direct' | 'NEFT Batch';
  
  // Calculations
  daysPresent?: number;
  daysInMonth?: number;
  baseAmount: number;
  overtimeAmount: number;
  incentiveBonus: number;
  grossAmount: number;
  pfDeduction: number;
  tdsDeduction: number;
  advanceDeduction: number;
  totalDeductions: number;
  netPayout: number;
  
  // Gateway metadata
  status: 'Pending' | 'Processing' | 'Disbursed' | 'Failed';
  gatewayProvider: 'RazorpayX Enterprise' | 'Cashfree Payouts' | 'ICICI Corporate Direct';
  utrNumber?: string;
  gatewayFee: number;
  disbursedAt?: string;
  createdAt: string;
}

export interface PaymentGatewayConfig {
  provider: 'RazorpayX Enterprise' | 'Cashfree Payouts' | 'ICICI Corporate Direct';
  accountNumber: string;
  accountHolder: string;
  balance: number;
  escrowBalance: number;
  dailyLimit: number;
  usedToday: number;
  isLive: boolean;
  autoRetry: boolean;
  webhookUrl: string;
  webhookSecret: string;
}

export interface ClientPaymentLink {
  id: string;
  linkNumber: string;
  clientName: string;
  clientPhone: string;
  projectName: string;
  milestoneDescription: string;
  amount: number;
  status: 'Paid' | 'Issued' | 'Expired';
  paymentMethod?: 'UPI' | 'NetBanking' | 'Corporate Card';
  paidAt?: string;
  utrNumber?: string;
  createdAt: string;
  expiresAt: string;
  shortUrl: string;
}

export interface MakerCheckerApproval {
  id: string;
  batchId: string;
  title: string;
  type: 'Staff Salary Batch' | 'Labour Wage Run' | 'Contractor Settlement' | 'Single Payout';
  totalAmount: number;
  beneficiaryCount: number;
  makerName: string;
  makerRole: string;
  initiatedAt: string;
  status: 'Pending Checker Signoff' | 'Approved & Executed' | 'Rejected';
  checkerName?: string;
  checkerRole?: string;
  approvedAt?: string;
  notes?: string;
  riskScore: 'Low' | 'Medium' | 'High';
}

export interface StatutoryChallan {
  id: string;
  challanNumber: string;
  section: 'TDS 194C (Contractors)' | 'TDS 192 (Salaries)' | 'EPFO (Provident Fund)' | 'ESIC (Insurance)';
  period: string; // e.g., "September 2026"
  totalTaxAmount: number;
  deducteeCount: number;
  status: 'Deposited to Treasury' | 'Ready for Direct Debit' | 'Draft';
  bsrCode?: string;
  challanDate?: string;
  ackNumber?: string;
}

export interface VirtualEscrowPool {
  id: string;
  name: string;
  accountNumber: string;
  poolType: 'Operating Payouts' | 'Labour Wage Escrow' | 'Contractor Retention (5%)' | 'Statutory Tax Reserve';
  balance: number;
  allocatedAmount: number;
  autoSweepEnabled: boolean;
  minThreshold: number;
}

// Store type
export interface AppState {
  users: User[];
  projects: Project[];
  sites: Site[];
  tasks: Task[];
  workers: Worker[];
  dailyUpdates: DailyUpdate[];
  dailyReports: DailyReport[];
  attendance: Attendance[];
  materials: Material[];
  materialRequests: MaterialRequest[];
  issues: Issue[];
  sitePhotos: SitePhoto[];
  notifications: Notification[];
  auditLog: AuditEntry[];
  staffEmployees: StaffEmployee[];
  payrollRecords: PayrollRecord[];
  gatewayConfig: PaymentGatewayConfig;
  clientPaymentLinks?: ClientPaymentLink[];
  makerCheckerApprovals?: MakerCheckerApproval[];
  statutoryChallans?: StatutoryChallan[];
  escrowPools?: VirtualEscrowPool[];
}

