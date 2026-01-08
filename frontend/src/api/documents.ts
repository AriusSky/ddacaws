import { http } from './http';

export type UploadResult = { fileKey: string; downloadUrl: string };

export async function downloadDocument(fileKey: string): Promise<Blob> {
    // URL-encode the file key to handle slashes
    const encodedFileKey = encodeURIComponent(fileKey);

    const response = await http.get(`/files/download/${encodedFileKey}`, {
        // to expect binary data
        responseType: 'blob',
    });

    return response.data;
}

export async function deleteDocument(fileKey: string): Promise<void> {
    // The key must be URL-encoded
    await http.delete(`/files/${encodeURIComponent(fileKey)}`);
}

export async function uploadDocument(file: File): Promise<UploadResult> {
    const form = new FormData();
    form.append('file', file);
    const res = await http.post('/files/upload', form);
    return res.data;
}

export async function listDocuments() {
    const res = await http.get('/files')
    return res.data as UploadResult[]
}
