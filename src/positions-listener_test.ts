import {map} from 'rxjs/operators';
import {TestScheduler} from 'rxjs/testing';

import {createPositionListener} from './positions-listener';
import {BlobProps, DOM} from './testutils/dom';
import {createClickEvent, createMouseMoveEvent} from './testutils/mouse';

const getScheduler = () => new TestScheduler(chai.assert.deepEqual);

describe('PositionListener', () => {
  const dom = new DOM();
  after(dom.cleanup);

  let testcases: Array<{
    blobProps: BlobProps;
    lines: string[];
  }> = [];

  before(() => {
    testcases = dom.createBlobs().map(blobProps => {
      const lines = Array.from(
        blobProps.element.querySelectorAll('tr td:nth-of-type(2)')!,
      )
        .map(td => td.textContent || '')
        // Only test the first 50 lines to not kill the test runner
        .slice(0, 1);

      return {
        blobProps,
        lines,
      };
    });
  });

  it('emits with the correct position on hovers', () => {
    for (const {blobProps} of testcases) {
      const scheduler = getScheduler();

      scheduler.run(({cold, expectObservable}) => {
        const positions = createPositionListener(blobProps.element, blobProps);

        const positionsFromEvents = positions.pipe(
          map(({position}) => position),
        );

        const diagram = '-abcdefg';
        const inputMap = {
          a: 0,
          b: 1,
          c: 2,
          d: 3,
          e: 4,
          f: 5,
          g: 6,
        };

        // Line 18 because it has a tab at the beginning (17 because Position is 0-indexed)
        const line = 17;

        const outputMap = {
          a: {line, character: 0},
          b: {line, character: 1},
          c: {line, character: 2},
          d: {line, character: 3},
          e: {line, character: 4},
          f: {line, character: 5},
          g: {line, character: 6},
        };

        const cell = blobProps.getCodeElementFromLineNumber(
          blobProps.element,
          17,
        ) as HTMLEmbedElement;

        cold(diagram, inputMap).subscribe(i => {
          const char = cell.querySelector(`[data-char="${i}"]`) as HTMLElement;

          const rect = char.getBoundingClientRect();

          const event = createMouseMoveEvent({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });

          char.dispatchEvent(event);
        });

        expectObservable(positionsFromEvents).toBe(diagram, outputMap);
      });
    }
  });

  it('emits with character as -1 when an event happens before or after the characters', () => {
    for (const {blobProps} of testcases) {
      const scheduler = getScheduler();

      scheduler.run(({cold, expectObservable, flush}) => {
        const positions = createPositionListener(blobProps.element, blobProps);

        const positionsFromEvents = positions.pipe(
          map(({position}) => position),
        );

        const diagram = '-abcdefg';
        const inputMap = {
          a: 6,
          b: 7,
          c: 8,
          d: 9,
          e: 10,
          f: 11,
          g: 12,
        };

        const noChar = (line: number) => ({line, character: -1});

        const outputMap = {
          a: noChar(6),
          b: noChar(7),
          c: noChar(8),
          d: noChar(9),
          e: noChar(10),
          f: noChar(11),
          g: noChar(12),
        };

        cold<number>(diagram, inputMap).subscribe(i => {
          const cell = blobProps.getCodeElementFromLineNumber(
            blobProps.element,
            i,
          ) as HTMLEmbedElement;

          const char = cell.querySelector('[data-char="0"]') as HTMLElement;

          const rect = char.getBoundingClientRect();

          const event = createMouseMoveEvent({
            x: rect.left - 10,
            y: 0, // doesn't matter
          });

          char.dispatchEvent(event);
        });

        expectObservable(positionsFromEvents).toBe(diagram, outputMap);
      });
    }
  });

  it('emits with the correct position on clicks', () => {
    for (const {blobProps} of testcases) {
      const scheduler = getScheduler();

      scheduler.run(({cold, expectObservable, flush}) => {
        const positions = createPositionListener(blobProps.element, blobProps);

        const positionsFromEvents = positions.pipe(
          map(({position}) => position),
        );

        const diagram = '-abcdefg';
        const inputMap = {
          a: 6,
          b: 7,
          c: 8,
          d: 9,
          e: 10,
          f: 11,
          g: 12,
        };

        const line = 24;

        const outputMap = {
          a: {line, character: 6},
          b: {line, character: 7},
          c: {line, character: 8},
          d: {line, character: 9},
          e: {line, character: 10},
          f: {line, character: 11},
          g: {line, character: 12},
        };

        cold<number>(diagram, inputMap).subscribe(i => {
          const cell = blobProps.getCodeElementFromLineNumber(
            blobProps.element,
            line,
          ) as HTMLEmbedElement;

          const char = cell.querySelector(`[data-char="${i}"]`) as HTMLElement;

          const rect = char.getBoundingClientRect();

          const event = createClickEvent({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });

          char.dispatchEvent(event);
        });

        expectObservable(positionsFromEvents).toBe(diagram, outputMap);
      });
    }
  });

  it('emits with the correct eventType', () => {
    for (const {blobProps} of testcases) {
      const scheduler = getScheduler();

      scheduler.run(({cold, expectObservable, flush}) => {
        const positions = createPositionListener(blobProps.element, blobProps);

        const positionsFromEvents = positions.pipe(
          map(({eventType}) => eventType),
        );

        const diagram = '-ab';
        const inputMap = {
          a: createMouseMoveEvent({x: 0, y: 0}),
          b: createClickEvent({x: 0, y: 0}),
        };

        const outputMap = {
          a: 'mousemove',
          b: 'click',
        };

        const elem = blobProps.getCodeElementFromLineNumber(
          blobProps.element,
          0,
        ) as HTMLElement;

        cold<MouseEvent>(diagram, inputMap).subscribe(event => {
          elem.dispatchEvent(event);
        });

        expectObservable(positionsFromEvents).toBe(diagram, outputMap);
      });
    }
  });
});
