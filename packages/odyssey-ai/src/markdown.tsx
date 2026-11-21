import { IconButton } from "@odyssey/ui/icon-button";
import { Tooltip, TooltipContent, TooltipPortal, TooltipPositioner, TooltipProvider, TooltipTrigger } from "@odyssey/ui/tooltip";
import { createHighlighterCore, type LanguageInput, type ThemedTokenWithVariants } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import githubDark from "@shikijs/themes/github-dark";
import githubLight from "@shikijs/themes/github-light";
import { Check, ChevronsDown, ChevronsUp, Copy, X } from "lucide-react";
import {
  Children,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  isValidElement,
  memo,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import styled from "styled-components";
import { useOdysseyAILocale } from "./locale";
import type { MessagePart } from "./types";

const MarkdownContent = styled.div`
  min-width: 0;
  font-size: var(--od-font-size-md);
  line-height: var(--od-line-height-normal);

  & > :first-child { margin-block-start: 0; }
  & > :last-child { margin-block-end: 0; }
  & :where(p, ul, ol, blockquote, table) { margin-block: var(--od-space-3); }
  & :where(h1, h2, h3, h4, h5, h6) {
    margin-block: var(--od-space-5) var(--od-space-2);
    color: inherit;
    font-weight: var(--od-font-weight-semibold);
    line-height: var(--od-line-height-tight);
  }
  & h1 { font-size: var(--od-font-size-xl); }
  & h2 { font-size: var(--od-font-size-lg); }
  & :where(h3, h4, h5, h6) { font-size: var(--od-font-size-md); }
  & :where(ul, ol) { padding-inline-start: var(--od-space-6); }
  & li + li { margin-block-start: var(--od-space-1); }
  & li > p { margin-block: var(--od-space-1); }
  & blockquote {
    margin-inline: 0;
    padding-inline-start: var(--od-space-3);
    border-inline-start: var(--od-line-width) solid var(--od-border);
    color: var(--od-muted-foreground);
  }
  & a { color: var(--od-primary); overflow-wrap: anywhere; text-underline-offset: 0.2em; }
  & :not(pre) > code {
    padding: 0.1em 0.3em;
    border-radius: var(--od-radius-sm);
    background: var(--od-muted);
    font-family: var(--od-font-mono);
    font-size: var(--od-font-size-sm);
  }
  & table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; font-size: var(--od-font-size-sm); }
  & :where(th, td) { padding: var(--od-space-2) var(--od-space-3); border: var(--od-line-width) solid var(--od-border); text-align: start; }
  & th { background: var(--od-muted); font-weight: var(--od-font-weight-semibold); }
  & input[type="checkbox"] { margin-inline-end: var(--od-space-2); accent-color: var(--od-primary); }
  & hr { margin-block: var(--od-space-5); border: 0; border-top: var(--od-line-width) solid var(--od-border); }
`;

const CodeBlockRoot = styled.figure`
  --_od-code-collapse-height: 24rem;
  position: relative;
  max-width: 100%;
  margin: var(--od-space-3) 0;
  border: var(--od-line-width) solid var(--od-border);
  border-radius: var(--od-radius-md);
  background: var(--od-muted);

  @media (max-width: 760px) {
    --_od-code-collapse-height: 18rem;
  }
`;
const CodeBlockHeader = styled.figcaption`
  display: flex;
  min-height: var(--od-control-height-sm);
  align-items: center;
  justify-content: space-between;
  gap: var(--od-space-2);
  padding-inline: var(--od-space-3) var(--od-space-1);
  border-bottom: var(--od-line-width) solid var(--od-border);
  color: var(--od-muted-foreground);
  font-size: var(--od-font-size-xs);
  font-weight: var(--od-font-weight-medium);
  text-transform: lowercase;
  border-radius: calc(var(--od-radius-md) - var(--od-line-width)) calc(var(--od-radius-md) - var(--od-line-width)) 0 0;
`;
const CodeBlockBody = styled.div`
  position: relative;
  min-width: 0;

  &[data-collapsed="true"] {
    max-height: var(--_od-code-collapse-height);
    overflow: hidden;
  }

  &[data-collapsed="true"]::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: calc(var(--od-control-height-sm) + var(--od-space-6));
    background: linear-gradient(to bottom, transparent, var(--od-muted));
    content: "";
    pointer-events: none;
  }
`;
const CollapseThreshold = styled.span`
  position: absolute;
  width: 0;
  height: var(--_od-code-collapse-height);
  overflow: hidden;
  pointer-events: none;
  visibility: hidden;
`;
const CodeBlockAffix = styled.div`
  position: sticky;
  z-index: 1;
  top: calc(100% - var(--od-control-height-sm) - var(--od-space-2));
  display: flex;
  height: 0;
  justify-content: flex-end;
  padding-inline-end: var(--od-space-2);
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;
const CodeBlockPre = styled.pre`
  max-width: 100%;
  margin: 0;
  overflow: auto;
  padding: var(--od-space-3);

  & > code {
    font-family: var(--od-font-mono);
    font-size: var(--od-font-size-sm);
  }

  &[data-highlighted="true"] {
    background: var(--shiki-light-bg);
    color: var(--shiki-light);
  }

  & .shiki-line {
    display: block;
    min-height: 1lh;
  }

  & .shiki-token {
    color: var(--shiki-light);
    background: var(--shiki-light-bg, transparent);
  }

  [data-od-resolved-color-scheme="dark"] & {
    &[data-highlighted="true"] {
      background: var(--shiki-dark-bg);
      color: var(--shiki-dark);
    }

    & .shiki-token {
      color: var(--shiki-dark);
      background: var(--shiki-dark-bg, transparent);
    }
  }
`;
const CodeBlockPreview = styled.div`
  min-width: 0;
  padding: var(--od-space-3);
  background: var(--od-background);
`;

const languageAliases: Record<string, string> = {
  bash: "bash",
  css: "css",
  go: "go",
  golang: "go",
  html: "markup",
  java: "java",
  javascript: "javascript",
  js: "javascript",
  json: "json",
  jsx: "jsx",
  markup: "markup",
  py: "python",
  python: "python",
  sh: "bash",
  shell: "bash",
  sql: "sql",
  ts: "typescript",
  tsx: "tsx",
  typescript: "typescript",
  yaml: "yaml",
  yml: "yaml",
};
type LanguageModule = { default: LanguageInput };
const languageLoaders: Record<string, () => Promise<LanguageModule>> = {
  bash: () => import("@shikijs/langs/bash"),
  css: () => import("@shikijs/langs/css"),
  go: () => import("@shikijs/langs/go"),
  java: () => import("@shikijs/langs/java"),
  javascript: () => import("@shikijs/langs/javascript"),
  json: () => import("@shikijs/langs/json"),
  jsx: () => import("@shikijs/langs/jsx"),
  markup: () => import("@shikijs/langs/html"),
  python: () => import("@shikijs/langs/python"),
  sql: () => import("@shikijs/langs/sql"),
  tsx: () => import("@shikijs/langs/tsx"),
  typescript: () => import("@shikijs/langs/typescript"),
  yaml: () => import("@shikijs/langs/yaml"),
};
const loadedLanguages = new Set<string>();
const languagePromises = new Map<string, Promise<boolean>>();
const highlightPromises = new Map<string, Promise<ThemedTokenWithVariants[][] | undefined>>();
const highlighterPromise = createHighlighterCore({
  themes: [githubLight, githubDark],
  langs: [],
  engine: createJavaScriptRegexEngine(),
});

function normalizeLanguage(value: string) {
  return languageAliases[value.toLowerCase()];
}

function loadLanguage(language: string): Promise<boolean> {
  if (loadedLanguages.has(language)) return Promise.resolve(true);
  const existing = languagePromises.get(language);
  if (existing) return existing;
  const loader = languageLoaders[language];
  if (!loader) return Promise.resolve(false);
  const promise = Promise.all([highlighterPromise, loader()])
    .then(([highlighter, module]) => {
      return highlighter.loadLanguage(module.default).then(() => {
        loadedLanguages.add(language);
        return true;
      });
    })
    .catch(() => false);
  languagePromises.set(language, promise);
  return promise;
}

function highlightCode(code: string, language: string) {
  const key = `${language}\0${code}`;
  const existing = highlightPromises.get(key);
  if (existing) return existing;
  const promise = loadLanguage(language).then(async (loaded) => {
    if (!loaded) return undefined;
    const highlighter = await highlighterPromise;
    return highlighter.codeToTokensWithThemes(code, {
      lang: language,
      themes: { light: "github-light", dark: "github-dark" },
    });
  });
  highlightPromises.set(key, promise);
  return promise;
}

function tokenStyle(token: ThemedTokenWithVariants): CSSProperties {
  const light = token.variants.light ?? {};
  const dark = token.variants.dark ?? {};
  const fontStyle = light.fontStyle ?? 0;
  return {
    "--shiki-light": light.color ?? githubLight.fg,
    "--shiki-dark": dark.color ?? githubDark.fg,
    "--shiki-light-bg": light.bgColor,
    "--shiki-dark-bg": dark.bgColor,
    fontStyle: fontStyle & 1 ? "italic" : undefined,
    fontWeight: fontStyle & 2 ? "bold" : undefined,
    textDecoration: fontStyle & 4 ? "underline" : undefined,
  } as CSSProperties;
}

function keyedLines(lines: ThemedTokenWithVariants[][]) {
  let offset = 0;
  return lines.map((tokens) => {
    const line = { key: `line-${offset}`, tokens };
    offset += tokens.reduce((length, token) => length + token.content.length, 0) + 1;
    return line;
  });
}

const HighlightedCode = memo(function HighlightedCode({ code, language, enabled }: { code: string; language: string; enabled: boolean }) {
  const normalized = normalizeLanguage(language);
  const [tokens, setTokens] = useState<ThemedTokenWithVariants[][]>();
  useEffect(() => {
    let active = true;
    if (!normalized || !enabled) {
      setTokens(undefined);
      return;
    }
    void highlightCode(code, normalized).then((value) => {
      if (active) setTokens(value);
    });
    return () => {
      active = false;
    };
  }, [code, enabled, normalized]);
  if (!tokens) {
    return (
      <CodeBlockPre>
        <code>{code}</code>
      </CodeBlockPre>
    );
  }
  return (
    <CodeBlockPre
      data-highlighted="true"
      style={
        {
          "--shiki-light": githubLight.fg,
          "--shiki-dark": githubDark.fg,
          "--shiki-light-bg": githubLight.bg,
          "--shiki-dark-bg": githubDark.bg,
        } as CSSProperties
      }
    >
      <code>
        {keyedLines(tokens).map((line) => (
          <span className="shiki-line" key={line.key}>
            {line.tokens.map((token) => (
              <span className="shiki-token" key={token.offset} style={tokenStyle(token)}>
                {token.content}
              </span>
            ))}
          </span>
        ))}
      </code>
    </CodeBlockPre>
  );
});

function MarkdownCodeBlock({ children, streaming, ...props }: ComponentPropsWithoutRef<"pre"> & { streaming: boolean }) {
  const locale = useOdysseyAILocale();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [expanded, setExpanded] = useState(true);
  const [long, setLong] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);
  const bodyRef = useRef<HTMLDivElement>(null);
  const thresholdRef = useRef<HTMLSpanElement>(null);
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);
  const child = Children.only(children);
  const validChild = isValidElement<{ className?: string; children?: ReactNode }>(child) ? child : undefined;
  const language = validChild?.props.className?.match(/(?:^|\s)language-([\w-]+)/)?.[1] ?? locale.markdown.plainText;
  const code = Children.toArray(validChild?.props.children).join("").replace(/\n$/, "");
  const isMarkdown = language === "markdown" || language === "md";
  useLayoutEffect(() => {
    const body = bodyRef.current;
    const threshold = thresholdRef.current;
    if (streaming || isMarkdown || !body || !threshold) {
      setLong(false);
      setExpanded(true);
      return;
    }
    const measure = () => setLong(body.scrollHeight > threshold.offsetHeight + 1);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    observer.observe(threshold);
    return () => observer.disconnect();
  }, [isMarkdown, streaming]);
  if (!validChild) return <CodeBlockPre {...props}>{children}</CodeBlockPre>;
  const label = copyState === "copied" ? locale.markdown.codeCopied : copyState === "failed" ? locale.markdown.copyFailed : locale.markdown.copyCode;
  return (
    <CodeBlockRoot data-od-slot="ai-code-block">
      <CodeBlockHeader data-od-slot="ai-code-block-header">
        <span>{language}</span>
        <IconButton
          type="button"
          size="sm"
          shape="circular"
          variant="ghost"
          aria-label={label}
          title={label}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopyState("copied");
            } catch {
              setCopyState("failed");
            }
            window.clearTimeout(resetTimer.current);
            resetTimer.current = window.setTimeout(() => setCopyState("idle"), 1500);
          }}
        >
          {copyState === "copied" ? <Check size={15} /> : copyState === "failed" ? <X size={15} /> : <Copy size={15} />}
        </IconButton>
      </CodeBlockHeader>
      <CollapseThreshold ref={thresholdRef} aria-hidden="true" />
      <CodeBlockBody ref={bodyRef} data-od-slot="ai-code-block-body" data-collapsed={long && !expanded} data-long={long || undefined}>
        {long ? (
          <CodeBlockAffix data-od-slot="ai-code-block-affix">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <IconButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      shape="circular"
                      aria-label={expanded ? locale.markdown.collapseCode : locale.markdown.expandCode}
                      aria-expanded={expanded}
                      onClick={() => setExpanded((value) => !value)}
                    >
                      {expanded ? <ChevronsUp size={15} /> : <ChevronsDown size={15} />}
                    </IconButton>
                  }
                />
                <TooltipPortal>
                  <TooltipPositioner side="top">
                    <TooltipContent>{expanded ? locale.markdown.collapseCode : locale.markdown.expandCode}</TooltipContent>
                  </TooltipPositioner>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </CodeBlockAffix>
        ) : null}
        {isMarkdown ? (
          <CodeBlockPreview data-od-slot="ai-code-block-preview">
            <ReactMarkdown components={createDefaultComponents(streaming)} remarkPlugins={[remarkGfm]} skipHtml>
              {code}
            </ReactMarkdown>
          </CodeBlockPreview>
        ) : (
          <HighlightedCode code={code} language={language} enabled={!streaming} />
        )}
      </CodeBlockBody>
    </CodeBlockRoot>
  );
}

function createDefaultComponents(streaming: boolean): Components {
  return {
    pre: ({ node: _node, ...props }) => <MarkdownCodeBlock {...props} streaming={streaming} />,
  };
}

export function MarkdownRenderer({ value, components, streaming = false }: { value: string; components?: Components; streaming?: boolean }) {
  return (
    <MarkdownContent data-od-slot="ai-markdown-content">
      <ReactMarkdown components={{ ...createDefaultComponents(streaming), ...components }} remarkPlugins={[remarkGfm]} skipHtml>
        {value}
      </ReactMarkdown>
    </MarkdownContent>
  );
}

export function MarkdownTextPart({ part, message }: { part: MessagePart; message?: import("./types").AIMessage }) {
  const streaming = message?.status === "pending" || message?.status === "streaming";
  return part.type === "text" && part.text ? <MarkdownRenderer value={part.text} streaming={streaming} /> : null;
}
