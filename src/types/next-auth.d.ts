import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatar?: string | null;
    departmentCode?: string | null;
    collegeId?: string | null;
    collegeName?: string | null;
    collegeCity?: string | null;
    collegeState?: string | null;
    collegeLogoUrl?: string | null;
    collegeThemeColor?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      avatar?: string | null;
      departmentCode?: string | null;
      collegeId?: string | null;
      collegeName?: string | null;
      collegeCity?: string | null;
      collegeState?: string | null;
      collegeLogoUrl?: string | null;
      collegeThemeColor?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    departmentCode?: string | null;
    avatar?: string | null;
    collegeId?: string | null;
    collegeName?: string | null;
    collegeCity?: string | null;
    collegeState?: string | null;
    collegeLogoUrl?: string | null;
    collegeThemeColor?: string | null;
  }
}
