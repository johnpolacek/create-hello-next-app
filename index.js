#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import ora from "ora";
import execa from "execa";
import inquirer from "inquirer";

const projectNameOption = "--project-name <projectName>";

const updateAppConfig = async (projectName, appConfig) => {
  const appConfigPath = `${projectName}/src/app.config.ts`;

  const updatedConfig = `
const appConfig = {
  name: "${appConfig.name}",
  description: "${appConfig.description}",
  image: "${appConfig.image}",
  url: "${appConfig.url}",
};

export default appConfig;
`;

  await fs.writeFile(appConfigPath, updatedConfig);
};

const initProject = async (projectName) => {
  if (!projectName) {
    console.error(chalk.red("Error: Project name is required."));
    process.exit(1);
  }

  const questions = [
    {
      type: "input",
      name: "name",
      message: "Enter the app name:",
      default: "Hello Next App",
    },
    {
      type: "input",
      name: "description",
      message: "Enter the app description:",
      default: "Hello Next App is a Next.js Starter Project...",
    },
    {
      type: "input",
      name: "image",
      message: "Enter the app image URL:",
      default: "https://hellonext.vercel.app/screenshot.png",
    },
    {
      type: "input",
      name: "url",
      message: "Enter the app URL:",
      default: "https://hellonext.vercel.app",
    },
  ];

  const appConfig = await inquirer.prompt(questions);

  const spinner = ora("Cloning the Hello Next App starter project...").start();

  try {
    await execa("git", ["clone", "https://github.com/johnpolacek/hello-next-app", projectName]);
    spinner.succeed("Project cloned successfully.");

    spinner.start("Updating app.config.ts...");
    await updateAppConfig(projectName, appConfig);
    spinner.succeed("app.config.ts updated.");

    spinner.start("Installing dependencies...");
    process.chdir(projectName);
    await execa("npm", ["install"]);
    spinner.succeed("Dependencies installed.");

    console.log(chalk.green("\nHello Next App starter project is ready!"));
    console.log(`\nTo get started, run the following commands:\n
      cd ${projectName}
      npm run dev
    `);
  } catch (error) {
    spinner.fail("An error occurred while initializing the project.");
    console.error(chalk.red(error));
  }
};

program
  .option(projectNameOption, "Name of the new project")
  .action(initProject);

program.parse(process.argv);

if (program.opts().projectName === undefined) {
  program.outputHelp();
}
