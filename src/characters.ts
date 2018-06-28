import { getElementOffset, getTextNodes } from "./dom";

export interface CoordinateRange {
  start: number;
  end: number;
}

export const FULL_LINE = Infinity;

export class Characters {
  private container: HTMLElement;

  private widths = new Map<number, number>();

  private internalTeardown: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public teardown = (): void => {
    if (this.internalTeardown) {
      this.internalTeardown();
    }
  };

  public getCharacterRanges = (elem: HTMLElement): CoordinateRange[] => {
    const ranges: CoordinateRange[] = [];

    let left = 0;
    for (const columnWidth of this.getCharacterWidths(elem)) {
      ranges.push({ start: left, end: left + columnWidth });

      left += columnWidth;
    }

    return ranges;
  };

  public getCharacterOffset = (
    character: number,
    elem: HTMLElement,
    atStart: boolean
  ): number => {
    const ranges = this.getCharacterRanges(elem);
    if (ranges.length === 0) {
      return 0;
    }

    let at: "start" | "end" = atStart ? "start" : "end";

    let range = ranges[character];
    // Be lenient for requests for characters after the end of the line. Language servers sometimes send
    // this as the end of a range.
    if ((!range && character === ranges.length) || character === FULL_LINE) {
      range = ranges[ranges.length - 1];
      at = "end";
    } else if (!range) {
      throw new Error(
        `Out of bounds: attempted to get range of character ${character} for line of length ${
          ranges.length
        }`
      );
    }

    return range[at];
  };

  public getCharacter = (elem: HTMLElement, event: MouseEvent): number => {
    const paddingLeft = getElementOffset(elem, true);

    const x = event.clientX - paddingLeft;

    const character = this.getCharacterRanges(elem).findIndex(
      // In the future, we should think about how to handle events at a position that lies exectly on
      // the line between two characters. Right now, it'll go to the first character.
      range => x >= range.start && x <= range.end
    );

    return character;
  };

  private getCharacterWidths(elem: HTMLElement): number[] {
    const nodes = getTextNodes(elem as Node);

    const widths: number[] = [];
    for (const node of nodes) {
      if (!node.nodeValue) {
        continue;
      }

      for (let i = 0; i < node.nodeValue.length; i++) {
        const code = node.nodeValue.charCodeAt(i);

        widths.push(this.getCharacterWidth(code));
      }
    }

    return widths;
  }

  private getCharacterWidth(charCode: number): number {
    if (this.widths.has(charCode)) {
      return this.widths.get(charCode) as number;
    }

    const elem = document.createElement("div");

    elem.innerHTML = String.fromCharCode(charCode);

    // Ensure we preserve whitespace and only get the width of the character
    elem.style.visibility = "hidden";
    elem.style.height = "0";
    elem.style.cssFloat = "left";

    this.container.appendChild(elem);

    const width = elem.getBoundingClientRect().width;

    this.container.removeChild(elem);

    this.widths.set(charCode, width);

    return width;
  }
}
