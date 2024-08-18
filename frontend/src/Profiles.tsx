import {
  Component,
  ErrorBoundary,
  For,
  Suspense,
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
  onMount(async () => {
    let result = await LoadInitialData();
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
    setCoreData(
      "projects",
      coreData.currentProject,
      "profiles",
      (profilesArray: main.ProfileEntity[]) =>
        profilesArray.filter((p: main.ProfileEntity) => p.id !== profile.id),
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
        <ErrorBoundary fallback={<div>Something went wrong!</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <For
              each={coreData.projects[`${coreData.currentProject}`].profiles}
              fallback={<div>No items</div>}
            >
              {(item, index) => (
                <Profile
                  id={`${index()}`}
                  profile={item}
                  onDelete={(profile) => removeProfile(profile)}
                  onChange={(profile) => updateProfile(profile)}
                />
              )}
            </For>
          </Suspense>
        </ErrorBoundary>
      </main>
      <footer class="space-y-4 items-center">
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
        <div class="space-x-4" id={"addSingleDiv"}>
          <Button
            id={"AddMultiple"}
            onClick={() => {
              let size =
                coreData.projects[`${coreData.currentProject}`].profiles.length;
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
                setCoreData(
                  "projects",
                  coreData.currentProject,
                  "profiles",
                  (profilesArray: main.ProfileEntity[]) => [
                    ...profilesArray,
                    ...newProfiles,
                  ],
                );
                setNewProfile("");
              }
            }}
          >
            Add Profile/s
          </Button>
          <Button>Generate String</Button>
        </div>
      </footer>
    </>
  );
};

export default Profiles;
