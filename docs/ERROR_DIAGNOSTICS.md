# JanSetu Error Diagnostics

## Operator workflow

1. Capture the client `X-Request-ID` or the `error.requestId` value.
2. Search backend logs for `requestId=<value>`.
3. For failures, inspect `event=request.error`, `operation`, `stage`, `errorCode`, `sourceType`, `sourceCode`, `causeName`, `causeCode`, `statusCode`, `retryable`, `stack`, and `causeStack`.
4. If no Fastify log exists, inspect the repository-controlled Nginx access log using the request ID and compare `status`, `upstream_status`, `upstream_addr`, `request_time`, `upstream_connect_time`, and `upstream_response_time`.
5. If neither log contains the ID, the request likely failed before reaching repository-controlled Nginx/Fastify. Obtain Hostinger proxy/container ingress logs for the timestamp, method, path, client-facing status, upstream status, and request ID.

Passwords, JWTs, survey bodies, cookies, and database URLs must not be searched for or added to diagnostic logs.

## Coverage matrix

| Boundary | Operation/stage | Public classification | Verification |
|---|---|---|---|
| Fastify validation and malformed payload | `request.validation` | `VALIDATION_ERROR` / 400 or 413 | `errors.test.ts` |
| Unknown route | `request.routing` | `NOT_FOUND` / 404 | `errors.test.ts` |
| Rate limiter | `request.rate_limit` | `RATE_LIMITED` / 429 | `errors.test.ts` |
| Missing/invalid JWT | `auth.verify` | `AUTHENTICATION_ERROR` / 401 | `errors.test.ts` |
| Login credentials | `auth.credentials_check` | `AUTHENTICATION_ERROR` / 401 | Existing login behavior plus error mapping |
| Login user provisioning | `auth.user_upsert` | Prisma-derived database code | Context preservation test |
| Login token signing | `auth.jwt_sign` | `INTERNAL_ERROR` / 500 | Central handler classification |
| Prisma/PostgreSQL availability | database query | `DATABASE_UNAVAILABLE` / 503 | `errors.test.ts` |
| Prisma/PostgreSQL schema/permission | database query | `DATABASE_SCHEMA_ERROR` / 500 | `errors.test.ts` |
| Conflict/not found/foreign key | database query | `CONFLICT` or `NOT_FOUND` | `errors.test.ts` |
| Query cancellation/timeout | database/request | `REQUEST_TIMEOUT` / 504 | `errors.test.ts` |
| Cloudinary upload | `photo.upload` / external service | `EXTERNAL_SERVICE_ERROR` / 503 | Central handler path |
| Controller fallback errors | controller operation | Central handler classification | `sendInternalError` propagation |
| Browser network/timeout/abort | API client | typed `ApiError.failureType` | Frontend TypeScript build |
| Non-JSON proxy response | API client response parsing | `MALFORMED_RESPONSE` | Frontend TypeScript build |
| Nginx upstream failure | proxy boundary | Nginx access log; no Fastify evidence | Requires Hostinger/staging Nginx |
| Hostinger ingress failure | outside application | Provider logs required | Not observable locally |

The external proxy and Hostinger ingress rows are intentionally not marked as application-tested: they cannot be confirmed from Fastify logs when the request never reaches the process.
