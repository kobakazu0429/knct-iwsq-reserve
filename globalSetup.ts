import * as util from "node:util";
import * as childProcess from "node:child_process";
import { beforeAll, afterAll, afterEach } from "vitest";
import { faker } from "@faker-js/faker";
import { TRUNCATE } from "./prisma/reset";

const exec = util.promisify(childProcess.exec);

const seed = process.env.FAKER_SEED
  ? faker.seed(+process.env.FAKER_SEED)
  : faker.seed();

console.log(`faker's seed: ${seed}`);

let pid: number | undefined = undefined;

beforeAll(async () => {
  const cockroach = childProcess.spawn("cockroach", [
    "start-single-node",
    "--insecure",
    "--store=type=mem,size=0.25",
    "--advertise-addr=localhost",
    "--logtostderr=WARNING",
  ]);

  await new Promise<void>((resolve) => {
    cockroach.stdout.on("data", (data) => {
      if (data.toString().includes("CockroachDB node starting at ")) {
        pid = cockroach.pid;
        resolve();
      }
    });
  });

  await exec("yarn prisma db push");
});

afterEach(async () => {
  await TRUNCATE();
});

afterAll(() => {
  if (pid) {
    process.kill(pid);
  }
});
