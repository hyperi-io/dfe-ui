import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMilitaryRankFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-military-rank" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m12.555 2.168 6 4A1 1 0 0 1 19 7v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V7a1 1 0 0 1 .445-.832l6-4a1 1 0 0 1 1.11 0m-.108 12.938a1 1 0 0 0-.894 0l-2 1a1 1 0 0 0-.447 1.341l.058.102a1 1 0 0 0 1.283.345L12 17.118l1.553.776a1 1 0 0 0 .894-1.788zm0-4a1 1 0 0 0-.894 0l-2 1a1 1 0 0 0-.447 1.341l.058.102a1 1 0 0 0 1.283.345L12 13.118l1.553.776a1 1 0 0 0 .894-1.788zm0-4a1 1 0 0 0-.894 0l-2 1a1 1 0 0 0-.447 1.341l.058.102a1 1 0 0 0 1.283.345L12 9.118l1.553.776a1 1 0 0 0 .894-1.788z" /></svg>;
const Memo = memo(IconMilitaryRankFilled);
export default Memo;