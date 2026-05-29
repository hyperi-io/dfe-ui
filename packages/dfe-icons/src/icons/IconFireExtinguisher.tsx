import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFireExtinguisher = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-fire-extinguisher" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 7a4 4 0 0 1 4 4v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9a4 4 0 0 1 4-4M9 16h6M12 7V4M16 5l-4-1 4-1M12 4H9a3 3 0 0 0-3 3" /></svg>;
const Memo = memo(IconFireExtinguisher);
export default Memo;