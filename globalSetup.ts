import * as childProcess from "node:child_process";
import { faker } from "@faker-js/faker";

let pid: number | undefined = undefined;

export const setup = async () => {
  const seed = process.env.FAKER_SEED
    ? faker.seed(+process.env.FAKER_SEED)
    : faker.seed();

  console.log(`faker's seed: ${seed}`);

  const cockroach = childProcess.spawn("cockroach", [
    "start-single-node",
    "--insecure",
    "--store=type=mem,size=0.25",
    "--advertise-addr=localhost",
    "--logtostderr=WARNING",
  ]);

  await new Promise<void>((resolve) => {
    cockroach.stdout.on("data", (data) => {
      console.log(data.toString());
      if (data.toString().includes("CockroachDB node starting at ")) {
        pid = cockroach.pid;
        resolve();
      }
    });
  });
};

export const teardown = () => {
  if (pid) {
    process.kill(pid);
  }
};
