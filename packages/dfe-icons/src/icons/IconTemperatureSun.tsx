import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTemperatureSun = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-temperature-sun" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 13.5a4 4 0 1 0 4 0V5a2 2 0 1 0-4 0zM4 9h4M13 16a4 4 0 1 0 0-8 4 4 0 0 0-1 .124M13 3v1M21 12h1M13 20v1M19.4 5.6l-.7.7M18.7 17.7l.7.7" /></svg>;
const Memo = memo(IconTemperatureSun);
export default Memo;