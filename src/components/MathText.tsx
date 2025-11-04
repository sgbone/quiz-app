import { MathJax } from "better-react-mathjax";
import DOMPurify from "dompurify";

export default function MathText({ html }: { html: string }) {
  // Chuẩn hóa <br> và xuống dòng
  const normalized = (html ?? "")
    .replace(/<br\s*\/?>/gi, "<br/>")
    .replace(/\r?\n/g, "<br/>");

  // Khử XSS nhưng vẫn cho MathJax xử lý
  const safe = DOMPurify.sanitize(normalized, {
    ADD_ATTR: ["class"],
    ADD_TAGS: ["br"],
  });

  return (
    <MathJax dynamic>
      <div
        className="mathjax-process"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    </MathJax>
  );
}
