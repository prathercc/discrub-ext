import Channel from "../../classes/channel";
import Message from "../../classes/message";
import { FilterName } from "../../enum/filter-name";
import { FilterType } from "../../enum/filter-type";
import { HasType } from "../../enum/has-type";
import { SortDirection } from "../../enum/sort-direction";
import { IsPinnedType } from "../../enum/is-pinned-type.ts";

export type MessageState = {
  messages: Message[]; // Message objects
  selectedMessages: Snowflake[]; // Array of id
  filteredMessages: Message[]; // Message objects
  filters: Filter[]; // Array of object filters
  isLoading: boolean | Maybe;
  order: SortDirection;
  orderBy: keyof Message;
  searchCriteria: SearchCriteria;
};

export type Filter =
  | {
      filterName?: undefined;
      filterValue: Snowflake | Maybe;
      filterType: FilterType.THREAD;
    }
  | {
      filterValue: string | string[] | Maybe;
      filterType: FilterType.TEXT;
      filterName:
        | FilterName.ATTACHMENT_NAME
        | FilterName.CONTENT
        | keyof Message;
    }
  | {
      filterValue: Date | Maybe;
      filterType: FilterType.DATE;
      filterName: FilterName.END_TIME | FilterName.START_TIME;
    }
  | {
      filterValue: boolean;
      filterType: FilterType.TOGGLE;
      filterName: FilterName.INVERSE;
    }
  | {
      filterName: FilterName.MESSAGE_TYPE;
      filterValue: string[];
      filterType: FilterType.ARRAY;
    };

export type DeleteConfiguration = {
  attachments: boolean;
  messages: boolean;
  reactions: boolean;
  reactingUserIds?: string[];
  emojis?: string[];
};

export type MessageData = {
  threads: Channel[];
  messages: Message[];
};

export type SearchResultData = {
  offset: number;
  searchCriteria: SearchCriteria;
  totalMessages: number;
};

export type MessageSearchOptions = {
  excludeReactions?: boolean;
  excludeUserLookups?: boolean;
  startOffSet?: number;
  endOffSet?: number;
  searchCriteriaOverrides?: Partial<SearchCriteria>;
};

export type SearchCriteria = {
  searchBeforeDate: Date | Maybe;
  searchAfterDate: Date | Maybe;
  searchMessageContent: string | Maybe;
  selectedHasTypes: HasType[];
  userIds: string[];
  mentionIds: string[];
  channelIds: string[];
  isPinned: IsPinnedType;
};
