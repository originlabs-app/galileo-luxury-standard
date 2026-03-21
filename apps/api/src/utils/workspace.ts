import type { FastifyJWT } from "@fastify/jwt";
import type { FastifyReply } from "fastify";

type WorkspaceUser = FastifyJWT["user"];

type WorkspaceMembership =
  | {
      isAdmin: true;
      brandId: null;
    }
  | {
      isAdmin: false;
      brandId: string;
    };

function sendForbidden(reply: FastifyReply, message: string) {
  return reply.status(403).send({
    success: false,
    error: {
      code: "FORBIDDEN",
      message,
    },
  });
}

export function requireWorkspaceMembership(
  reply: FastifyReply,
  user: WorkspaceUser,
  message = "User must belong to a brand",
): WorkspaceMembership | null {
  if (user.role === "ADMIN") {
    return { isAdmin: true, brandId: null };
  }

  if (!user.brandId) {
    sendForbidden(reply, message);
    return null;
  }

  return { isAdmin: false, brandId: user.brandId };
}

export function buildWorkspaceBrandFilter(
  reply: FastifyReply,
  user: WorkspaceUser,
  message = "User must belong to a brand",
): Record<string, string> | null {
  const membership = requireWorkspaceMembership(reply, user, message);

  if (!membership) {
    return null;
  }

  if (membership.isAdmin) {
    return {};
  }

  return { brandId: membership.brandId };
}

export function ensureSameWorkspaceBrand(
  reply: FastifyReply,
  user: WorkspaceUser,
  resourceBrandId: string,
  options?: {
    membershipMessage?: string;
    accessDeniedMessage?: string;
  },
): boolean {
  const membership = requireWorkspaceMembership(
    reply,
    user,
    options?.membershipMessage,
  );

  if (!membership) {
    return false;
  }

  if (membership.isAdmin || membership.brandId === resourceBrandId) {
    return true;
  }

  // Return 404 (not 403) to avoid leaking that the resource exists for another brand
  reply.status(404).send({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: options?.accessDeniedMessage ?? "Not found",
    },
  });
  return false;
}

export function resolveWorkspaceMutationBrandId(
  reply: FastifyReply,
  user: WorkspaceUser,
  requestedBrandId?: string,
  options?: {
    membershipMessage?: string;
    missingAdminBrandMessage?: string;
  },
): string | null {
  const membership = requireWorkspaceMembership(
    reply,
    user,
    options?.membershipMessage,
  );

  if (!membership) {
    return null;
  }

  if (!membership.isAdmin) {
    return membership.brandId;
  }

  if (!requestedBrandId) {
    reply.status(400).send({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message:
          options?.missingAdminBrandMessage ??
          "ADMIN must provide brandId in request body",
      },
    });
    return null;
  }

  return requestedBrandId;
}

export function buildWorkspaceProductByIdWhere(
  reply: FastifyReply,
  user: WorkspaceUser,
  id: string,
): { id: string; brandId?: string } | null {
  const membership = requireWorkspaceMembership(reply, user);
  if (!membership) return null;
  if (membership.isAdmin) return { id };
  return { id, brandId: membership.brandId };
}
