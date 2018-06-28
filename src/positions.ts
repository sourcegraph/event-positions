import {Characters} from './characters';
import {PositionsProps} from './positions-listener';

/**
 *  Get the character of an that an event happened at.
 *
 *  @returns character is the 0-indexed position in a line or -1 if the event
 *  happened before or after the characters in a line.
 */
export function getCharacter(
  event: MouseEvent,
  props: Pick<PositionsProps, 'getCodeElementFromTarget'>,
): number {
  const element = props.getCodeElementFromTarget(event.target as HTMLElement);
  if (!element) {
    return -1;
  }

  const characters = new Characters(element as HTMLElement);

  return characters.getCharacter(element, event);
}

/**
 * The start and end position in pixels.
 *
 * To use this for positioning an element to span a range of characters:
 * - Use `start` as `element.style.left`
 * - Use `end - start` as `element.style.width`
 */
export interface PixelPosition {
  /** The start position in pixels. Use this as style.left for positioning elements. */
  start: number;
  /** The end position in pixels. */
  end: number;
}

/**
 * Gets the PixelRange of two characters in an element.
 */
export function getCharactersPixelRange(
  /** The element the characters are in. This is needed to determine character widths so that we can find the position. */
  element: HTMLElement,
  /** The start character. (0-indexed) */
  start: number,
  /** The end character. (0-indexed) */
  end: number,
): PixelPosition {
  const characters = new Characters(element);

  return {
    start: characters.getCharacterOffset(start, element, true),
    end: characters.getCharacterOffset(end, element, false),
  };
}
