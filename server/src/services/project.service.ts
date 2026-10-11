import { generateSlug } from "random-word-slugs";
import { LOCAL_USER_ID } from "../config/constants";
import { FileCollection, writeSandboxFiles } from "../lib/sandbox";
import {
  createProjectWithMessage,
  findAllProjects,
  findProjectById,
} from "../repositories/project.repository";

export const getAllProjects = () => {
  return findAllProjects();
};

export const getProjectById = (id: string) => {
  return findProjectById(id);
};

const HELLO_WORLD_FILES: FileCollection = {
  "src/App.tsx": `export default function App() {
  return <h1>Hello, World!</h1>;
}
`,
};

export const createProject = async (value: string) => {
  const project = await createProjectWithMessage({
    name: generateSlug(3, { format: "kebab" }),
    userId: LOCAL_USER_ID,
    content: value,
  });

  await writeSandboxFiles(project.id, HELLO_WORLD_FILES);

  return project;
};
