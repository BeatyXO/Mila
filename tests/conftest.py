import os
import platform


def pytest_configure():
    if platform.system() != "Windows":
        return
    original_unlink = os.unlink

    def unlink_with_windows_fd_tolerance(path, *args, **kwargs):
        try:
            return original_unlink(path, *args, **kwargs)
        except PermissionError:
            if str(path).lower().endswith((".tmp",)) or "tmp" in os.path.basename(str(path)).lower():
                return None
            raise

    os.unlink = unlink_with_windows_fd_tolerance
