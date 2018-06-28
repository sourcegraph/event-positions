import isEqual from 'lodash/isEqual';

import {Observable, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';

import {fromEvent} from 'rxjs';
import {Position} from 'vscode-languageserver-types';

import {Characters} from './characters';
import {propertyIsDefined} from './utils/types';

export type SupportedMouseEvents = 'mousemove' | 'click';

const mouseEventTypes: SupportedMouseEvents[] = ['mousemove', 'click'];

export interface PositionEvent {
  position: Position;
  event: MouseEvent;
  eventType: SupportedMouseEvents;
}

const fromMouseEvent = (
  element: HTMLElement,
  eventType: SupportedMouseEvents,
) => fromEvent<MouseEvent>(element, eventType);

export interface PositionsProps {
  /** The DOM element to be monitored. */
  element: HTMLElement;

  /**
   * Gets the element containing
   *
   * @param
   */
  getCodeElementFromTarget: (target: HTMLElement) => HTMLElement | null;
  getCodeElementFromLineNumber: (
    blob: HTMLElement,
    line: number,
  ) => HTMLElement | null;
  getLineNumberFromCodeElement: (target: HTMLElement) => number;
}

export type PositionListener = Observable<PositionEvent>;

export function createPositionListener(
  element: HTMLElement,
  props: PositionsProps,
): PositionListener {
  const firstCell = props.getCodeElementFromLineNumber(element, 0);
  if (!firstCell) {
    throw new Error('Cannot create annotator for element with no rows');
  }

  const characters = new Characters(firstCell);

  return new Observable<PositionEvent>(observer => {
    const addEventListener = (eventType: SupportedMouseEvents) =>
      observer.add(
        fromMouseEvent(element, eventType)
          .pipe(
            map(event => ({
              event,
              elem: props.getCodeElementFromTarget(event.target as HTMLElement),
            })),
            filter(propertyIsDefined('elem')),
            map(({event, elem}) => ({
              event,
              position: {
                line: props.getLineNumberFromCodeElement(elem),
                character: characters.getCharacter(elem, event),
              },
            })),
            distinctUntilChanged((a, b) => isEqual(a.position, b.position)),
          )
          .subscribe(({event, position}) =>
            observer.next({
              position,
              event,
              eventType,
            }),
          ),
      );

    for (const eventType of mouseEventTypes) {
      addEventListener(eventType);
    }
  });
}
