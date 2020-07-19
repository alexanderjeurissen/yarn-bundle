import { exec } from "child_process";
import chalk from "chalk";
import { ObjType } from "./types";

export const execAsync = async (cmd: string): Promise<string> => {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(error));
      }

      if (stderr) {
        console.error(chalk.red(stderr));
      }

      resolve(stdout ? stdout : stderr);
    });
  });
};

export const fetchGlobalNodeModules = async (): Promise<ObjType> => {
  const stdout = await execAsync("yarn global --json --no-progress list");

  const entries: ObjType[] = JSON.parse(
    `[${stdout.trim().split("\n").join(",")}]`
  );

  const listEntries: ObjType[] = entries.filter(
    (entry: ObjType) => entry["type"] === "list"
  );

  const infoEntries: ObjType[] = entries.filter(
    (entry: ObjType) => entry["type"] === "info"
  );

  return { entries, listEntries, infoEntries };
};

export const fetchPackageInfo = async (
  packageName: string
): Promise<ObjType> => {
  const result: string = await execAsync(`yarn --json info ${packageName}`);

  return JSON.parse(result)["data"];
};

export const getPackageDetails = (options: ObjType) => async (
  nodePackage: ObjType
): Promise<ObjType> => {
  const { data } = nodePackage;
  const [, name, version] = data.match(/^"(.*)@(.*)" has binaries/);

  const details: ObjType = { name, version };

  // NOTE: only fetch description if --describe flag is passed
  if (options.describe) {
    const { description } = await fetchPackageInfo(name);
    details["description"] = description;
  }

  return details;
};
