# DOM Positions

## Usage

```typescript
const getCodeElementFromTarget = (target: HTMLElement): HTMLElement | null => {
  // ...
};

const getCodeElementFromLineNumber = (
  blob: HTMLElement,
  line: number
): HTMLElement | null => {
  // ...
};

const getLineNumberFromCodeElement = (codeCell: HTMLElement): number => {
  // ...
};

const positionListener = createPositionListener(blobProps.element, {
  getCodeElementFromTarget,
  getCodeElementFromLineNumber,
  getLineNumberFromCodeElement
});

positionListener.subscribe(({ position }) => console.log(position)); // { line: ..., character: ... }
```
