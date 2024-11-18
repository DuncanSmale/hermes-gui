import { main } from "../wailsjs/go/models";
import { TextField, TextFieldInput } from "./components/ui/text-field";
import { Component, createSignal } from "solid-js";
import { useProject } from "./ActiveProfiles";
import { Button } from "./components/ui/button";
import { CreateNewProfile, SaveProfile } from "../wailsjs/go/main/App";
import { useProfile } from "./ProfilesStore";
import { writeClipboard } from "@solid-primitives/clipboard";
import { toaster } from "@kobalte/core";
import {
  Toast,
  ToastContent,
  ToastDescription,
  ToastProgress,
  ToastTitle,
} from "./components/ui/toast";

const NewProfile: Component = () => {
  const { project, setProject } = useProject();
  const { coreData, setCoreData } = useProfile();
  const [newProfile, setNewProfile] = createSignal("");
  return (
    <div class="fixed bottom-0 w-[100%] bg-bottom border-t border-gray-600 pt-2 pb-2">
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
              const newProfiles: main.ProfileEntity[] = newProfile()
                .replace(" ", "")
                .replace("\n", "")
                .replace("\t", "")
                .split(",")
                .filter((val) => val != "")
                .map((profileValue) => {
                  return {
                    id: -1,
                    isSelected: true,
                    profileName: profileValue,
                  };
                });
              CreateNewProfile(newProfiles, coreData.currentProject).then(
                (profiles: main.ProfileEntity[]) => {
                  setProject((old) => {
                    let mergedProfiles = [...old.profiles, ...profiles];
                    let newProject = new main.Project();
                    newProject.profiles = mergedProfiles;
                    return newProject;
                  });
                  setNewProfile("");
                },
              );
            }}
          >
            Add Profile/s
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              let profilesString = project()
                .profiles.filter((profile) => profile.isSelected)
                .map((profile) => profile.profileName)
                .join(",");
              writeClipboard(profilesString);
              toaster.show((props) => (
                <Toast toastId={props.toastId}>
                  <ToastContent>
                    <ToastTitle>Profiles copied to clipboard</ToastTitle>
                    <ToastDescription>{profilesString}</ToastDescription>
                  </ToastContent>
                  <ToastProgress />
                </Toast>
              ));
            }}
          >
            Generate String
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default NewProfile;
