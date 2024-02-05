import Channel from "../../classes/channel";
import Message from "../../classes/message";

export type ThreadState = {
  threads: Channel[];
};

export type ArchivedThreadProps = {
  channelId: string;
  knownThreads: Channel[];
};

export type LiftPermissionProps = {
  channelId: string;
  noPermissionThreadIds: string[];
};

export type ThreadsFromMessagesProps = {
  messages: Message[];
  knownThreads: Channel[];
};
