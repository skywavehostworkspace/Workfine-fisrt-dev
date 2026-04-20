// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getTeamActivityFeed = query({
  args: { workspaceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .order("desc")
      .take(20);
  },
});

export const logActivity = mutation({
  args: {
    workspaceId: v.string(),
    userId: v.string(),
    userName: v.string(),
    userInitials: v.string(),
    action: v.string(),
    taskName: v.string(),
    taskId: v.string(),
    projectName: v.string(),
    assigneeName: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLogs", args);
  },
});
