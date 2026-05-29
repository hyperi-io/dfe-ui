import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPremiumRights = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-premium-rights" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" /><path d="M13.867 9.75c-.246-.48-.708-.769-1.2-.75h-1.334C10.597 9 10 9.67 10 10.5c0 .827.597 1.499 1.333 1.499h1.334c.736 0 1.333.671 1.333 1.5 0 .828-.597 1.499-1.333 1.499h-1.334c-.492.019-.954-.27-1.2-.75M12 7v2M12 15v2" /></svg>;
const Memo = memo(IconPremiumRights);
export default Memo;