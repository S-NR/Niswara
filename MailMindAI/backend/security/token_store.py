"""OAuth token protection.

On Windows the token JSON is encrypted with DPAPI (CryptProtectData, user
scope) so that only the same Windows user on the same machine can decrypt it.
On other platforms we fall back to a 0600 file and log a warning.
"""
from __future__ import annotations

import ctypes
import logging
import os
import sys
from pathlib import Path

log = logging.getLogger(__name__)
_ENTROPY = b"MailMindAI-gmail-token-v1"
_MAGIC = b"MMDPAPI1"


class _Blob(ctypes.Structure):
    _fields_ = [("cbData", ctypes.c_uint32), ("pbData", ctypes.POINTER(ctypes.c_char))]


def _to_blob(data: bytes) -> tuple[_Blob, ctypes.Array]:
    buf = ctypes.create_string_buffer(data, len(data))
    return _Blob(len(data), ctypes.cast(buf, ctypes.POINTER(ctypes.c_char))), buf


def _dpapi(data: bytes, protect: bool) -> bytes:
    crypt32 = ctypes.windll.crypt32  # type: ignore[attr-defined]
    kernel32 = ctypes.windll.kernel32  # type: ignore[attr-defined]
    blob_in, _keep1 = _to_blob(data)
    ent, _keep2 = _to_blob(_ENTROPY)
    blob_out = _Blob()
    fn = crypt32.CryptProtectData if protect else crypt32.CryptUnprotectData
    ok = fn(ctypes.byref(blob_in), None, ctypes.byref(ent), None, None, 0x01, ctypes.byref(blob_out))  # UI_FORBIDDEN
    if not ok:
        raise OSError(f"DPAPI {'protect' if protect else 'unprotect'} failed: {ctypes.GetLastError()}")
    try:
        return ctypes.string_at(blob_out.pbData, blob_out.cbData)
    finally:
        kernel32.LocalFree(blob_out.pbData)


def save_token(path: Path, token_json: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = token_json.encode("utf-8")
    if sys.platform == "win32":
        payload = _MAGIC + _dpapi(raw, protect=True)
    else:  # pragma: no cover - non-Windows fallback
        log.warning("DPAPI unavailable: storing token with 0600 permissions only")
        payload = raw
    tmp = path.with_suffix(".tmp")
    tmp.write_bytes(payload)
    os.replace(tmp, path)
    if sys.platform != "win32":  # pragma: no cover
        os.chmod(path, 0o600)


def load_token(path: Path) -> str | None:
    if not path.exists():
        return None
    data = path.read_bytes()
    if data.startswith(_MAGIC):
        return _dpapi(data[len(_MAGIC):], protect=False).decode("utf-8")
    if sys.platform == "win32":
        raise ValueError("Token file is not DPAPI-protected; delete it and sign in again")
    return data.decode("utf-8")  # pragma: no cover


def delete_token(path: Path) -> bool:
    if path.exists():
        path.unlink()
        return True
    return False
