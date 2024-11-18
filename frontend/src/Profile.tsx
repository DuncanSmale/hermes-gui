import { type Component } from "solid-js";
import { main } from "../wailsjs/go/models";
import { Button } from "./components/ui/button";
import { Checkbox } from "./components/ui/checkbox";
import { TextField, TextFieldInput } from "./components/ui/text-field";

const Profile: Component<{
  profile: main.ProfileEntity;
  id: string;
  onDelete: (profile: main.ProfileEntity) => void;
  onChange: (profile: main.ProfileEntity) => void;
}> = (props) => {
  return (
    <div class="flex space-x-4 items-center" id={props.id}>
      <Checkbox
        checked={props.profile.isSelected}
        id={"isSelected" + props.id}
        onChange={(newSelected: boolean) =>
          props.onChange({ ...props.profile, isSelected: newSelected })
        }
      />
      <TextField
        onChange={(newValue: string) =>
          props.onChange({ ...props.profile, profileName: newValue })
        }
      >
        <TextFieldInput
          type="text"
          id="profileName"
          placeholder="profile name"
          value={props.profile.profileName}
        />
      </TextField>
      <Button
        variant="destructive"
        id={"Button" + props.id}
        onClick={() => props.onDelete(props.profile)}
      >
        Delete
      </Button>
    </div>
  );
};

export default Profile;
