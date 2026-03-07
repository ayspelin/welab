import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface QuillWrapperProps {
    forwardedRef: any;
    [key: string]: any;
}

export default function QuillWrapper({ forwardedRef, ...props }: QuillWrapperProps) {
    return <ReactQuill ref={forwardedRef} {...props} />;
}
