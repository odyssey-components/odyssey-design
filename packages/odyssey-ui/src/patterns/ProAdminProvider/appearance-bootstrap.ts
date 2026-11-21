export interface AppearanceBootstrapOptions {
  storageKey: string;
  defaultColorScheme?: "system" | "light" | "dark";
  lightBackground: string;
  darkBackground: string;
}

// The script executes synchronously in the document head, before application modules.
export function createAppearanceBootstrapScript(options: AppearanceBootstrapOptions): string {
  const config = JSON.stringify(options)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `(()=>{const o=${config};let s=o.defaultColorScheme||"system";try{const v=JSON.parse(localStorage.getItem(o.storageKey)||"null")?.colorScheme;if(["light","dark","system"].includes(v))s=v}catch{};const dark=s==="dark"||(s==="system"&&typeof matchMedia==="function"&&matchMedia("(prefers-color-scheme: dark)").matches);const r=document.documentElement;r.dataset.odAppearanceScheme=dark?"dark":"light";r.style.colorScheme=dark?"dark":"light";r.style.backgroundColor=dark?o.darkBackground:o.lightBackground;const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=dark?o.darkBackground:o.lightBackground;r.dataset.odAppearancePending="true";setTimeout(()=>{delete r.dataset.odAppearancePending},5000)})();`;
}
