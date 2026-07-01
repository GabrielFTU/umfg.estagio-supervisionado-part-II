import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export function Barcode({
  value, height = 40, width = 1.6, fontSize = 11, displayValue = false,
}: {
  value: string;
  height?: number;
  width?: number;
  fontSize?: number;
  displayValue?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: 'CODE128',
        height,
        width,
        fontSize,
        displayValue,
        margin: 0,
      });
    } catch {
    }
  }, [value, height, width, fontSize, displayValue]);

  if (!value) return null;
  return <svg ref={ref} />;
}
