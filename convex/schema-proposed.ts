import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * Proposed schema for June Bug journaling app
 *
 * Key design decisions:
 * 1. Tags use join table (entryTags) for flexibility
 * 2. AI questions have templates + user instances for hybrid approach
 * 3. TipTap content stored as JSON string
 * 4. Timestamps are milliseconds (Date.now())
 * 5. Soft deletes via isActive flags
 */

export default defineSchema({
  // ============================================================================
  // CORE TABLES (from existing schema)
  // ============================================================================

  users: defineTable({
    // Auth fields (existing)
    email: v.string(),
    authId: v.optional(v.string()),

    // Profile fields (new from SQL schema)
    phone: v.optional(v.string()), // Optional - not everyone provides phone
    isOnboarded: v.boolean(), // Has completed onboarding flow
    age: v.optional(v.number()), // Optional for privacy
    role: v.string(), // "user" | "mentor" | "admin"
    title: v.optional(v.string()), // Professional title or label
    goals: v.optional(v.string()), // User's stated goals (long text)
    mentorshipStyle: v.optional(v.string()), // Preferred mentorship approach

    // Notification settings (new from SQL schema)
    isPushNotifications: v.boolean(), // Enable/disable push notifications
    journalFrequency: v.string(), // "daily" | "weekly" | "monthly"
    notificationTime: v.optional(v.number()), // Time of day (milliseconds since midnight)

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('email', ['email'])
    .index('role', ['role']), // For querying mentors

  // ============================================================================
  // JOURNAL ENTRIES
  // ============================================================================

  entries: defineTable({
    userId: v.id('users'),
    entryDate: v.number(), // Date user selected (can be past) - midnight timestamp
    content: v.string(), // TipTap JSON stringified
    plainText: v.optional(v.string()), // Plain text extracted for search/AI
    isActive: v.boolean(), // Soft delete flag
    createdAt: v.number(), // When entry was actually created
    updatedAt: v.number(), // Last edited
  })
    .index('userId', ['userId'])
    .index('userId_entryDate', ['userId', 'entryDate'])
    .index('userId_isActive', ['userId', 'isActive'])
    .index('userId_isActive_entryDate', ['userId', 'isActive', 'entryDate']), // For sorted active entries

  // ============================================================================
  // TAGS (with join table)
  // ============================================================================

  tags: defineTable({
    name: v.string(), // Tag name (e.g., "work", "personal", "gratitude")
    isSystemGenerated: v.boolean(), // System tag vs user-created
    emoji: v.optional(v.string()), // Optional emoji icon
    userId: v.optional(v.id('users')), // Null for system tags, set for user tags
    color: v.optional(v.string()), // Hex color for UI
    isActive: v.boolean(), // Soft delete
    createdAt: v.number(),
  })
    .index('userId', ['userId'])
    .index('name', ['name'])
    .index('userId_name', ['userId', 'name']) // Unique per user
    .index('isSystemGenerated', ['isSystemGenerated']),

  entryTags: defineTable({
    entryId: v.id('entries'),
    tagId: v.id('tags'),
    createdAt: v.number(),
  })
    .index('entryId', ['entryId'])
    .index('tagId', ['tagId'])
    .index('entryId_tagId', ['entryId', 'tagId']), // Prevent duplicate tags on entry

  // ============================================================================
  // AI QUESTIONS (hybrid approach: templates + user instances)
  // ============================================================================

  aiQuestionTemplates: defineTable({
    text: v.string(), // Template question text (may have {{placeholders}})
    category: v.string(), // "reflection" | "goal-setting" | "gratitude" | "growth"
    tags: v.array(v.string()), // Keywords for matching to user interests
    difficultyLevel: v.optional(v.string()), // "beginner" | "intermediate" | "advanced"
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('category', ['category'])
    .index('isActive', ['isActive'])
    .index('category_isActive', ['category', 'isActive']),

  aiQuestions: defineTable({
    userId: v.id('users'),
    entryId: v.optional(v.id('entries')), // Null if general question, set if entry-specific
    templateId: v.optional(v.id('aiQuestionTemplates')), // If derived from template
    text: v.string(), // Personalized question text
    category: v.string(),
    isAnswered: v.boolean(), // Has user responded to this question
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index('userId', ['userId'])
    .index('entryId', ['entryId'])
    .index('userId_isAnswered', ['userId', 'isAnswered'])
    .index('userId_category', ['userId', 'category']),

  // ============================================================================
  // STREAKS (habit tracking)
  // ============================================================================

  streaks: defineTable({
    userId: v.id('users'),
    date: v.number(), // Midnight timestamp in user's timezone
    timezone: v.string(), // e.g., "America/New_York"
    entryId: v.optional(v.id('entries')), // Which entry completed the streak
    createdAt: v.number(),
  })
    .index('userId', ['userId'])
    .index('userId_date', ['userId', 'date']) // One streak record per user per day
    .index('date', ['date']), // For global streak queries

  // ============================================================================
  // PROJECTS (SKIPPED FOR NOW - uncomment when ready)
  // ============================================================================

  // projects: defineTable({
  //   userId: v.id('users'),
  //   title: v.string(),
  //   description: v.optional(v.string()), // FIXED: was BIGINT in SQL!
  //   color: v.string(), // Hex color
  //   isActive: v.boolean(),
  //   createdAt: v.number(),
  //   updatedAt: v.number(),
  // })
  //   .index('userId', ['userId'])
  //   .index('userId_isActive', ['userId', 'isActive']),

  // entryProjects: defineTable({
  //   entryId: v.id('entries'),
  //   projectId: v.id('projects'),
  //   createdAt: v.number(),
  // })
  //   .index('entryId', ['entryId'])
  //   .index('projectId', ['projectId'])
  //   .index('entryId_projectId', ['entryId', 'projectId']),

  // ============================================================================
  // TODOS (existing - keep for now)
  // ============================================================================

  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    userId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('userId', ['userId']),
})
