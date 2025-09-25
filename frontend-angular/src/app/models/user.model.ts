export interface User {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}

export interface PaginatedUsers {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    roles: string[];
  }>;
}
