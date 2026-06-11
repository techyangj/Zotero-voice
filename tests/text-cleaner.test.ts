import assert from "node:assert/strict";
import test from "node:test";
import { cleanSelectedText } from "../src/text-cleaner";

test("joins PDF hyphenated line breaks", () => {
  assert.equal(cleanSelectedText("Error miti-\ngation"), "Error mitigation");
});

test("normalizes ordinary line breaks and spaces", () => {
  assert.equal(
    cleanSelectedText("Short-Depth\n  Quantum   Circuits"),
    "Short-Depth Quantum Circuits"
  );
});

test("removes soft hyphen characters", () => {
  assert.equal(cleanSelectedText("deco\u00adherence"), "decoherence");
});

test("limits text length", () => {
  assert.equal(cleanSelectedText("abcdefgh", 5), "abcde");
});
