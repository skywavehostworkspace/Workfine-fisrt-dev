// @ts-nocheck
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    workspaceId: v.string(),
    projectId: v.string(),
    name: v.string(),
    assignee: v.string(),
    assigneeId: v.string(),
    status: v.string(),
    priority: v.string(),
    dueDate: v.string(),
    subtasks: v.array(v.any()),
    attachments: v.array(v.any()),
  }),
  activityLogs: defineTable({
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
  }),
});
