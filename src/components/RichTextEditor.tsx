"use client";

import React from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { getYouTubeEmbedUrl } from "@/lib/mediaLinks";

// Dynamically import QuillWrapper with no SSR
const ReactQuill = dynamic(
    () => import("./QuillWrapper"),
    { ssr: false }
);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

interface QuillRange {
    index: number;
    length: number;
}

interface QuillEditor {
    clipboard: {
        dangerouslyPasteHTML: (index: number, html: string, source?: string) => void;
    };
    getSelection: (focus?: boolean) => QuillRange | null;
    insertEmbed: (index: number, type: string, value: string, source?: string) => void;
    setSelection: (index: number, length?: number, source?: string) => void;
}

interface QuillRef {
    getEditor: () => QuillEditor;
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getFileLabel(file: File) {
    const extension = file.name.split(".").pop()?.toUpperCase();
    if (extension) return extension;
    if (file.type.includes("pdf")) return "PDF";
    if (file.type.includes("word")) return "DOC";
    if (file.type.includes("excel") || file.type.includes("spreadsheet")) return "XLS";
    return "DOSYA";
}

function formatFileSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = "260px" }: RichTextEditorProps) {
    const quillRef = React.useRef<QuillRef | null>(null);

    const uploadFile = React.useCallback(async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Dosya yüklenemedi");

        const data = await res.json() as { url?: string };
        if (!data.url) throw new Error("Dosya adresi alınamadı");

        return data.url;
    }, []);

    const imageHandler = React.useCallback(() => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            if (input !== null && input.files !== null) {
                const file = input.files[0];

                try {
                    const url = await uploadFile(file);
                    const quill = quillRef.current?.getEditor();
                    const range = quill?.getSelection(true);
                    if (!quill || !range) return;

                    quill.insertEmbed(range.index, "image", url, "user");
                    quill.setSelection(range.index + 1, 0, "silent");
                } catch (error) {
                    console.error("Image upload failed:", error);
                    alert("Resim yüklenirken bir hata oluştu.");
                }
            }
        };
    }, [uploadFile]);

    const videoHandler = React.useCallback(() => {
        const value = window.prompt("YouTube veya video linki");
        if (!value) return;

        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection(true);
        if (!quill || !range) return;

        quill.insertEmbed(range.index, "video", getYouTubeEmbedUrl(value) || value, "user");
        quill.setSelection(range.index + 1, 0, "silent");
    }, []);

    const fileHandler = React.useCallback(() => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute(
            "accept",
            ".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                const url = await uploadFile(file);
                const quill = quillRef.current?.getEditor();
                const range = quill?.getSelection(true);
                if (!quill || !range) return;

                const label = escapeHtml(getFileLabel(file));
                const fileName = escapeHtml(file.name);
                const fileSize = escapeHtml(formatFileSize(file.size));
                const fileUrl = escapeHtml(url);
                const html = `
                    <p>
                        <a class="blog-file-card" href="${fileUrl}" target="_blank" rel="noopener noreferrer">
                            <span class="blog-file-type">${label}</span>
                            <span class="blog-file-info">
                                <strong>${fileName}</strong>
                                <small>${fileSize}</small>
                            </span>
                        </a>
                    </p>
                    <p><br></p>
                `;

                quill.clipboard.dangerouslyPasteHTML(range.index, html, "user");
                quill.setSelection(range.index + 1, 0, "silent");
            } catch (error) {
                console.error("File upload failed:", error);
                alert("Dosya yüklenirken bir hata oluştu.");
            }
        };
    }, [uploadFile]);

    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image', 'video', 'file'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
                video: videoHandler,
                file: fileHandler
            }
        },
        clipboard: {
            matchVisual: false
        }
    }), [fileHandler, imageHandler, videoHandler]);

    const editorStyle: React.CSSProperties & { "--rte-min-height": string } = {
        "--rte-min-height": minHeight,
    };

    return (
        <div className="rich-text-editor" style={editorStyle}>
            <ReactQuill
                forwardedRef={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
                style={{ backgroundColor: "white" }}
            />
            <style jsx global>{`
                .rich-text-editor {
                    color: #111827;
                }
                .rich-text-editor .ql-container {
                    font-size: 1rem;
                    font-family: inherit;
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                }
                .rich-text-editor .ql-editor {
                    min-height: var(--rte-min-height);
                }
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    background-color: #f9fafb;
                }
                .rich-text-editor .ql-file {
                    width: auto;
                    padding: 0 8px;
                }
                .rich-text-editor .ql-file::before {
                    content: "Dosya";
                    font-size: 12px;
                    font-weight: 700;
                }
                .rich-text-editor .ql-video {
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    height: auto;
                    border-radius: 8px;
                }
                .rich-text-editor .blog-file-card {
                    align-items: center;
                    border: 1px solid #dbeafe;
                    border-radius: 8px;
                    color: #0f172a;
                    display: flex;
                    gap: 12px;
                    margin: 16px 0;
                    padding: 12px;
                    text-decoration: none;
                }
                .rich-text-editor .blog-file-type {
                    background: #1378f4;
                    border-radius: 6px;
                    color: #ffffff;
                    flex: 0 0 auto;
                    font-size: 12px;
                    font-weight: 800;
                    min-width: 48px;
                    padding: 7px 8px;
                    text-align: center;
                }
                .rich-text-editor .blog-file-info {
                    display: flex;
                    flex-direction: column;
                    line-height: 1.4;
                }
                .rich-text-editor .blog-file-info small {
                    color: #64748b;
                    font-size: 12px;
                }
            `}</style>
        </div>
    );
}
