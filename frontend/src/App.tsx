import {
  ColorModeProvider,
  ColorModeScript,
  createLocalStorageManager,
} from "@kobalte/core";
import type { Component } from "solid-js";
import { ModeToggle } from "./DarkModeToggle";
import Profiles from "./Profiles";
import ProfileProvider from "./ProfilesStore";
import { ProjectSelect } from "./ProjectSelect";
import { Separator } from "./components/ui/separator";
import ActiveProjectProvider from "./ActiveProfiles";
import NewProfile from "./NewProfile";
import { ToastList, ToastRegion } from "./components/ui/toast";

const App: Component = () => {
  const storageManager = createLocalStorageManager("vite-ui-theme");
  return (
    <>
      <div class="h-dvh">
        <ColorModeScript storageType={storageManager.type} />
        <ColorModeProvider storageManager={storageManager}>
          <ActiveProjectProvider>
            <ProfileProvider>
              <div class="p-[5vh]">
                <div class="w-full flex flex-row">
                  <ProjectSelect />
                  <div class="ml-auto">
                    <ModeToggle />
                  </div>
                </div>
                <Separator class="my-4" />
                <div class="flex flex-col items-center justify-center">
                  <Profiles />
                  <NewProfile />
                </div>
              </div>
            </ProfileProvider>
          </ActiveProjectProvider>
          <ToastRegion>
            <ToastList />
          </ToastRegion>
        </ColorModeProvider>
      </div>
    </>
  );
};

export default App;
