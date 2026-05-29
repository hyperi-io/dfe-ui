import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWallpaperOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-wallpaper-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 6h8a2 2 0 0 1 2 2v8m-.58 3.409A2 2 0 0 1 18 20H6" /><path d="M4 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /><path d="M8 18V8M4.573 4.598A2 2 0 0 0 4 6v12M3 3l18 18" /></svg>;
const Memo = memo(IconWallpaperOff);
export default Memo;