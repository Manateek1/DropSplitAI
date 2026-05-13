import { NextResponse } from "next/server";

import { summarizeUploadedImage } from "@/lib/ai/coach";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { logServerError } from "@/lib/observability";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UploadedFileRecord } from "@/types/domain";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Upload a PNG, JPG, or WebP image." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Uploads must be 5MB or smaller." }, { status: 400 });
    }

    const record: UploadedFileRecord = {
      id: crypto.randomUUID(),
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      kind: /result|meet/i.test(file.name) ? "meet-results" : /split/i.test(file.name) ? "splits" : /heat/i.test(file.name) ? "heat-sheet" : "practice-board",
      createdAt: new Date().toISOString(),
      publicUrl: null,
      storagePath: null,
    };

    if (isSupabaseConfigured) {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("swim-uploads").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (error) {
        throw error;
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from("swim-uploads")
        .createSignedUrl(path, 60 * 60);

      if (signedError) {
        throw signedError;
      }

      record.storagePath = path;
      record.signedUrl = signedData.signedUrl;
      record.publicUrl = null;
      record.summary = await summarizeUploadedImage({
        fileName: record.fileName,
        publicUrl: record.signedUrl,
        mimeType: record.mimeType,
      });

      const { error: insertError } = await supabase.from("uploaded_files").insert({
        id: record.id,
        user_id: user.id,
        file_name: record.fileName,
        storage_path: record.storagePath,
        public_url: null,
        mime_type: record.mimeType,
        size_bytes: record.sizeBytes,
        kind: record.kind,
        summary: record.summary,
      });

      if (insertError) {
        throw insertError;
      }
    } else if (isDemoMode) {
      record.summary = `Uploaded ${record.fileName}. Ask the coach to log the likely results or explain the set.`;
    } else {
      return NextResponse.json({ error: "Supabase must be configured before uploads are enabled." }, { status: 503 });
    }

    return NextResponse.json({ file: record });
  } catch (error) {
    logServerError("api.files.upload", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
