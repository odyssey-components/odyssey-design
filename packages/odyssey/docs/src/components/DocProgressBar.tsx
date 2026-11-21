export function DocProgressBar({ active }: { active: boolean }) {
  return <div aria-hidden="true" className="od-Docs-progress" data-od-slot="docs-progress" data-active={active ? "" : undefined} />;
}
