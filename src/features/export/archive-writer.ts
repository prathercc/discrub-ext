import streamSaver from "streamsaver";
import { Writer } from "@transcend-io/conflux";

type ArchiveEntryOptions = {
  lastModified?: Date;
};

class ArchiveWriter {
  private readable: ReadableStream;
  private writable: WritableStream;
  private writer: WritableStreamDefaultWriter<unknown>;
  private fileStream: WritableStream<Uint8Array> | null = null;
  private pipePromise: Promise<void> | null = null;
  private closed = false;

  constructor(private readonly fileName: string) {
    const { readable, writable } = new Writer();
    this.readable = readable;
    this.writable = writable;
    this.writer = this.writable.getWriter();
    streamSaver.mitm = "resources/html/mitm.html";
  }

  private ensurePipe = () => {
    if (!this.fileStream) {
      this.fileStream = streamSaver.createWriteStream(this.fileName);
    }

    if (!this.pipePromise) {
      const fileStream = this.fileStream!;
      this.pipePromise = this.readable.pipeTo(fileStream);
    }
  };

  addBlob = async (
    blob: Blob,
    filename: string,
    options?: ArchiveEntryOptions,
  ) => {
    await this.addStream(
      filename,
      () => new Response(blob).body,
      options,
    );
  };

  addText = async (
    text: string,
    filename: string,
    options?: ArchiveEntryOptions,
  ) => {
    await this.addBlob(new Blob([text], { type: "application/json" }), filename, options);
  };

  addStream = async (
    filename: string,
    createStream: () => ReadableStream<Uint8Array> | null,
    options?: ArchiveEntryOptions,
  ) => {
    if (this.closed) {
      throw new Error("Archive has already been finalized.");
    }

    const stream = createStream();
    if (!stream) {
      throw new Error(`Could not create stream for ${filename}`);
    }

    this.ensurePipe();
    await this.writer.ready;
    await this.writer.write({
      name: filename,
      lastModified: options?.lastModified || new Date(),
      stream: () => stream,
    });
  };

  close = async () => {
    if (this.closed) return;

    await this.writer.ready;
    await this.writer.close();
    this.closed = true;

    if (this.pipePromise) {
      await this.pipePromise;
    }
  };
}

export default ArchiveWriter;
