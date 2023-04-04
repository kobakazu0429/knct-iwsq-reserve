import * as childProcess from "node:child_process";
import { beforeAll, afterEach } from "vitest";
import { TRUNCATE } from "./prisma/reset";

beforeAll(() => {
  childProcess.execSync("yarn prisma db push");
});

afterEach(async () => {
  await TRUNCATE();
});
