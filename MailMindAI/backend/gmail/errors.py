"""Typed Gmail adapter errors (independent of googleapiclient)."""


class GmailError(Exception):
    """Base class for Gmail adapter failures."""


class GmailAuthError(GmailError):
    """Credentials missing, invalid, expired or with wrong scopes."""


class GmailRateLimitError(GmailError):
    """Quota / rate limit exceeded (retryable after backoff)."""


class GmailTransientError(GmailError):
    """Server-side or network failure (retryable)."""


class GmailNotFoundError(GmailError):
    """Message/thread no longer exists."""


class GmailHistoryExpiredError(GmailError):
    """startHistoryId is too old; a full sync is required."""
