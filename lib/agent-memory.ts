import { MemorySaver } from "@langchain/langgraph";

// We use a global singleton for the checkpointer in development 
// to ensure it survives Next.js hot-reloads.
const globalForAgent = global as unknown as {
  checkpointer: MemorySaver | undefined;
};

export const getCheckpointer = () => {
  if (!globalForAgent.checkpointer) {
    globalForAgent.checkpointer = new MemorySaver();
  }
  return globalForAgent.checkpointer;
};
