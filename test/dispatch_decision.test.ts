import assert from "node:assert/strict";
import { dispatchDecision, workOrderSchema } from "../src/fieldservice_stream.ts";

const input = workOrderSchema.parse({
  workOrderId: "WO-test",
  photoNotes: ["Panel is open"],
  dispatchStatus: "onsite",
  technicianFollowUp: "Replace relay and confirm restart with customer."
});

assert.equal(dispatchDecision(input), "request-customer-signoff");
console.log("dispatch decision test passed");
