/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface Timeout {
    ref(): void;
    unref(): void;
  }
}
