import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandSlack = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-slack" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 12V6a2 2 0 0 1 4 0v6m0-2a2 2 0 1 1 2 2h-6M12 12h6a2 2 0 0 1 0 4h-6m2 0a2 2 0 1 1-2 2v-6M12 12v6a2 2 0 0 1-4 0v-6m0 2a2 2 0 1 1-2-2h6M12 12H6a2 2 0 0 1 0-4h6m-2 0a2 2 0 1 1 2-2v6" /></svg>;
const Memo = memo(IconBrandSlack);
export default Memo;