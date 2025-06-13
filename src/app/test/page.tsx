"use client";

import { useState } from "react";

import { useUploadThing } from "@/lib/uploadthing/client";

export default function Home() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const { startUpload } = useUploadThing("attachment", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        setUploadedUrl(res[0].url);
      }
    }
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      setUploadProgress(0);
      setUploadedUrl(null);
      await startUpload(files);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4">
          <label className="cursor-pointer rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600">
            <span>Upload Image</span>
            <input type="file" accept="image/*" className="hidden" multiple onChange={handleFileSelect} />
          </label>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full">
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-gray-600">Uploading: {uploadProgress}%</p>
            </div>
          )}

          {uploadedUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">Uploaded Image:</p>
              <img src={uploadedUrl} alt="Uploaded" className="mt-2 h-auto max-w-full rounded-lg" />
              <p className="mt-2 break-all text-sm text-gray-600">URL: {uploadedUrl}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
