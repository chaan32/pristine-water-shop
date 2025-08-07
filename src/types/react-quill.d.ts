declare module 'react-quill' {
  import { Component } from 'react';

  interface ReactQuillProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    readOnly?: boolean;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    theme?: string;
    modules?: any;
    formats?: string[];
    style?: React.CSSProperties;
    className?: string;
  }

  export default class ReactQuill extends Component<ReactQuillProps> {}
}