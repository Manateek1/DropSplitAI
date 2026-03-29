import { NextResponse } from "next/server";

import { summarizeUploadedImage } from "@/lib/ai/coach";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UploadedFileRecord } from "@/types/domain";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
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

      if (user) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("swim-uploads").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (!error) {
          const { data } = supabase.storage.from("swim-uploads").getPublicUrl(path);
          record.storagePath = path;
          record.publicUrl = data.publicUrl;
        }

        record.summary = await summarizeUploadedImage({
          fileName: record.fileName,
          publicUrl: record.publicUrl,
          mimeType: record.mimeType,
        });

        await supabase.from("uploaded_files").insert({
          id: record.id,
          user_id: user.id,
          file_name: record.fileName,
          storage_path: record.storagePath,
          public_url: record.publicUrl,
          mime_type: record.mimeType,
          size_bytes: record.sizeBytes,
          kind: record.kind,
          summary: record.summary,
        });
      } else {
        record.summary = await summarizeUploadedImage({ fileName: record.fileName, publicUrl: null, mimeType: record.mimeType });
      }
    } else {
      record.summary = `Uploaded ${record.fileName}. It looks like a swim-related screenshot that the coach can help summarize or log.`;
    }

    return NextResponse.json({ file: record });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
