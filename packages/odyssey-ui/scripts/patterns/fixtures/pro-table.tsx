import { ProTable } from "@odyssey/ui/patterns/table";

export const fixture = <ProTable columns={[{ accessorKey: "name", header: "Name" }]} dataSource={[{ id: "1", name: "Ada" }]} rowKey="id" />;
