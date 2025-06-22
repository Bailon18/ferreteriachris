

export class User {
    id?: number;
    name: string;
    document: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    isActive: string;
    tokenPassword?: string;
    roles: Rol[];
  }
  
  export interface Rol {
    id?: number;
    rolName: string;
  }
  