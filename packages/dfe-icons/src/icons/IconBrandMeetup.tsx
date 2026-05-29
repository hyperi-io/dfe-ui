import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandMeetup = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-meetup" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M5.455 10.82C6.39 8.657 8.5 7 11 7c2.104 0 2.844 1.915 2 4l-2 6M6.981 7 3 16.914" /><path d="M13 11c.937-2.16 3.071-3.802 5.42-3.972 2.104 0 3.128 1.706 2.284 3.792l-2.454 6.094C17.397 18.59 19 19.5 21 19" /></svg>;
const Memo = memo(IconBrandMeetup);
export default Memo;