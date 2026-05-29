import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCopyOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-copy-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M19.414 19.415A2 2 0 0 1 18 20h-8a2 2 0 0 1-2-2v-8c0-.554.225-1.055.589-1.417M12 8h6a2 2 0 0 1 2 2v6M16 8V6a2 2 0 0 0-2-2H8m-3.418.59C4.222 4.95 4 5.45 4 6v8a2 2 0 0 0 2 2h2M3 3l18 18" /></svg>;
const Memo = memo(IconCopyOff);
export default Memo;