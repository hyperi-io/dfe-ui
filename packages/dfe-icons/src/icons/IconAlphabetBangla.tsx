import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAlphabetBangla = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-alphabet-bangla" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M14 12c.904-.027 3 2 3 7M10 11c0-.955 0-2 .786-2.677 1.262-1.089 3.025.55 3.2 2.06.086.741-.215 3.109-1.489 4.527-.475.53-.904.992-1.711 1.074-.75.076-1.364-.122-2.076-.588-1.138-.743-2.327-1.997-3.336-3.73C4.296 9.817 3.714 8.553 3 6" /><path d="M7.37 7.072c.769-.836 5.246-4.094 8.4-.202.382.472.573.708.9 1.63.326.921.326 1.562.326 2.844V19M17 10c0-1.989 1.5-4 4-4" /></svg>;
const Memo = memo(IconAlphabetBangla);
export default Memo;