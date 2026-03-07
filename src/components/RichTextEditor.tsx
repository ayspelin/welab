"use client";

import React from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import QuillWrapper with no SSR
const ReactQuill = dynamic(
    () => import("./QuillWrapper"),
    { ssr: false }
);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const quillRef = React.useRef<any>(null);

    const imageHandler = React.useCallback(() => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            if (input !== null && input.files !== null) {
                const file = input.files[0];
                const formData = new FormData();
                formData.append("file", file);

                try {
                    const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) throw new Error("Görsel yüklenemedi");

                    const data = await res.json();
                    const url = data.url;

                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, "image", url);
                } catch (error) {
                    console.error("Image upload failed:", error);
                    alert("Resim yüklenirken bir hata oluştu.");
                }
            }
        };
    }, []);

    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), [imageHandler]);

    return (
        <div className="rich-text-editor">
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
                .rich-text-editor .ql-container {
                    font-size: 1rem;
                    font-family: inherit;
                    min-height: 120px;
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                }
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    background-color: #f9fafb;
                }
            `}</style>
        </div>
    );
}
