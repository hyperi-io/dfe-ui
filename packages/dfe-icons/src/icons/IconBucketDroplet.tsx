import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBucketDroplet = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-bucket-droplet" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m5 16 1.465 1.638a2 2 0 1 1-3.015.099zM13.737 9.737c2.299-2.3 3.23-5.095 2.081-6.245s-3.945-.217-6.244 2.082-3.231 5.095-2.082 6.244 3.946.218 6.245-2.081" /><path d="M7.492 11.818c.362.362.768.676 1.208.934l6.895 4.047c1.078.557 2.255-.075 3.692-1.512s2.07-2.614 1.512-3.692q-.557-1.077-4.047-6.895a6 6 0 0 0-.934-1.208" /></svg>;
const Memo = memo(IconBucketDroplet);
export default Memo;