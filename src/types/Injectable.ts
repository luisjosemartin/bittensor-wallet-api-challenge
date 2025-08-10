export interface Injectable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject(app: any): void;
}
