import { main } from "../wailsjs/go/models";
import { ProfileStoreType, useProfile } from "./ProfilesStore";

import { produce } from "solid-js/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function ProjectSelect() {
  const { coreData, setCoreData }: ProfileStoreType = useProfile();
  const updateProject = (projectName: string) => {
    console.log("Changing to ", projectName);
    if (projectName == "New project...") {
      projectName = "New Project";
    }
    setCoreData(
      produce((projectState: main.CoreData) => {
        projectState.currentProject = projectName;
        if (projectState.projects[projectName] == null) {
          projectState.projects[projectName] = new main.Project();
          projectState.projects[projectName].profiles = [];
          projectState.projects[projectName].name = projectName;
        }
      }),
    );
    console.log("this is the new current project", coreData.currentProject);
  };
  // const projects = ;
  // console.log(projects);
  // projects.filter((name) => name != null);

  return (
    <div class="flex-col">
      <Select
        value={coreData.currentProject}
        onChange={updateProject}
        options={[
          ...Object.keys(coreData?.projects || []),
          "New project...",
        ].filter((opt) => opt != null && opt != "null")}
        placeholder="Select a project…"
        itemComponent={(props) => (
          <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
        )}
      >
        <SelectTrigger aria-label="Fruit" class="w-[180px]">
          <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
    </div>
  );
}
