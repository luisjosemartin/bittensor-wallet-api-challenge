# 🔧 Improvements & Pending Tasks

This document outlines areas for improvement and tasks that were left pending during the development of the Bittensor Wallet API.

## 📦 Deployment & Infrastructure

### Docker Production Setup
- **Status**: Pending
- **Description**: Create optimized production Dockerfile with multi-stage builds
- **Impact**: Currently only development Docker setup exists

## 🔒 Security & Dependencies

### Dependency Security Warnings
- **Description**: Several security warnings appear when running `npm install`
- **Action Required**: Audit and update vulnerable dependencies
- **Priority**: High - Security implications

## 🧪 Testing Improvements

### Enhanced Test Coverage
- **Status**: Can be improved
- **Description**: Some components could benefit from better mocking and more comprehensive test scenarios
- **Areas to improve**:
  - Mock external dependencies more thoroughly
  - Add more edge case testing
  - Increase integration test coverage

### Audit Logging in Tests
- **Description**: Add environment variable to disable audit logging during tests
- **Benefits**: 
  - Significantly faster test execution
  - Cleaner test output
  - Reduced database operations during testing
- **Implementation**: 
  ```typescript
  // In AuditService
  if (process.env.DISABLE_AUDIT_LOGS === 'true') return;
  ```
- **Priority**: Medium - Performance improvement

## 📊 Audit & Monitoring Enhancements

### Input Sanitization Logging
- **Status**: Good idea, not implemented
- **Description**: Log audit events when InputSanitizerMiddleware cleans suspicious input
- **Benefits**:
  - Track potential attack attempts
  - Monitor input validation effectiveness
  - Security incident detection
- **Implementation**: Add audit log when sanitizer modifies input

### Asynchronous Audit Logging
- **Status**: Potential improvement
- **Description**: Make audit logging non-blocking to prevent request delays
- **Current Issue**: Failed audit log creation can cause request failure even when main operation succeeds
- **Solutions**:
  - Use message queues (Redis/RabbitMQ)
  - Background job processing
  - Fire-and-forget logging with error handling
- **Benefits**:
  - Improved request performance
  - Better user experience
  - Fault tolerance

## 🚦 Rate Limiting & Scalability

### Redis-based Rate Limiting
- **Status**: Documented improvement needed
- **Current**: In-memory rate limiting with `rate-limiter-flexible`
- **Limitation**: Won't work across multiple server instances
- **Solution**: Implement Redis backend for distributed rate limiting
- **Code location**: `RateLimitMiddleware.ts` - already documented

### Rate Limiting by User vs API Key
- **Status**: Implemented with API Key as proxy
- **Context**: Rate limiting by "user" implemented using API Key ID since no User model exists
- **Current approach**: Each API Key represents a "user" for rate limiting purposes
- **Future**: When User model is added, rate limiting should be updated to use actual user IDs

---
