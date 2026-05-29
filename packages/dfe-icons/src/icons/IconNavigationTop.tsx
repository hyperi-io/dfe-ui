import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconNavigationTop = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-navigation-top" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M16.54 19.977a.34.34 0 0 0 .357-.07.33.33 0 0 0 .084-.35L12 9 7.018 19.557a.33.33 0 0 0 .084.35.34.34 0 0 0 .357.07L12 18.5zM12 3v2" /></svg>;
const Memo = memo(IconNavigationTop);
export default Memo;