import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactQuill, { Quill } from "react-quill-new";
import QuillResizeImage from "quill-resize-image";
import "react-quill-new/dist/quill.snow.css";

// Register the resize module
Quill.register("modules/resize", QuillResizeImage);

// Register the audio format
const AudioBlot = Quill.import("blots/block/embed");

class Audio extends AudioBlot {
  static create(value) {
    const node = super.create();
    node.setAttribute("controls", "");
    node.setAttribute("src", value);
    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }
}

Audio.blotName = "audio";
Audio.tagName = "audio";
Audio.className = "ql-audio";

Quill.register(Audio);

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = { editorHtml: props.value || "" };
    this.reactQuillRef = React.createRef();
  }

  handleChange = (html) => {
    this.setState({ editorHtml: html });
    this.props.onChange(html);
  };

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ editorHtml: this.props.value });
    }
  }

  handleImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch(`/api/cms/news/upload/image`, {
            method: "POST",
            body: formData,
          });
          const data = await response.json();

          const editor = this.reactQuillRef.current?.getEditor();
          if (editor) {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, "image", data.url);
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Gagal mengunggah gambar. Coba lagi.");
        }
      }
    };
  };

  handleAudioUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "audio/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch(`/api/cms/news/upload/audio`, {
            method: "POST",
            body: formData,
          });
          const data = await response.json();

          const editor = this.reactQuillRef.current?.getEditor();
          if (editor) {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, "audio", data.url);
          }
        } catch (error) {
          console.error("Error uploading audio:", error);
          alert("Gagal mengunggah audio. Coba lagi.");
        }
      }
    };
  };

  render() {
    const { placeholder, height, classname } = this.props;

    return (
      <div className="d-flex mb-2" style={{ height: height }}>
        <ReactQuill
          ref={this.reactQuillRef}
          theme="snow"
          value={this.state.editorHtml}
          onChange={this.handleChange}
          modules={Editor.modules(
            this.handleImageUpload,
            this.handleAudioUpload
          )}
          formats={Editor.formats}
          placeholder={placeholder}
          style={{ width: "100%" }}
          className={`react-quill border border-2 bg-white rounded ${classname}`}
        />
      </div>
    );
  }
}

Editor.modules = (handleImageUpload, handleAudioUpload) => {
  return {
    toolbar: {
      container: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image", "audio", "video"],
        ["clean"],
      ],
      handlers: {
        image: handleImageUpload,
        audio: handleAudioUpload,
      },
    },
    clipboard: {
      matchVisual: false,
    },
    resize: {
      modules: ["Resize"],
    },
  };
};

Editor.formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "image",
  "audio",
  "video",
];

Editor.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default Editor;
