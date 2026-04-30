class AppException(Exception):
    def __init__(self, message: str, code: str, status_code: int = 400) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class NotFoundException(AppException):
    def __init__(self, resource: str, identifier: str | int) -> None:
        super().__init__(f"{resource} '{identifier}' not found", "NOT_FOUND", 404)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Not authenticated") -> None:
        super().__init__(message, "UNAUTHORIZED", 401)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Access denied") -> None:
        super().__init__(message, "FORBIDDEN", 403)


class ConflictException(AppException):
    def __init__(self, message: str) -> None:
        super().__init__(message, "CONFLICT", 409)


class QuotaExceededException(AppException):
    def __init__(self) -> None:
        super().__init__("YouTube API daily quota exceeded", "QUOTA_EXCEEDED", 429)


class ExternalServiceException(AppException):
    def __init__(self, service: str, detail: str) -> None:
        super().__init__(f"{service} error: {detail}", "EXTERNAL_ERROR", 502)
