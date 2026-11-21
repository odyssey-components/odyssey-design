import { odysseyWebTokenMetadata } from "@odyssey/ui/token-contract";

const tokens = odysseyWebTokenMetadata;

type TokenGroup = (typeof tokens)[number]["group"];

export function TokenTable({ group = "color" }: { group?: TokenGroup }) {
  const entries = tokens.filter((token) => token.group === group);
  const root = typeof document === "undefined" ? null : document.querySelector<HTMLElement>("[data-od-root]");
  return (
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th>用途</th>
          <th>当前值</th>
          <th>预览</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((token) => (
          <tr key={token.name}>
            <td>
              <code>{token.name}</code>
            </td>
            <td>{token.role}</td>
            <td>
              <code>{root ? getComputedStyle(root).getPropertyValue(token.name) : "—"}</code>
            </td>
            <td>
              <span
                style={{
                  background: group === "color" ? `var(${token.name})` : undefined,
                  border: "1px solid var(--od-border)",
                  borderRadius: group === "radius" ? `var(${token.name})` : undefined,
                  display: "inline-block",
                  height: group === "space" || group === "density" ? `var(${token.name})` : "1.5rem",
                  width: "3rem",
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
