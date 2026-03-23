# Rule when agent work-
1. Don't change database model
2. document all changes thing change.md file step wise ever time after or every date and not overwrite changes.md file document after by after .
 
3. after plese ask me you write code or not
4. maitain the type safety 

## Recent Fixes (2026-03-23)
- **Middleware**: Always name the Clerk middleware file `middleware.ts` in the root.
- **LangGraph**: Parallel branches (`journaling_agent`, `data_agent`) must use conditional edges to route to `merge_report` when `agentType === "report"`.
- **Next.js**: Use `experimental.allowedDevOrigins` ONLY if supported by the version; remove if it causes build failures.
- **Environment**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is spelled correctly.
- **Next.js 15+ Routes**: Always `await params` in dynamic route handlers (GET/POST/PATCH/DELETE).
- **Type Overlap**: When checking `agent.status`, extend conditions to include `resuming` if child components depend on it, to avoid "no overlap" TS errors.
- **Imports**: Always verify hook and component paths (e.g., `@/components/hooks/...` instead of `@/hooks/...`).