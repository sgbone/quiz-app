import { MathJax } from "better-react-mathjax";
import DOMPurify from "dompurify";

export default function MathText({ html }: { html: unknown }) {
  const normalized = String(html ?? "")
    .replace(/<br\s*\/?>/gi, "<br/>")
    .replace(/\r?\n/g, "<br/>");

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
