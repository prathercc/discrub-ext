import { useMessageSlice } from "../../../features/message/use-message-slice";
import EnhancedAutocomplete from "../../../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";
import { IsPinnedType } from "../../../enum/is-pinned-type.ts";

type IsPinnedProps = {
  disabled: boolean;
};

function IsPinned({ disabled }: IsPinnedProps) {
  const { state: messageState, setSearchCriteria } = useMessageSlice();
  const searchCriteria = messageState.searchCriteria();
  const { isPinned } = searchCriteria;

  const map = {
    [IsPinnedType.UNSET]: "Unset",
    [IsPinnedType.YES]: "Yes",
    [IsPinnedType.NO]: "No",
  };

  return (
    <EnhancedAutocomplete
      onChange={(value) => {
        if (value) {
          setSearchCriteria({ isPinned: value as IsPinnedType });
        } else {
          setSearchCriteria({ isPinned: IsPinnedType.UNSET });
        }
      }}
      getOptionLabel={(value) => map[value as IsPinnedType]}
      value={[isPinned]}
      options={Object.values(IsPinnedType)}
      disabled={disabled}
      label="Pinned Messages"
    />
  );
}

export default IsPinned;
