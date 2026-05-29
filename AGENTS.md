# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Testing

**Backend**: Run from `booking_system_backend/` directory:
- Single test: `pytest tests/test_services.py::test_function_name -v`
- All tests: `pytest`

**Frontend**: No test suite configured (only build validation via `npm run build`)

## Critical Patterns

**Backend**:
- MCP server MUST be created before FastAPI app (server.py line 16) - lifespan combination requirement
- Service functions return `Union[SuccessType, ErrorResponse]` - always check type before using
- Database sessions: Use `SessionLocal()` in try/finally blocks for MCP tools (see server.py examples)
- Test fixtures use in-memory SQLite with `StaticPool` - monkeypatch both `db.SessionLocal` and `server.SessionLocal`

**Frontend**:
- API base URL from `import.meta.env.VITE_API_URL` (not process.env)
- Error responses have `success: false` field - use `isErrorResponse()` helper (api.ts line 109)
- Backend returns `/api/*` endpoints but axios baseURL is root (paths in api.ts don't include /api prefix)

## Architecture Notes

- Backend uses service layer pattern - business logic in `services/`, thin wrappers in `server.py`
- Dual protocol: Same logic exposed via REST (FastAPI) and MCP (FastMCP) from single server
- Frontend uses React Router v6 with user context via custom `useUser` hook