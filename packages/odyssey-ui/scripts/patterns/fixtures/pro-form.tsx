import { ProForm } from "@odyssey/ui/patterns/form";
import * as z from "zod/v4";

const schema = z.object({ name: z.string() });

export const fixture = <ProForm schema={schema} defaultValues={{ name: "" }} fields={[{ name: "name", label: "Name", type: "text" }]} onSubmit={() => undefined} />;
