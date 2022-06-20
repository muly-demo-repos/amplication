import { join, dirname } from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import { Module, CodeGenerationInput } from "../src/types";
import { createDataService } from "../src/create-data-service";

if (require.main === module) {
  const [, , source, destination] = process.argv;
  if (!source) {
    throw new Error("INPUT is not defined");
  }
  if (!destination) {
    throw new Error("OUTPUT is not defined");
  }
  generateCode(source, destination).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default async function generateCode(
  source: string,
  destination: string
): Promise<void> {
  const file = await readFile(source, "utf8");
  const cgi: CodeGenerationInput = JSON.parse(file);
  const modules = await createDataService(cgi.entities, cgi.roles, cgi.appInfo);
  await writeModules(modules, destination);
}

async function writeModules(
  modules: Module[],
  destination: string
): Promise<void> {
  console.info(`Writing modules to ${destination} ...`);
  await Promise.all(
    modules.map(async (module) => {
      const filePath = join(destination, module.path);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, module.code);
    })
  );
  console.info(`Successfully wrote modules to ${destination}`);
}