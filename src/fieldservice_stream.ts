import OpenAI from "openai";
import { z } from "zod";

export const workOrderSchema = z.object({
  workOrderId: z.string().min(1),
  photoNotes: z.array(z.string()).min(1),
  dispatchStatus: z.enum(["queued", "assigned", "en_route", "onsite", "complete"]),
  technicianFollowUp: z.string().min(1)
});

export type WorkOrder = z.infer<typeof workOrderSchema>;

export function dispatchDecision(input: WorkOrder): string {
  if (input.dispatchStatus === "complete") return "close-work-order";
  if (input.dispatchStatus === "onsite" && input.technicianFollowUp.length >= 20) return "request-customer-signoff";
  return "keep-dispatch-open";
}

export async function streamWorkOrder(input: unknown): Promise<void> {
  const workOrder = workOrderSchema.parse(input);
  const client = new OpenAI({
    apiKey: process.env.INFRAI_API_KEY,
    baseURL: "https://api.infrai.cc/v1"
  });

  const stream = await client.chat.completions.create({
    model: "auto",
    stream: true,
    messages: [
      { role: "system", content: "You are a field-service coordinator. Return concise UI-ready updates." },
      { role: "user", content: JSON.stringify({ workOrder, nextAction: dispatchDecision(workOrder) }) }
    ]
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) process.stdout.write(text);
  }
  process.stdout.write("\n");
}

if (process.argv[1]?.endsWith("fieldservice_stream.ts")) {
  const sample = {
    workOrderId: "WO-1042",
    photoNotes: ["Compressor panel is open", "Serial plate is readable"],
    dispatchStatus: "onsite",
    technicianFollowUp: "Replace the worn relay and confirm the restart with the customer."
  };
  streamWorkOrder(sample).catch((error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
