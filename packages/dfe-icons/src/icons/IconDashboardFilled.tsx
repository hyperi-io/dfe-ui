import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDashboardFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-dashboard" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 2.954a10 10 0 0 1 6.222 17.829A1 1 0 0 1 17.6 21H6.4a1 1 0 0 1-.622-.217A10 10 0 0 1 12 2.954m4.207 5.839a1 1 0 0 0-1.414 0l-2.276 2.274a2.003 2.003 0 0 0-2.514 1.815L10 13a2 2 0 1 0 3.933-.517l2.274-2.276a1 1 0 0 0 0-1.414" /></svg>;
const Memo = memo(IconDashboardFilled);
export default Memo;