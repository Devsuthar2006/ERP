// ============================================
// Interior Operations Control System - Types
// ============================================

export type UserRole = 'owner' | 'subadmin' | 'thekedar';

export type ProjectStatus = 'On Track' | 'Attention' | 'Delayed' | 'Completed';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
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
}
