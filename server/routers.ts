import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createConservativeVoiceConnection } from "./livekit";
import {
  listVoiceFilesForUser,
  removeVoiceFileForUser,
  uploadVoiceFileForUser,
  voiceFileInput,
} from "./voiceFiles";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  voiceFiles: router({
    list: protectedProcedure.query(({ ctx }) => listVoiceFilesForUser(ctx.user.id)),
    upload: protectedProcedure.input(voiceFileInput).mutation(({ ctx, input }) =>
      uploadVoiceFileForUser(ctx.user.id, input),
    ),
    remove: protectedProcedure.input(z.object({ fileId: z.number().int().positive() })).mutation(({ ctx, input }) =>
      removeVoiceFileForUser(ctx.user.id, input.fileId),
    ),
  }),
  voice: router({
    createConnection: protectedProcedure.mutation(({ ctx }) =>
      createConservativeVoiceConnection(ctx.user.id),
    ),
  }),
});

export type AppRouter = typeof appRouter;
