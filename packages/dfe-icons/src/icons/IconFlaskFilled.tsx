import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFlaskFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-flask" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M15 2a1 1 0 0 1 0 2v4.826l3.932 10.814.034.077a1.7 1.7 0 0 1-.002 1.193l-.07.162a1.7 1.7 0 0 1-1.213.911L17.5 22h-11l-.181-.017a1.7 1.7 0 0 1-1.285-2.266l.039-.09L9 8.823V4a1 1 0 1 1 0-2zm-2 2h-2v4h2z" /></svg>;
const Memo = memo(IconFlaskFilled);
export default Memo;