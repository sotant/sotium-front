import { normalizeUsers } from "@/entities/user/model/user.schema";
import type { User } from "@/entities/user/model/user";

export function mapJavaUsers(payload: unknown): User[] {
  return normalizeUsers(payload);
}
