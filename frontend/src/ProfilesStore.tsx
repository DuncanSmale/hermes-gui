import { ParentComponent, createContext, useContext } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { main } from "../wailsjs/go/models";

export const ProfileContext = createContext<ProfileStoreType>();

export type ProfileStoreType = {
  coreData: main.CoreData;
  setCoreData: SetStoreFunction<main.CoreData>;
};

const ProfileProvider: ParentComponent = (props) => {
  let data = new main.CoreData();
  let project = new main.Project();
  project.name = "default";
  project.profiles = [];
  data.projects = { default: project };
  data.currentProject = "";
  const [coreData, setCoreData] = createStore<main.CoreData>(data);

  return (
    <ProfileContext.Provider value={{ coreData, setCoreData }}>
      {props.children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;

export function useProfile() {
  return useContext(ProfileContext);
}
