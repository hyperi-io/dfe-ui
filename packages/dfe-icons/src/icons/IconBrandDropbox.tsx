import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandDropbox = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-dropbox" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7.5 10.625 3 7.812 7.5 5 12 7.813m-4.5 2.812L12 7.812m-4.5 2.813L3 13.448l4.5 2.802m0-5.625 4.5 2.823m0-5.636 4.5 2.791L21 7.791 16.5 5 12 7.813m-4.5 8.438 4.5-2.802m-4.5 2.802v1.123l4.5 2.627 4.5-2.627v-1.123M12 13.449l4.5-2.823 4.5 2.823-4.5 2.802M12 13.449l4.5 2.802" /></svg>;
const Memo = memo(IconBrandDropbox);
export default Memo;