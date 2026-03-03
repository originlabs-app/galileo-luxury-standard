import type { CookieSerializeOptions } from "@fastify/cookie";
import type { FastifyReply } from "fastify";
import { config } from "../config.js";

const isProduction = config.NODE_ENV === "production";

export const ACCESS_COOKIE_NAME = "galileo_at";
export const REFRESH_COOKIE_NAME = "galileo_rt";

const accessCookieOptions: CookieSerializeOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60, // 15 minutes in seconds
};

const refreshCookieOptions: CookieSerializeOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/auth/refresh",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

/**
 * Set both access and refresh token cookies on a reply.
 */
export function setAuthCookies(
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string,
): void {
  reply.setCookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
  reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
}

/**
 * Clear both auth cookies by setting them to empty with immediate expiration.
 */
export function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie(ACCESS_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
  reply.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/auth/refresh",
  });
}
