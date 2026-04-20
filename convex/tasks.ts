// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMyFocusTasks = query({
  args: { 
    userId: v.string(),
    today: v.optional(v.string()) // ISO date or full ISO string
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("assigneeId"), args.userId))
      .collect();

    // Use YYYY-MM-DD comparison as requested
    const todayStr = args.today || new Date().toISOString();
    const todayISO = todayStr.split("T")[0];

    const overdue = tasks.filter(t => 
      t.status !== "done" && 
      t.dueDate && t.dueDate < todayISO
    );

    const dueToday = tasks.filter(t => 
      t.dueDate === todayISO
    );

    const next48hrs = new Date(todayISO);
    next48hrs.setDate(next48hrs.getDate() + 2);
    const next48ISO = next48hrs.toISOString().split("T")[0];

    const upcoming48hrs = tasks.filter(t => {
      return t.dueDate > todayISO && t.dueDate <= next48ISO;
    });

    return { overdue, dueToday, upcoming48hrs };
  },
});

export const getTaskStats = query({
  args: { workspaceId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split("T")[0];

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect();

    const overdueTasks = tasks.filter((t) => 
      t.dueDate && t.dueDate < todayISO && t.status !== "done"
    );

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;

    return {
      totalTasks,
      completedTasks,
      overdueTasks, // Array enables .length usage
      overdueCount: overdueTasks.length // Also direct number
    };
  },
});

export const getOverdueTasks = query({
  args: { workspaceId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split("T")[0];

    return await ctx.db
      .query("tasks")
      .filter((q) => 
        q.and(
          q.eq(q.field("workspaceId"), args.workspaceId),
          q.neq(q.field("status"), "done"),
          q.lt(q.field("dueDate"), todayISO)
        )
      )
      .collect();
  },
});

export const createTask = mutation({
  args: {
    workspaceId: v.string(),
    projectId: v.string(),
    projectName: v.string(),
    name: v.string(),
    assignee: v.string(),
    assigneeId: v.string(),
    status: v.string(),
    priority: v.string(),
    dueDate: v.string(),
    userId: v.string(),
    userName: v.string(),
    userInitials: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, userName, userInitials, ...taskData } = args;
    const taskId = await ctx.db.insert("tasks", {
      ...taskData,
      subtasks: [],
      attachments: []
    });

    console.log("logActivity payload", { assigneeName: args.assignee });

    await ctx.db.insert("activityLogs", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      userName: args.userName,
      userInitials: args.userInitials,
      action: "created a task",
      taskName: args.name,
      taskId: taskId,
      projectName: args.projectName,
      assigneeName: args.assignee,
      assigneeId: args.assigneeId,
    });

    return taskId;
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.string(),
    workspaceId: v.string(),
    userId: v.string(),
    userName: v.string(),
    userInitials: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, { status: args.status });

    await ctx.db.insert("activityLogs", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      userName: args.userName,
      userInitials: args.userInitials,
      action: `moved task to ${args.status}`,
      taskName: task.name,
      taskId: args.taskId,
      projectName: "Project", // Ideally fetched or passed
      assigneeName: task.assignee,
      assigneeId: task.assigneeId,
    });
  },
});

export const getUpcomingDeadlines = query({
  args: { 
    workspaceId: v.string(),
    daysAhead: v.number(),
    today: v.optional(v.string()) // Keeping optional for UI compatibility
  },
  handler: async (ctx, args) => {
    const todayStr = args.today || new Date().toISOString();
    const todayISO = todayStr.split("T")[0];
    
    const futureDate = new Date(todayISO);
    futureDate.setDate(futureDate.getDate() + args.daysAhead);
    const futureISO = futureDate.toISOString().split("T")[0];

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => 
        q.and(
          q.eq(q.field("workspaceId"), args.workspaceId),
          q.neq(q.field("status"), "done"),
          q.gte(q.field("dueDate"), todayISO),
          q.lte(q.field("dueDate"), futureISO)
        )
      )
      .collect();

    return tasks.sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
  },
});

export const getWorkspaceMembers = query({
  args: { workspaceId: v.string() },
  handler: async (ctx, args) => {
    // In a real app, we'd query a members table. 
    // Here we return a predefined set for the workspace to match project requirements.
    return [
      { userId: "u1", fullName: "Alex Rivera", initials: "AR", email: "alex@sovereign.work", role: "Product Lead", avatarColor: "#5B4FE8" },
      { userId: "u2", fullName: "Sarah Chen", initials: "SC", email: "sarah@sovereign.work", role: "Design Lead", avatarColor: "#14C38E" },
      { userId: "u3", fullName: "Jordan Smith", initials: "JS", email: "jordan@sovereign.work", role: "Sr. Engineer", avatarColor: "#F5A623" },
      { userId: "u4", fullName: "Marcus Wright", initials: "MW", email: "marcus@sovereign.work", role: "QA Engineer", avatarColor: "#F03D3D" },
      { userId: "u5", fullName: "Elena Rossi", initials: "ER", email: "elena@sovereign.work", role: "Marketing", avatarColor: "#2D9CDB" },
    ];
  },
});

export const updateTaskAssignee = mutation({
  args: {
    taskId: v.id("tasks"),
    assigneeId: v.string(),
    assigneeName: v.string(),
    assigneeInitials: v.string(),
    workspaceId: v.string(),
    userId: v.string(),
    userName: v.string(),
    userInitials: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, { 
      assigneeId: args.assigneeId,
      assignee: args.assigneeName // In this schema "assignee" is the name string
    });

    await ctx.db.insert("activityLogs", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      userName: args.userName,
      userInitials: args.userInitials,
      action: `reassigned task to ${args.assigneeName}`,
      taskName: task.name,
      taskId: args.taskId,
      projectName: task.projectName || "Project",
      assigneeName: args.assigneeName,
      assigneeId: args.assigneeId,
    });
  },
});
