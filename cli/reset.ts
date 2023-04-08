import { TRUNCATE } from "../prisma/reset";

const main = async () => {
  console.info(`Start dropping ...`);
  await TRUNCATE();
  console.info(`Dropping finished.\n`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
