import { Characters } from "./characters";
import { getTextNodes } from "./dom";
import { isWithinOne } from "./testutils/assert";
import {
  BlobProps,
  DOM,
  getCharacterWidthInContainer,
  wrapCharsInSpans
} from "./testutils/dom";
import { createMouseMoveEvent } from "./testutils/mouse";

const { expect } = chai;

const tabChar = String.fromCharCode(9);
const spaceChar = String.fromCharCode(32);

describe("getTextNodes", () => {
  const dom = new DOM();
  after(dom.cleanup);

  it("gets the correct text nodes", () => {
    const elems = [
      {
        // Has nodes at multiple depths
        elem:
          "<div><span>He</span><span>llo,<span> Wo</span></span><span>rld!</span></div>",
        nodeValues: ["He", "llo,", " Wo", "rld!"]
      },
      {
        elem: `<div><span>${tabChar}He</span><span>llo,<span> Wo</span></span><span>orld!</span></div>`,
        nodeValues: [tabChar + "He", "llo,", " Wo", "orld!"]
      }
    ];
    for (const { elem, nodeValues } of elems) {
      const nodes = getTextNodes(dom.createElementFromString(elem));
      expect(nodes.length).to.equal(nodeValues.length);

      for (const [i, val] of nodeValues.entries()) {
        expect(nodes[i].nodeValue).to.equal(val);
      }
    }
  });
});

describe("Characters", () => {
  const dom = new DOM();
  after(dom.cleanup);

  let testcases: Array<{
    blobProps: BlobProps;
    measure: Characters;
    measureContainer: HTMLElement;
    chars: Array<{
      character: string;
      width: number;
    }>;
  }> = [];

  before(() => {
    testcases = dom.createBlobs().map((blobProps, i) => {
      const firstRow = blobProps.getCodeElementFromLineNumber(
        blobProps.element,
        0
      )!;

      const cases = [tabChar, spaceChar, "a", "b", "c", "d", "/", "#"];

      const measure = new Characters(firstRow);
      const newRow = blobProps.insertRow("");
      const measureContainer = newRow.children.item(1)! as HTMLElement;
      measureContainer.innerHTML = wrapCharsInSpans(cases.join(""));

      const chars = cases.map((character, j) => ({
        character,
        width: getCharacterWidthInContainer(measureContainer, character, j)
      }));

      return {
        blobProps,
        measure,
        measureContainer,
        chars
      };
    });
  });

  it("can get character ranges", () => {
    for (const { chars, measure, measureContainer } of testcases) {
      const ranges = measure.getCharacterRanges(measureContainer);
      let offset = 0;

      for (const [i, range] of ranges.entries()) {
        expect(range.end - range.start).to.be.greaterThan(0);
        isWithinOne(range.start, offset);
        offset += chars[i].width;
        isWithinOne(range.end, offset);
      }
    }
  });

  it("can get character offset", () => {
    for (const { chars, measure, measureContainer } of testcases) {
      let offset = 0;
      for (const [i, character] of chars.entries()) {
        isWithinOne(
          measure.getCharacterOffset(i, measureContainer, true),
          offset
        );
        offset += character.width;
        isWithinOne(
          measure.getCharacterOffset(i, measureContainer, false),
          offset
        );
      }
    }
  });

  it("can get character from MouseEvent", () => {
    for (const { measure, measureContainer } of testcases) {
      const offsetLeft = measureContainer
        .querySelector('[data-char="0"]')!
        .getBoundingClientRect().left;
      const ranges = measure.getCharacterRanges(measureContainer);

      for (const [i, range] of ranges.entries()) {
        const eventStart = createMouseMoveEvent({
          x: offsetLeft + range.start + 1,
          y: 0 // doesn't matter
        });

        let character = measure.getCharacter(measureContainer, eventStart);

        expect(character).to.equal(i);

        const eventEnd = createMouseMoveEvent({
          x: offsetLeft + range.end - 1,
          y: 0 // doesn't matter
        });

        character = measure.getCharacter(measureContainer, eventEnd);

        expect(character).to.equal(i);
      }
    }
  });

  it("returns -1 for coordinates outside of the ranges for a cell", () => {
    for (const { measure, measureContainer } of testcases) {
      const eventStart = createMouseMoveEvent({
        x: 0,
        y: 0
      });

      let character = measure.getCharacter(measureContainer, eventStart);

      expect(character).to.equal(-1);

      const eventEnd = createMouseMoveEvent({
        x: measureContainer.getBoundingClientRect().right + 1,
        y: 0
      });

      character = measure.getCharacter(measureContainer, eventEnd);

      expect(character).to.equal(-1);
    }
  });
});
