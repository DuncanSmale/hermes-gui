import type { Component } from "solid-js";
import {
  ColorModeProvider,
  ColorModeScript,
  createLocalStorageManager,
} from "@kobalte/core";
import Profiles from "./Profiles";
import { ModeToggle } from "./DarkModeToggle";
import ProfileProvider from "./ProfilesStore";
import { ProjectSelect } from "./ProjectSelect";

const App: Component = () => {
  const storageManager = createLocalStorageManager("vite-ui-theme");
  return (
    <>
      <div class="h-dvh">
        <ColorModeScript storageType={storageManager.type} />
        <ColorModeProvider storageManager={storageManager}>
          <ProfileProvider>
            <div class="p-[5vh]">
              <div class="w-full flex flex-row">
                <ProjectSelect />
                <div class="ml-auto">
                  <ModeToggle />
                </div>
              </div>
              <div class="mt-[10vh] h-[60vh] flex flex-col items-center justify-center">
                <Profiles />
              </div>
            </div>
          </ProfileProvider>
        </ColorModeProvider>
      </div>
    </>
  );
};

export default App;
