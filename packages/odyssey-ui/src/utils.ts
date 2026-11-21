type StatefulClassName<State = never> = (state: State) => string | undefined;

export function cx(...values: Array<string | false | null | undefined>): string;
export function cx<State>(...values: Array<string | StatefulClassName<State> | false | null | undefined>): string | StatefulClassName<State>;
export function cx(...values: Array<string | StatefulClassName | false | null | undefined>): string | StatefulClassName {
  const resolve = (state?: unknown) =>
    values
      .map((value) => (typeof value === "function" ? (value as (input: unknown) => string | undefined)(state) : value))
      .filter(Boolean)
      .join(" ");
  return values.some((value) => typeof value === "function") ? (state: unknown) => resolve(state) : resolve();
}
