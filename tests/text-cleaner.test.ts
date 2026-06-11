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

test("removes parenthetical author-year citations", () => {
  assert.equal(
    cleanSelectedText("Quantum-centric supercomputing (Bravyi et al., 2022; Gambetta, 2022) combines these strengths."),
    "Quantum-centric supercomputing combines these strengths."
  );
});

test("removes bracketed numeric citations", () => {
  assert.equal(
    cleanSelectedText("These methods improve fidelity [1, 2, 5-7] in noisy circuits."),
    "These methods improve fidelity in noisy circuits."
  );
});

test("removes parenthetical numeric citations", () => {
  assert.equal(
    cleanSelectedText("The protocol was later improved (12, 14) for larger systems."),
    "The protocol was later improved for larger systems."
  );
});

test("removes narrative year-only citations", () => {
  assert.equal(
    cleanSelectedText("Bravyi et al. (2022) introduced quantum-centric supercomputing."),
    "Bravyi et al. introduced quantum-centric supercomputing."
  );
});

test("removes bracketed author-year citations", () => {
  assert.equal(
    cleanSelectedText("Hybrid workflows [Bravyi et al., 2022; Gambetta, 2022] combine these strengths."),
    "Hybrid workflows combine these strengths."
  );
});

test("removes unicode superscript citation numbers", () => {
  assert.equal(cleanSelectedText("Error mitigation¹² improves short-depth circuits."), "Error mitigation improves short-depth circuits.");
});

test("keeps explanatory parentheses without citation markers", () => {
  assert.equal(
    cleanSelectedText("The state space (large and sparse) remains difficult."),
    "The state space (large and sparse) remains difficult."
  );
});

test("limits text length", () => {
  assert.equal(cleanSelectedText("abcdefgh", 5), "abcde");
});
