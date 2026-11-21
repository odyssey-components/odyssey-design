import api from "../generated/api.json";
import styles from "./ApiTable.module.css";

interface Reflection {
  name?: string;
  children?: Reflection[];
  comment?: {
    summary?: Array<{ text?: string }>;
    blockTags?: Array<{ tag?: string; content?: Array<{ text?: string }> }>;
  };
  flags?: { isOptional?: boolean };
  type?: unknown;
  defaultValue?: string;
}
function find(node: Reflection, name: string): Reflection | undefined {
  if (node.name === name) return node;
  for (const child of node.children ?? []) {
    const result = find(child, name);
    if (result) return result;
  }
  return undefined;
}
function printType(type: unknown): string {
  if (!type || typeof type !== "object") return "unknown";
  const value = type as {
    type?: string;
    name?: string;
    types?: unknown[];
    elementType?: unknown;
    value?: unknown;
    typeArguments?: unknown[];
  };
  if (value.type === "intrinsic" || value.type === "reference")
    return `${value.name ?? "unknown"}${value.typeArguments?.length ? `<${value.typeArguments.map(printType).join(", ")}>` : ""}`;
  if (value.type === "literal") return JSON.stringify(value.value);
  if (value.type === "union") return value.types?.map(printType).join(" | ") ?? "unknown";
  if (value.type === "array") return `${printType(value.elementType)}[]`;
  return value.name ?? value.type ?? "unknown";
}
function text(parts?: Array<{ text?: string }>) {
  return parts?.map((part) => part.text ?? "").join("") ?? "";
}
export function ApiTable({ name }: { name: string }) {
  const reflection = find(api as Reflection, name);
  if (!reflection) return <p>没有找到 `{name}` 的公开类型数据。</p>;
  if (!reflection.children?.length)
    return (
      <p>
        <code>{name}</code>：<code>{printType(reflection.type)}</code>
      </p>
    );
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>属性</th>
            <th>类型</th>
            <th>默认值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          {reflection.children?.map((prop) => {
            const defaultTag = prop.comment?.blockTags?.find((tag) => tag.tag === "@defaultValue" || tag.tag === "@default");
            return (
              <tr key={prop.name}>
                <td>
                  <code>
                    {prop.name}
                    {prop.flags?.isOptional ? "?" : ""}
                  </code>
                </td>
                <td>
                  <code>{printType(prop.type)}</code>
                </td>
                <td>{prop.defaultValue ?? (text(defaultTag?.content) || "—")}</td>
                <td>{text(prop.comment?.summary) || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
