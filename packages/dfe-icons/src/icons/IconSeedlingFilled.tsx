import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSeedlingFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-seedling" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M6 3a7 7 0 0 1 6.95 6.155A6.97 6.97 0 0 1 18 7h3a1 1 0 0 1 1 1v1a7 7 0 0 1-7 7h-2v4a1 1 0 0 1-2 0v-7H9a7 7 0 0 1-7-7V4a1 1 0 0 1 1-1z" /></svg>;
const Memo = memo(IconSeedlingFilled);
export default Memo;