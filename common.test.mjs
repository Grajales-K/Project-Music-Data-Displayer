// common.test.mjs (Converted to Jest)
import { countUsers } from "./common.mjs";

describe("User count", () => {
  test("is correct", () => {
    expect(countUsers()).toBe(4);
  });
});
