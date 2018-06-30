import isEqual from "lodash/isEqual";

import { fromEvent, Observable } from "rxjs";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";

import { Position } from "vscode-languageserver-types";

import { Characters, Token } from "./characters";
import { propertyIsDefined } from "./utils/types";

export type SupportedMouseEvents = "mousemove" | "click";

const mouseEventTypes: SupportedMouseEvents[] = ["mousemove", "click"];

export interface PositionEvent extends Position {
  /** The token the event occured at. */
  token: Token | null;
  /** The original event. */
  event: MouseEvent;
  /* The type of event. */
  eventType: SupportedMouseEvents;
}

const fromMouseEvent = (
  element: HTMLElement,
  eventType: SupportedMouseEvents
) => fromEvent<MouseEvent>(element, eventType);

export interface PositionsProps {
  /**
   * Gets the element containing
   *
   * @param
   */
  getCodeElementFromTarget: (target: HTMLElement) => HTMLElement | null;
  getCodeElementFromLineNumber: (
    blob: HTMLElement,
    line: number
  ) => HTMLElement | null;
  getLineNumberFromCodeElement: (target: HTMLElement) => number;
}

export type PositionListener = Observable<PositionEvent>;

export function createPositionListener(
  element: HTMLElement,
  props: PositionsProps
): PositionListener {
  const firstCell = props.getCodeElementFromLineNumber(element, 0);
  if (!firstCell) {
    throw new Error("Cannot create annotator for element with no rows");
  }

  const characters = new Characters(firstCell);

  return new Observable<PositionEvent>(observer => {
    const addEventListener = (eventType: SupportedMouseEvents) =>
      observer.add(
        fromMouseEvent(element, eventType)
          .pipe(
            map(event => ({
              event,
              elem: props.getCodeElementFromTarget(event.target as HTMLElement)
            })),
            filter(propertyIsDefined("elem")),
            map(({ event, elem }) => {
              const { token, character } = characters.getToken(elem, event);

              return {
                event,
                line: props.getLineNumberFromCodeElement(elem),
                character,
                token
              };
            }),
            distinctUntilChanged(
              (a, b) => a.line === b.line && isEqual(a.token, b.token)
            )
          )
          .subscribe(({ event, token, line, character }) =>
            observer.next({
              line,
              character,
              token,
              event,
              eventType
            })
          )
      );

    for (const eventType of mouseEventTypes) {
      addEventListener(eventType);
    }
  });
}
