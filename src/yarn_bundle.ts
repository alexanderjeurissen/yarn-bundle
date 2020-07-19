#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import program from "commander";
import { writeFile } from "fs";
import { fetchGlobalNodeModules, getPackageDetails, execAsync } from "./util";
import { ObjType } from "./types";
const lineReader = require("line-reader"); // eslint-disable-line @typescript-eslint/no-var-requires

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
    "Write all globally installed node_modules into a *Yarnfile* file."
  )
  .option(
    "-D, --describe",
    "dump adds a description comment above each line, unless the dependency does not have a description."
  )
  .option("-i, --install", "Install all dependencies from the *Yarnfile* file")
  .parse(process.argv);

const Dump = async (options: ObjType) => {
  const { infoEntries }: ObjType = await fetchGlobalNodeModules();

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
      console.log(chalk.blue(name) + "@" + chalk.green(version));
      return `${description ? `# ${description} \n` : ""}${name}@${version}`;
    })
    .join("\n");

  writeFile("Yarnfile", data, (err: any) => {
    if (err) {
      console.error(chalk.red(err));
      return;
    }

    console.log(
      chalk.bgGreen(chalk.black("entries in Yarnfile successfully installed"))
    );
  });
};

const Install = async (options: ObjType) => {
  lineReader.eachLine(
    "Yarnfile",
    async (line: any) => {
      if (line[0] !== "#") {
        const [, name, version] = line.match("(.*)@(.*)");
        console.log(
          "* installing " + chalk.blue(name) + "@" + chalk.green(version)
        );

        await execAsync(`yarn global add ${line}`);
      }
    },
    (err: Error) => {
      if (err) throw err;
      console.log(
        chalk.bgGreen(chalk.black("entries successfully written to ./Yarnfile"))
      );
    }
  );
};

// NOTE: dump global installed node packages to yarn_bundle
if (program.dump) {
  Dump(program);
} else if (program.install) {
  Install(program);
}
