import { ProPagination } from "@odyssey/ui/patterns/pagination";

export function Fixture() {
  return <ProPagination page={2} pageSize={10} total={120} showPageSize showQuickJumper />;
}
