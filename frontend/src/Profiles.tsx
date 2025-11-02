import { debounce } from "@solid-primitives/scheduled";
import {
  Component,
  For,
  Index,
  Show,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import { produce } from "solid-js/store";
import {
  LoadInitialData,
  SaveProject,
  SaveProfile,
  DeleteProfile,
} from "../wailsjs/go/main/App.js";
import { main } from "../wailsjs/go/models";
import { useProject } from "./ActiveProfiles.jsx";
import Profile from "./Profile";
import { useProfile } from "./ProfilesStore";
import { TextField, TextFieldInput } from "./components/ui/text-field";
import { TransitionGroup } from "solid-transition-group";

const Profiles: Component = () => {
  const { project, setProject } = useProject();
  const { coreData, setCoreData } = useProfile();
  const [profiles, setProfiles] = createSignal(project().profiles);
  const triggerProjectUpdate = debounce(
    (newProjectName: string) => renameProject(newProjectName),
    250,
  );
  const triggerProfileUpdate = debounce(
    (profile: main.ProfileEntity) => updateProfile(profile),
    250,
  );

  createEffect(() => {
    console.log("current project changed ", coreData.currentProject);
    setProject(coreData.projects[coreData.currentProject]);
  });

  onMount(async () => {
    let result = await LoadInitialData();
    console.log(result);
    if (result != undefined) {
      setCoreData(result);
      setProject(coreData.projects[coreData.currentProject]);
    }
  });

  createEffect(() => {
    console.log("Project updated: ", project());
    if (project() != undefined) {
      setProfiles(project()?.profiles || []);
      setCoreData(
        "projects",
        coreData.currentProject,
        "profiles",
        project()?.profiles || [],
      );
    }
  });

  const updateProfile = (profile: main.ProfileEntity) => {
    console.log("Updated", profile);

    setProject((old) => {
      let newProject = new main.Project();
      newProject.name = old.name;
      newProject.profiles = [...old.profiles];
      let newProfile = new main.ProfileEntity();
      newProfile.profileName = profile.profileName;
      newProfile.isSelected = profile.isSelected;
      newProfile.id = profile.id;
      const index = newProject.profiles.findIndex(
        (check) => check.id == profile.id,
      );
      console.log(profile, index);
      if (index != -1) {
        newProject.profiles[index] = newProfile;
      }

      return newProject;
    });
    new Promise((_) =>
      SaveProfile(profile.profileName, profile.isSelected, profile.id),
    ).then();
  };
  const removeProfile = (profile: main.ProfileEntity) => {
    console.log("Deleted", profile);
    DeleteProfile(profile.id);

    setProject((old) => {
      let filteredProfiles = old.profiles.filter(
        (p: main.ProfileEntity) => p.id !== profile.id,
      );
      let newProject = new main.Project();
      newProject.profiles = filteredProfiles;
      newProject.name = old.name;
      return newProject;
    });
  };
  const renameProject = (newProjectName: string) => {
    let oldName = coreData.currentProject;
    console.log(
      `Renaming from: ${coreData.currentProject} -> ${newProjectName}`,
    );
    setCoreData(
      produce((state: main.CoreData) => {
        state.projects[newProjectName] =
          state.projects[coreData.currentProject];
        delete state.projects[coreData.currentProject];
        state.currentProject = newProjectName;
      }),
    );
    SaveProject(newProjectName, oldName);
  };

  return (
    <>
      <Show when={coreData.currentProject != null}>
        <TextField
          class="pb-4"
          onChange={(newProjectName: string) =>
            triggerProjectUpdate(newProjectName)
          }
        >
          <TextFieldInput
            type="text"
            id="projectName"
            placeholder="New project..."
            value={coreData.currentProject}
          />
        </TextField>
      </Show>
      <main class="flex-grow space-y-4 mb-[10%]">
        {/* <TransitionGroup> */}
        <For
          each={profiles().toSorted((a, b) =>
            a.profileName > b.profileName ? 1 : -1,
          )}
          fallback={<div>No Profiles</div>}
        >
          {(item, index) => (
            <Profile
              id={`${index()}`}
              profile={item}
              onDelete={(profile) => removeProfile(profile)}
              onChange={(profile) => triggerProfileUpdate(profile)}
            />
          )}
        </For>
        {/* </TransitionGroup> */}
      </main>
    </>
  );
};

export default Profiles;
