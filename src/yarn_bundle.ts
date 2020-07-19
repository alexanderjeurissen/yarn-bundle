#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import path from "path";
import program from "commander";
import { writeFile } from "fs";
import {
  fetchGlobalNodeModules,
  fetchPackageInfo,
  getPackageDetails,
} from "./util";
import { ObjType } from "./types";

clear();
console.log(
  chalk.green(figlet.textSync("Yarn Bundle", { horizontalLayout: "full" }))
);
console.log(chalk.greenBright("brought to you by @alexanderjeurissen"));

program
  .version("0.0.1")
  .description("A CLI for bundling global node modules")
  .option(
    "-d, --dump",
    "Write all globally installed node_modules into a *yarnFile* file."
  )
  .option(
    "-D, --describe",
    "dump adds a description comment above each line, unless the dependency does not have a description."
  )
  .option(
    "-i, --install",
    "WIP: Install all dependencies from the *yarnFile* file"
  )
  .option("-f, --file", "WIP: Read the *yarnFile* file from this location.")
  .parse(process.argv);

const DumpGlobalNodeModules = async (options: ObjType) => {
  const {
    entries,
    infoEntries,
    listEntries,
  }: ObjType = await fetchGlobalNodeModules();

  console.log(
    chalk.yellow(
      `NOTE: found ${infoEntries.length} global node modules managed by yarn..`
    )
  );

  console.log("");

  const nodePackages: ObjType[] = await Promise.all(
    infoEntries.map(getPackageDetails(options))
  );

  const data = nodePackages
    .map(({ name, version, description }) => {
      if (description) console.log(chalk.greenBright(`# ${description}`));
      console.log(chalk.blue(name) + "@" + chalk.green(version));
      if (description) console.log("");

      return `${description ? `# ${description} \n` : ""}${name}@${version}`;
    })
    .join("\n\n");

  writeFile("yarnFile", data, (err) => {
    if (err) {
      console.error(chalk.red(err));
      return;
    }

    console.log(
      chalk.bgGreen(chalk.black("entries successfully written to ./yarnFile"))
    );
  });
};

// NOTE: dump global installed node packages to yarn_bundle
if (program.dump) {
  DumpGlobalNodeModules(program);
}
