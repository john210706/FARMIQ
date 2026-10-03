require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { starterTutorials } = require('./src/learning-data');
const prisma = new PrismaClient();
(async () => {
  if (process.env.ALLOW_LEARNING_SEED !== 'true')
    throw new Error('Set ALLOW_LEARNING_SEED=true to add starter learning content');
  const result = await prisma.tutorial.createMany({ data: starterTutorials, skipDuplicates: true });
  console.log(
    `Added ${result.count} learning records. Existing tutorials were preserved. Equipment videos remain unpublished until reviewed.`,
  );
})()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
