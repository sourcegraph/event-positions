# DOM Positions

## Usage

```typescript
const getCodeElementFromTarget = (target: HTMLElement): HTMLElement | null => {
  const row = target.closest("tr");
  if (!row) {
    return null;
  }

  return row.children.item(1) as HTMLElement;
};

const getCodeElementFromLineNumber = (
  b: HTMLElement,
  line: number
): HTMLElement | null => {
  const numCell = b.querySelector(`[data-line="${line + 1}"]`);
  if (!numCell) {
    return null;
  }

  const row = numCell.closest("tr") as HTMLElement;
  if (!row) {
    return null;
  }

  return row.children.item(1) as HTMLElement | null;
};

const getLineNumberFromCodeElement = (codeCell: HTMLElement): number => {
  const row = codeCell.closest("tr");
  if (!row) {
    return -1;
  }

  const numCell = row.children.item(0) as HTMLElement;
  if (!numCell || (numCell && !numCell.dataset.line)) {
    return -1;
  }

  return parseInt(numCell.dataset.line as string, 10) - 1;
};

const positionListener = createPositionListener(blobProps.element, blobProps);

positionListener.subscribe(({ position }) => console.log(position)); // { line: ..., character: ... }
```
