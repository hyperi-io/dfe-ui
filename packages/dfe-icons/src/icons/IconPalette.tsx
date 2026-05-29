import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPalette = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-palette" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 21a9 9 0 0 1 0-18c4.97 0 9 3.582 9 8 0 1.06-.474 2.078-1.318 2.828S17.693 15 16.5 15H14a2 2 0 0 0-1 3.75A1.3 1.3 0 0 1 12 21" /><path d="M7.5 10.5a1 1 0 1 0 2 0 1 1 0 1 0-2 0M11.5 7.5a1 1 0 1 0 2 0 1 1 0 1 0-2 0M15.5 10.5a1 1 0 1 0 2 0 1 1 0 1 0-2 0" /></svg>;
const Memo = memo(IconPalette);
export default Memo;