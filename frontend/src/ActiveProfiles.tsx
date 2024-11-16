import {
  ParentComponent,
  createContext,
  createSignal,
  useContext,
  Accessor,
  Setter,
} from "solid-js";
import { main } from "../wailsjs/go/models";

export type ProjectStoreType = {
  project: Accessor<main.Project>;
  setProject: Setter<main.Project>;
};

export const ActiveProjectContext = createContext<ProjectStoreType>();

const ActiveProjectProvider: ParentComponent = (props) => {
  let defaultProject = new main.Project();
  defaultProject.name = "default";
  defaultProject.profiles = [];
  const [project, setProject] = createSignal(defaultProject, { equals: false });

  return (
    <ActiveProjectContext.Provider value={{ project, setProject }}>
      {props.children}
    </ActiveProjectContext.Provider>
  );
};

export default ActiveProjectProvider;

export function useProject() {
  return useContext(ActiveProjectContext);
}
