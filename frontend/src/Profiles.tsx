import {
  Component,
  For,
  Index,
  Suspense,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import { produce } from "solid-js/store";
import { LoadInitialData } from "../wailsjs/go/main/App.js";
import { main } from "../wailsjs/go/models";
import Profile from "./Profile";
import { ProfileStoreType, useProfile } from "./ProfilesStore";
import { Button } from "./components/ui/button";
import { TextField, TextFieldInput } from "./components/ui/text-field";

const Profiles: Component = () => {
  const { coreData, setCoreData }: ProfileStoreType = useProfile();
  const [currentProfiles, setCurrentProfiles] = createSignal(
    coreData?.projects[coreData?.currentProject]?.profiles || [],
  );
  createEffect(() => {
    console.log(coreData.currentProject);
    setCurrentProfiles(
      coreData?.projects[coreData?.currentProject]?.profiles || [],
    );
  });

  createEffect(() => {
    console.log(coreData.currentProject);
    setCoreData(
      "projects",
      coreData.currentProject,
      "profiles",
      currentProfiles(),
    );
  });
  onMount(async () => {
    let result = await LoadInitialData();
    console.log(result);
    setCoreData(result);
  });

  const [newProfile, setNewProfile] = createSignal("");
  const updateProfile = (profile: main.ProfileEntity) => {
    console.log("Updated", profile);
    setCoreData(
      "projects",
      coreData.currentProject,
      "profiles",
      (profileToCheck: main.ProfileEntity) => profileToCheck.id === profile.id,
      produce((updatedProfile: main.ProfileEntity) => {
        updatedProfile.profileName = profile.profileName;
        updatedProfile.isSelected = profile.isSelected;
      }),
    );
  };
  const removeProfile = (profile: main.ProfileEntity) => {
    console.log("Deleted", profile);
    // setCoreData(
    //   "projects",
    //   coreData.currentProject,
    //   "profiles",
    //   (profilesArray: main.ProfileEntity[]) =>
    //     profilesArray.filter((p: main.ProfileEntity) => p.id !== profile.id),
    // );
    setCurrentProfiles((old) =>
      old.filter((p: main.ProfileEntity) => p.id !== profile.id),
    );
  };
  const renameProject = (newProjectName: string) => {
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
  };

  return (
    <>
      <TextField
        class="pb-4"
        onChange={(newProjectName: string) => renameProject(newProjectName)}
      >
        <TextFieldInput
          type="text"
          id="projectName"
          placeholder="New project..."
          value={coreData.currentProject}
        />
      </TextField>
      <main class="flex-grow space-y-4">
        <Index each={currentProfiles()}>
          {(item, index) => (
            <Profile
              id={`${index}`}
              profile={item()}
              onDelete={(profile) => removeProfile(profile)}
              onChange={(profile) => updateProfile(profile)}
            />
          )}
        </Index>
      </main>
      <div class="fixed bottom-0 w-[100%] bg-black pt-2 pb-2">
        <footer class="space-y-2 items-center w-[27%] m-auto">
          <div id={"inputDiv"}>
            <TextField onChange={(newValue: string) => setNewProfile(newValue)}>
              <TextFieldInput
                type="text"
                id="profileName"
                placeholder="new profile"
                value={newProfile()}
              />
            </TextField>
          </div>
          <div
            class="flex flex-row flex-wrap justify-between content-evenly space-x-2"
            id={"addSingleDiv"}
          >
            <Button
              id={"AddMultiple"}
              onClick={() => {
                let size =
                  coreData?.projects[`${coreData.currentProject}`]?.profiles
                    ?.length || 0;
                const newProfiles: main.ProfileEntity[] = newProfile()
                  .replace(" ", "")
                  .replace("\n", "")
                  .replace("\t", "")
                  .split(",")
                  .map((profileValue) => ({
                    id: size++,
                    isSelected: true,
                    profileName: profileValue,
                  }));
                if (
                  newProfiles.length > 0 &&
                  newProfiles.at(0).profileName != ""
                ) {
                  setCurrentProfiles((old) => old.concat(newProfiles));
                  for (let prof of newProfiles) {
                    console.log(prof);
                    // setCoreData(
                    //   "projects",
                    //   coreData.currentProject,
                    //   "profiles",
                    //   prof.id,
                    //   prof,
                    // );
                  }
                  setNewProfile("");
                }
              }}
            >
              Add Profile/s
            </Button>
            <Button>Generate String</Button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Profiles;
