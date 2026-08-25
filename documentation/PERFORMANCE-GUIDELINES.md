# UTL.tools Performance & Speed Guidelines

## 1. Core Web Vitals Standards

UTL.tools targets perfect Core Web Vitals across all utility pages:

| Metric | Target | Method |
| :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | < 0.8s | Minimal initial JS, zero render-blocking styles, static pre-rendering |
| **FID / INP (Interaction to Next Paint)** | < 50ms | 100% synchronous/client-side event loops, zero main-thread blockage |
| **CLS (Cumulative Layout Shift)** | 0.00 | Strict layout bounding boxes, no asynchronous layout shifts or dynamic banner injections |

---

## 2. Dependency Management Rules

1. **Zero Unnecessary Frameworks**:
   - Prefer native Web APIs (`Intl.NumberFormat`, `Date`, `btoa/atob`, `crypto.getRandomValues`, `CanvasRenderingContext2D`, `URLSearchParams`) over heavy npm packages.
2. **Icons**:
   - Use tree-shaken `lucide-react` icons.
3. **No External Fonts with FOUT**:
   - Use system-ui font fallbacks (`Inter`, system sans-serif, monospace) with zero external font download penalties.
