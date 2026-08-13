from dataclasses import dataclass
from pathlib import Path, PurePath
import re
from typing import BinaryIO

from google.api_core.exceptions import GoogleAPIError
from google.auth.exceptions import DefaultCredentialsError
from google.cloud import storage

from app.core.config import settings


class StorageError(RuntimeError):
    pass


class StorageConfigurationError(StorageError):
    pass


class StorageOperationError(StorageError):
    pass


@dataclass(frozen=True)
class StoredMedia:
    data: bytes
    content_type: str
    total_size: int
    start: int
    end: int


def build_video_object_name(video_id: str, filename: str) -> str:
    basename = PurePath(filename.replace("\\", "/")).name
    stem = re.sub(r"[^a-zA-Z0-9._-]+", "-", basename).strip("-.")
    safe_filename = stem or "video.mp4"
    if not safe_filename.lower().endswith(".mp4"):
        safe_filename = f"{safe_filename}.mp4"
    return f"videos/{video_id}/{safe_filename}"


class GCSStorageService:
    def __init__(
        self,
        *,
        bucket_name: str | None = settings.GCS_BUCKET,
        project: str = settings.GOOGLE_CLOUD_PROJECT,
        client=None,
    ):
        if not bucket_name:
            raise StorageConfigurationError("GCS_BUCKET is not configured")

        self.bucket_name = bucket_name
        self.project = project
        try:
            self.client = client or storage.Client(project=project)
            self.bucket = self.client.bucket(bucket_name)
        except DefaultCredentialsError as exc:
            raise StorageConfigurationError(
                "Google Application Default Credentials are not configured"
            ) from exc

    def upload_video(
        self,
        *,
        file_object: BinaryIO,
        object_name: str,
        content_type: str = "video/mp4",
    ) -> str:
        try:
            blob = self.bucket.blob(object_name)
            blob.upload_from_file(
                file_object,
                rewind=True,
                content_type=content_type,
                if_generation_match=0,
                checksum="auto",
            )
            return f"gs://{self.bucket_name}/{object_name}"
        except GoogleAPIError as exc:
            raise StorageOperationError(f"Cloud Storage upload failed: {exc}") from exc

    def upload_file(
        self, *, source: Path, object_name: str, content_type: str
    ) -> str:
        try:
            blob = self.bucket.blob(object_name)
            blob.upload_from_filename(
                str(source), content_type=content_type, checksum="auto"
            )
            return f"gs://{self.bucket_name}/{object_name}"
        except GoogleAPIError as exc:
            raise StorageOperationError(f"Cloud Storage upload failed: {exc}") from exc

    def download_to_file(self, *, storage_path: str, destination: Path) -> None:
        object_name = self._object_name(storage_path)
        try:
            blob = self.bucket.get_blob(object_name)
            if blob is None:
                raise StorageOperationError("Cloud Storage video object was not found")
            blob.download_to_filename(str(destination), checksum="auto")
        except StorageOperationError:
            raise
        except GoogleAPIError as exc:
            raise StorageOperationError(f"Cloud Storage download failed: {exc}") from exc

    def delete_object(self, storage_path: str) -> None:
        object_name = self._object_name(storage_path)
        try:
            self.bucket.blob(object_name).delete()
        except GoogleAPIError as exc:
            raise StorageOperationError(f"Cloud Storage cleanup failed: {exc}") from exc

    def download_range(
        self,
        *,
        storage_path: str,
        start: int = 0,
        end: int | None = None,
    ) -> StoredMedia:
        object_name = self._object_name(storage_path)
        try:
            blob = self.bucket.get_blob(object_name)
            if blob is None or blob.size is None:
                raise StorageOperationError("Cloud Storage video object was not found")

            total_size = int(blob.size)
            if total_size == 0 or start < 0 or start >= total_size:
                raise StorageOperationError("Requested video byte range is invalid")

            resolved_end = min(end if end is not None else total_size - 1, total_size - 1)
            if resolved_end < start:
                raise StorageOperationError("Requested video byte range is invalid")

            data = blob.download_as_bytes(start=start, end=resolved_end, checksum=None)
            return StoredMedia(
                data=data,
                content_type=blob.content_type or "video/mp4",
                total_size=total_size,
                start=start,
                end=resolved_end,
            )
        except StorageOperationError:
            raise
        except GoogleAPIError as exc:
            raise StorageOperationError(f"Cloud Storage playback failed: {exc}") from exc

    def _object_name(self, storage_path: str) -> str:
        prefix = f"gs://{self.bucket_name}/"
        if not storage_path.startswith(prefix):
            raise StorageOperationError("Video references an unexpected storage bucket")
        object_name = storage_path.removeprefix(prefix)
        if not object_name:
            raise StorageOperationError("Video storage object name is missing")
        return object_name
