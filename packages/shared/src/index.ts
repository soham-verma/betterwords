export type DocRole = 'viewer' | 'editor' | 'owner';

export interface DocumentMeta {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentPermission {
  documentId: string;
  userId?: string;
  email?: string;
  role: DocRole;
}
